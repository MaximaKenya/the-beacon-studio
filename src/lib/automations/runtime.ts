import { randomBytes, randomUUID } from "crypto";
import { allocateMonthly, quoteBundle, type BillingInterval } from "@/automations/pricing";
import { templateById } from "@/automations/templates/public";
import { parseTemplateConfig } from "@/automations/templates/schema";
import { upcomingSlots } from "@/automations/slots";
import { upsertClient } from "@/lib/clients";
import { channelReadiness, deliver } from "@/lib/automations/channels";
import { SANDBOX_EMAIL } from "@/lib/automations/setup-guides";
import { markChargePaid, recordReview, runEngine } from "@/lib/automations/engine";
import { addLog, instancesForEmail, loadAutomations, saveAutomations } from "@/lib/automations/store";
import { emptyDoc, type AutomationDoc, type AutomationInstance } from "@/lib/automations/types";
import { mutateJsonFile } from "@/lib/storage";
import { jobClaimable } from "@/lib/tick-claim";
import { createPayment, updatePaymentById, type PaymentRecord } from "@/lib/payments";
import { beaconPaystackMetadata, beaconPaystackReference, isPaystackConfigured, paystackSecret } from "@/lib/paystack";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

function slugFor(templateId: string): string {
  return `${templateId}-${randomBytes(4).toString("hex")}`;
}

function blankStats(): AutomationInstance["stats"] {
  return { runs: 0, leads: 0, messages: 0, payments: 0, reminders: 0 };
}

export async function activateInstances(ids: string[], origin: string): Promise<void> {
  const doc = await loadAutomations();
  const now = new Date();
  for (const id of ids) {
    const instance = doc.instances.find((item) => item.id === id);
    if (!instance || instance.status === "active") continue;
    const resuming = instance.status === "paused";
    instance.status = "active";
    if (resuming) {
      instance.updatedAt = now.toISOString();
      addLog(doc, instance.id, "Resumed.");
      continue;
    }
    instance.activatedAt = now.toISOString();
    instance.updatedAt = instance.activatedAt;
    const days = instance.billing === "annual" ? 365 : 30;
    instance.periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
    doc.jobs.push({
      id: randomUUID(),
      instanceId: instance.id,
      runAt: new Date(now.getTime() + (days - 3) * 24 * 60 * 60 * 1000).toISOString(),
      status: "due",
      kind: "renewal",
    });
    await runEngine({ doc, instance, mode: "activate", origin, now });
    addLog(doc, instance.id, "Active. It will run on the next scheduled check.");
  }
  await saveAutomations(doc);
}

export async function fulfillAutomationPayment(payment: PaymentRecord, origin: string): Promise<void> {
  if (payment.status !== "success") return;
  if (payment.automationChargeId) {
    const doc = await loadAutomations();
    if (markChargePaid(doc, payment.automationChargeId)) await saveAutomations(doc);
  }
  if (payment.automationInstanceIds?.length) await activateInstances(payment.automationInstanceIds, origin);
}

async function claimDueJobIds(now: Date): Promise<string[]> {
  const claimed: string[] = [];
  await mutateJsonFile<AutomationDoc>("automations.json", emptyDoc(), (doc) => {
    claimed.length = 0;
    for (const job of doc.jobs) {
      if (claimed.length >= 40) break;
      if (!jobClaimable(job, now.getTime())) continue;
      job.status = "running";
      job.claimedAt = now.toISOString();
      claimed.push(job.id);
    }
    return doc;
  });
  return claimed;
}

export async function runDueJobs(origin: string): Promise<{ ran: number }> {
  await loadAutomations();
  const now = new Date();
  const claimedIds = new Set(await claimDueJobIds(now));
  if (claimedIds.size === 0) return { ran: 0 };
  const doc = await loadAutomations();
  let ran = 0;
  for (const job of doc.jobs) {
    if (!claimedIds.has(job.id) || job.status === "done" || job.status === "cancelled") continue;
    const instance = doc.instances.find((item) => item.id === job.instanceId);
    if (!instance || instance.status !== "active") continue;
    if (job.kind === "renewal") {
      addLog(doc, instance.id, `Renewal is due by ${instance.periodEnd?.slice(0, 10) || "the period end"}. Pay from the portal or ask for an invoice.`);
      job.status = "done";
      ran += 1;
      continue;
    }
    if (job.kind === "appointment-reminder") {
      const booking = doc.bookings.find((item) => item.id === job.bookingId && item.status === "confirmed");
      if (booking) {
        const sent = await deliver({
          instance,
          email: booking.email,
          phone: booking.phone,
          subject: `Reminder — ${instance.businessName}`,
          text: `Hello ${booking.name}, this is your ${job.label || ""} reminder for ${new Date(booking.start).toUTCString()}.`,
          idempotencyKey: `automation-reminder/${job.id}`,
        });
        instance.stats.messages += 1;
        instance.stats.reminders += 1;
        addLog(doc, instance.id, `Appointment reminder for ${booking.name}. ${sent.note}`);
      }
      job.status = "done";
      ran += 1;
      continue;
    }
    await runEngine({ doc, instance, mode: "job", job, origin, now });
    job.status = "done";
    ran += 1;
  }
  await saveAutomations(doc);
  return { ran };
}

export async function dispatchHook(slug: string, kind: string, body: Record<string, unknown>, origin: string) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.slug === slug);
  if (!instance) return { ok: false, status: 404, message: "Automation not found." };
  const template = templateById(instance.templateId);
  if (!template || (template.hook !== kind && kind !== template.hook)) {
    return { ok: false, status: 404, message: "This link does not match the automation." };
  }
  if (instance.status !== "active") return { ok: false, status: 409, message: "This automation is not active yet." };
  const result = await runEngine({ doc, instance, mode: "hook", body, origin });
  await saveAutomations(doc);
  return { ok: result.ok, status: result.ok ? 200 : 400, message: result.message, reply: result.reply };
}

type CheckoutInput = {
  templateIds: string[];
  configs: Record<string, unknown>;
  billing: BillingInterval;
  ownerName: string;
  ownerEmail: string;
  businessName: string;
  pay: "paystack" | "invoice";
  origin: string;
};

export async function startBundleCheckout(input: CheckoutInput): Promise<
  | { ok: true; url?: string; message: string; email: string }
  | { ok: false; status: number; message: string }
> {
  const email = normalizeEmail(input.ownerEmail);
  if (!isValidEmail(email)) return { ok: false, status: 400, message: "Enter a valid email for the receipt and the portal." };
  if (!input.ownerName.trim() || !input.businessName.trim()) {
    return { ok: false, status: 400, message: "Add your name and the business name." };
  }
  const quote = quoteBundle(input.templateIds, { billing: input.billing });
  if (!quote || quote.count === 0) return { ok: false, status: 400, message: "Pick at least one automation." };

  const configs = new Map<string, Record<string, unknown>>();
  for (const id of quote.items.map((item) => item.id)) {
    const parsed = parseTemplateConfig(id, input.configs[id] ?? {});
    if (!parsed.ok) return { ok: false, status: 400, message: `${templateById(id)?.name || id}: ${parsed.message}` };
    configs.set(id, parsed.config);
  }

  const shares = allocateMonthly(
    quote.items.map((item) => item.monthlyKes),
    quote.recurringMonthlyKes
  );
  const client = await upsertClient({ email, name: input.ownerName.trim(), company: input.businessName.trim() });
  const doc = await loadAutomations();
  const bundleId = randomUUID();
  const now = new Date().toISOString();
  const created: AutomationInstance[] = [];
  quote.items.forEach((item, index) => {
    const instance: AutomationInstance = {
      id: randomUUID(),
      templateId: item.id,
      slug: slugFor(item.id),
      ownerName: input.ownerName.trim(),
      ownerEmail: email,
      businessName: input.businessName.trim(),
      clientId: client.id,
      status: "pending_payment",
      config: configs.get(item.id) || {},
      monthlyKes: shares[index] ?? item.monthlyKes,
      monthlyUsd: item.monthlyUsd,
      setupFeeKes: item.setupKes,
      billing: input.billing,
      bundleId,
      createdAt: now,
      updatedAt: now,
      stats: blankStats(),
      notes: [],
    };
    doc.instances.push(instance);
    created.push(instance);
    addLog(doc, instance.id, "Waiting for payment.");
  });
  await saveAutomations(doc);

  const ids = created.map((item) => item.id);
  const label = quote.items.map((item) => item.name).join(", ");
  if (input.pay === "invoice") {
    await createPayment({
      provider: "bank",
      status: "pending",
      mode: "invoice",
      tierId: "automation-bundle",
      tierName: label.slice(0, 140),
      amount: quote.dueKes,
      currency: "KES",
      depositPercent: 100,
      payerEmail: email,
      payerName: input.ownerName.trim(),
      automationInstanceIds: ids,
      note: `${input.businessName.trim()} asked for an invoice. KES ${quote.dueKes.toLocaleString("en-KE")} (${input.billing}).`,
    });
    return {
      ok: true,
      email,
      message: "Invoice requested. The automations stay pending until the studio marks them active. Sign in to the portal with this email to watch the status.",
    };
  }

  if (!isPaystackConfigured()) {
    return { ok: false, status: 200, message: "Paystack is not configured yet. Request an invoice instead." };
  }
  const payment = await createPayment({
    provider: "paystack",
    status: "pending",
    mode: "invoice",
    tierId: "automation-bundle",
    tierName: label.slice(0, 140),
    amount: quote.dueKes,
    currency: "KES",
    depositPercent: 100,
    payerEmail: email,
    payerName: input.ownerName.trim(),
    automationInstanceIds: ids,
  });
  const reference = beaconPaystackReference(payment.id);
  await updatePaymentById(payment.id, { checkoutRequestID: reference });
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: quote.dueKes * 100,
      currency: "KES",
      reference,
      callback_url: `${input.origin}/api/paystack/callback`,
      channels: ["card", "mobile_money"],
      metadata: beaconPaystackMetadata({
        paymentId: payment.id,
        kind: "automation-bundle",
        automationInstanceIds: ids.join(","),
        billing: input.billing,
      }),
    }),
  });
  const body = (await response.json().catch(() => ({}))) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string };
  };
  if (!response.ok || !body.data?.authorization_url) {
    return { ok: false, status: 502, message: body.message || "Paystack could not start checkout." };
  }
  return { ok: true, url: body.data.authorization_url, email, message: "Redirecting to Paystack." };
}

export async function portalSnapshot(email: string) {
  const doc = await loadAutomations();
  return snapshotFor(doc, instancesForEmail(doc, email));
}

export async function adminSnapshot() {
  const doc = await loadAutomations();
  const live = doc.instances.filter((item) => !item.demo);
  const active = live.filter((item) => item.status === "active");
  const byEmail = new Map<string, AutomationInstance[]>();
  for (const instance of live) {
    const list = byEmail.get(instance.ownerEmail) || [];
    list.push(instance);
    byEmail.set(instance.ownerEmail, list);
  }
  const clients = [...byEmail.entries()].map(([email, instances]) => {
    const view = snapshotFor(doc, instances);
    return {
      email,
      name: instances[0]?.ownerName || email,
      businessName: instances[0]?.businessName || "",
      mrrKes: instances.filter((item) => item.status === "active").reduce((sum, item) => sum + item.monthlyKes, 0),
      ...view,
    };
  });
  return {
    mrrKes: active.reduce((sum, item) => sum + item.monthlyKes, 0),
    active: active.length,
    pending: live.filter((item) => item.status === "pending_payment").length,
    paused: live.filter((item) => item.status === "paused").length,
    demos: doc.instances.filter((item) => item.ownerEmail === SANDBOX_EMAIL).length,
    channels: channelReadiness(),
    clients,
    sandbox: snapshotFor(doc, doc.instances.filter((item) => item.ownerEmail === SANDBOX_EMAIL)),
  };
}

function snapshotFor(doc: AutomationDoc, instances: AutomationInstance[]) {
  const ids = new Set(instances.map((item) => item.id));
  return {
    instances: instances.map((instance) => ({
      ...instance,
      nextRun: doc.jobs
        .filter((job) => job.instanceId === instance.id && job.status === "due")
        .map((job) => job.runAt)
        .sort()[0] || null,
      hook: templateById(instance.templateId)?.hook || "none",
      page: templateById(instance.templateId)?.page || null,
    })),
    logs: doc.logs.filter((log) => ids.has(log.instanceId)).slice(-80).reverse(),
    charges: doc.charges.filter((charge) => ids.has(charge.instanceId)),
    leads: doc.leads.filter((lead) => ids.has(lead.instanceId)).slice(-40).reverse(),
    bookings: doc.bookings.filter((booking) => ids.has(booking.instanceId)),
    reviews: doc.reviews.filter((review) => ids.has(review.instanceId)),
    channels: channelReadiness(),
  };
}

export async function stopFollowUps(id: string, email?: string) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.id === id);
  if (!instance) return { ok: false, message: "Not found." };
  if (email && instance.ownerEmail !== normalizeEmail(email)) return { ok: false, message: "Not your automation." };
  let stopped = 0;
  for (const job of doc.jobs) {
    if (job.instanceId === id && job.status === "due" && (job.kind === "sequence" || job.kind === "date-reminder" || job.kind === "custom-reminder")) {
      job.status = "cancelled";
      stopped += 1;
    }
  }
  addLog(doc, id, stopped ? `Stopped ${stopped} scheduled message${stopped === 1 ? "" : "s"}.` : "No scheduled messages were waiting.");
  await saveAutomations(doc);
  return { ok: true, message: stopped ? "Follow-ups stopped." : "Nothing was scheduled." };
}

export async function setInstanceStatus(id: string, status: "active" | "paused" | "pending_payment", origin: string) {
  if (status === "active") {
    await activateInstances([id], origin);
    return;
  }
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.id === id);
  if (!instance) return;
  instance.status = status;
  instance.updatedAt = new Date().toISOString();
  addLog(doc, id, status === "paused" ? "Paused." : "Marked pending.");
  await saveAutomations(doc);
}

export async function saveInstanceConfig(id: string, config: unknown, email?: string) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.id === id);
  if (!instance) return { ok: false, message: "Not found." };
  if (email && instance.ownerEmail !== normalizeEmail(email)) return { ok: false, message: "Not your automation." };
  const parsed = parseTemplateConfig(instance.templateId, config);
  if (!parsed.ok) return parsed;
  instance.config = parsed.config;
  instance.updatedAt = new Date().toISOString();
  addLog(doc, id, "Setup updated.");
  await saveAutomations(doc);
  return { ok: true, message: "Saved." };
}

export async function addInstanceNote(id: string, text: string, author: "client" | "studio", email?: string) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.id === id);
  if (!instance) return { ok: false, message: "Not found." };
  if (email && instance.ownerEmail !== normalizeEmail(email)) return { ok: false, message: "Not your automation." };
  const note = text.trim().slice(0, 1000);
  if (!note) return { ok: false, message: "Write a note." };
  instance.notes.push({ id: randomUUID(), at: new Date().toISOString(), author, text: note });
  instance.updatedAt = new Date().toISOString();
  await saveAutomations(doc);
  return { ok: true, message: "Note saved." };
}

export async function bookingView(slug: string) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.slug === slug && item.status === "active");
  if (!instance || templateById(instance.templateId)?.page !== "book") return null;
  const taken = doc.bookings.filter((item) => item.instanceId === instance.id && item.status === "confirmed").map((item) => item.start);
  return {
    businessName: instance.businessName,
    slots: upcomingSlots(instance.config, taken),
  };
}

export async function bookSlot(slug: string, input: { start: string; name: string; email?: string; phone?: string; note?: string }, origin: string) {
  void origin;
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.slug === slug && item.status === "active");
  if (!instance) return { ok: false, message: "Booking is not open." };
  const taken = doc.bookings.filter((item) => item.instanceId === instance.id && item.status === "confirmed").map((item) => item.start);
  if (!upcomingSlots(instance.config, taken).some((slot) => slot.start === input.start)) {
    return { ok: false, message: "That slot is no longer open." };
  }
  const booking = {
    id: randomUUID(),
    instanceId: instance.id,
    start: input.start,
    name: input.name.trim(),
    ...(input.email ? { email: input.email } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.note ? { note: input.note } : {}),
    status: "confirmed" as const,
  };
  doc.bookings.push(booking);
  const start = new Date(input.start);
  for (const hours of [24, 1]) {
    const runAt = new Date(start.getTime() - hours * 60 * 60 * 1000);
    if (runAt.getTime() > Date.now()) {
      doc.jobs.push({
        id: randomUUID(),
        instanceId: instance.id,
        runAt: runAt.toISOString(),
        status: "due",
        kind: "appointment-reminder",
        bookingId: booking.id,
        label: `${hours}h`,
      });
    }
  }
  await deliver({
    instance,
    email: booking.email,
    phone: booking.phone,
    subject: `Booked — ${instance.businessName}`,
    text: `Hello ${booking.name}, you are booked for ${start.toUTCString()}. We will remind you 24 hours and 1 hour before.`,
  });
  instance.stats.messages += 1;
  addLog(doc, instance.id, `Booking for ${booking.name} at ${input.start}.`);
  await saveAutomations(doc);
  return { ok: true, message: "Booked. A confirmation is on its way." };
}

export async function submitReview(slug: string, input: { score: number; comment?: string; name?: string; email?: string }, origin: string) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.slug === slug && item.status === "active");
  if (!instance || templateById(instance.templateId)?.behavior !== "review") return { ok: false, message: "Reviews are not open." };
  const result = await recordReview(
    { doc, instance, mode: "hook", origin },
    input.score,
    input.comment || "",
    input.name || "",
    input.email || ""
  );
  await saveAutomations(doc);
  return result;
}

export async function publicInstance(slug: string, page: string) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.slug === slug && item.status === "active");
  if (!instance) return null;
  const template = templateById(instance.templateId);
  if (!template || template.page !== page) return null;
  return { businessName: instance.businessName, templateId: instance.templateId, question: String(instance.config.question || ""), categories: String(instance.config.categories || "") };
}
