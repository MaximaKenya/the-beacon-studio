import { randomBytes, randomUUID } from "crypto";
import { allocateMonthly, quoteBundle, type BillingInterval } from "@/automations/pricing";
import { templateById } from "@/automations/templates/public";
import { parseTemplateConfig } from "@/automations/templates/schema";
import { upcomingSlots } from "@/automations/slots";
import { upsertClient } from "@/lib/clients";
import { buildAnalytics } from "@/lib/automations/analytics";
import { buildActionItems } from "@/lib/automations/action-center";
import { channelReadiness, deliver, rememberDeliveries } from "@/lib/automations/channels";
import { SANDBOX_EMAIL } from "@/lib/automations/setup-guides";
import { markChargePaid, recordReview, runEngine } from "@/lib/automations/engine";
import { activateOnTrial, applyBundlePayment, endInstanceTrial, extendInstanceTrial, sendTrialWelcome, syncLedger } from "@/lib/automations/lifecycle";
import { addAdminLog, addLog, instancesForEmail, loadAutomations, saveAutomations } from "@/lib/automations/store";
import { extendTrialEnd, TRIAL_DAYS, trialDaysRemaining } from "@/lib/automations/trial";
import { queueCounts } from "@/lib/notify-usage";
import { foundersLockFor } from "@/lib/revenue-requests";
import { adminReferrals, portalReferral, recordReferralSignup, settleReferralsForPayment } from "@/lib/referrals";
import { TRIAL_STAGE_LABEL, trialPortalStage } from "@/lib/automations/trial-sequence";
import { emptyDoc, type AutomationDoc, type AutomationInstance } from "@/lib/automations/types";
import { mutateJsonFile } from "@/lib/storage";
import { jobClaimable } from "@/lib/tick-claim";
import { createPayment, listPayments, updatePaymentById, type PaymentRecord } from "@/lib/payments";
import { beaconPaystackMetadata, beaconPaystackReference, isPaystackConfigured, paystackSecret } from "@/lib/paystack";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { formatBookingWhen } from "@/lib/time";

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
  if (payment.automationInstanceIds?.length) {
    await activateInstances(payment.automationInstanceIds, origin);
    const paid = await loadAutomations();
    applyBundlePayment(paid, payment.automationInstanceIds);
    await saveAutomations(paid);
    if (payment.payerEmail) await settleReferralsForPayment(payment.payerEmail);
  }
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
    if (!instance || instance.status !== "active") {
      job.status = "cancelled";
      continue;
    }
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
          text: `Hello ${booking.name}, this is your ${job.label || ""} reminder for ${formatBookingWhen(booking.start)}.`,
          idempotencyKey: `automation-reminder/${job.id}`,
        });
        rememberDeliveries(doc, instance.id, sent, now);
        instance.stats.messages += 1;
        instance.stats.reminders += 1;
        addLog(doc, instance.id, `Appointment reminder for ${booking.name}. ${sent.note}`);
      }
      job.status = "done";
      ran += 1;
      continue;
    }
    const result = await runEngine({ doc, instance, mode: "job", job, origin, now });
    if (!result.ok) {
      job.attempts = (job.attempts || 0) + 1;
      if (job.attempts < 3) {
        job.status = "due";
        delete job.claimedAt;
        job.runAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
        addAdminLog(doc, "automated", "Run retried", `${instance.businessName}: ${result.message} (attempt ${job.attempts} of 3).`);
      } else {
        job.status = "done";
        job.failed = true;
        addAdminLog(doc, "automated", "Run stopped after 3 tries", `${instance.businessName}: ${result.message}`);
      }
    } else {
      job.status = "done";
    }
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
  pay: "paystack" | "invoice" | "trial";
  origin: string;
  /** Referral code from the ?ref= cookie. */
  refCode?: string;
};

export async function startBundleCheckout(input: CheckoutInput): Promise<
  | { ok: true; url?: string; message: string; email: string; trialDays: number }
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
  const isNewClient = !doc.instances.some((item) => item.ownerEmail === email && !item.demo);
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
  });
  const started = new Date();
  for (const instance of created) await activateOnTrial(doc, instance, input.origin, started);
  const bonusDays = input.refCode ? await recordReferralSignup({ code: input.refCode, email, isNewClient }) : 0;
  if (bonusDays > 0) {
    for (const instance of created) {
      if (!instance.trial) continue;
      instance.trial.endsAt = extendTrialEnd(instance.trial.endsAt, bonusDays, started);
      instance.trial.referralBonusDays = bonusDays;
      instance.periodEnd = instance.trial.endsAt;
    }
    addAdminLog(doc, "automated", "Referral applied", `${email} · +${bonusDays} free days`);
  }
  await sendTrialWelcome(doc, email);
  await saveAutomations(doc);

  const ids = created.map((item) => item.id);
  const label = quote.items.map((item) => item.name).join(", ");
  const trialMessage = `Free for ${TRIAL_DAYS} days, no card needed. Sign in to the portal with this email.`;
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
      note: `${input.businessName.trim()} asked for an invoice. Due after the ${TRIAL_DAYS}-day trial. KES ${quote.dueKes.toLocaleString("en-KE")} (${input.billing}).`,
    });
    return {
      ok: true,
      email,
      trialDays: TRIAL_DAYS,
      message: `Your ${TRIAL_DAYS}-day trial is on. An invoice is ready for when it ends.`,
    };
  }

  if (input.pay !== "paystack" || !isPaystackConfigured()) {
    return { ok: true, email, trialDays: TRIAL_DAYS, message: trialMessage };
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
    return {
      ok: true,
      email,
      trialDays: TRIAL_DAYS,
      message: "Your free month is on. Paystack did not open, so request an invoice from the portal when you are ready.",
    };
  }
  return { ok: true, url: body.data.authorization_url, email, trialDays: TRIAL_DAYS, message: "Redirecting to Paystack. The free month is already on." };
}

function soonestTrial(instances: AutomationInstance[]) {
  const trials = instances.map((item) => item.trial).filter((trial): trial is NonNullable<AutomationInstance["trial"]> => Boolean(trial));
  if (trials.length === 0) return null;
  const first = [...trials].sort((a, b) => a.endsAt.localeCompare(b.endsAt))[0];
  const endsAt = first?.endsAt;
  if (!endsAt) return null;
  const ended = trials.every((trial) => Boolean(trial.endedAt));
  const stage = trialPortalStage({ ...first, endedAt: ended ? first.endedAt || endsAt : undefined }, new Date());
  return {
    endsAt,
    days: trialDaysRemaining(endsAt),
    ended,
    stage,
    stageLabel: TRIAL_STAGE_LABEL[stage],
    bonusDays: first.referralBonusDays || 0,
  };
}

export async function portalSnapshot(email: string, includeDemo = false) {
  const doc = await loadAutomations();
  const instances = instancesForEmail(doc, email, includeDemo);
  const payments = await listPayments();
  const normalized = normalizeEmail(email);
  const ids = new Set(instances.map((item) => item.id));
  return {
    ...snapshotFor(doc, instances),
    analytics: analyticsFor(doc, instances),
    trial: soonestTrial(instances),
    referral: instances.length ? await portalReferral(normalized) : null,
    paystack: isPaystackConfigured(),
    foundersLock: await foundersLockFor(normalized),
    usage: { whatsapp: queueCounts(doc.deliveries || [], "whatsapp", ids), sms: queueCounts(doc.deliveries || [], "sms", ids) },
    invoices: payments
      .filter((payment) => payment.payerEmail === normalized && (payment.tierId === "automation-bundle" || payment.tierId.startsWith("care-") || payment.automationInstanceIds?.some((id) => ids.has(id))))
      .map((payment) => ({
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        tierName: payment.tierName,
      })),
  };
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
  const payments = await listPayments();
  const clients = [...byEmail.entries()].map(([email, instances]) => {
    const view = snapshotFor(doc, instances);
    return {
      email,
      name: instances[0]?.ownerName || email,
      businessName: instances[0]?.businessName || "",
      mrrKes: instances.filter((item) => item.status === "active").reduce((sum, item) => sum + item.monthlyKes, 0),
      trial: soonestTrial(instances),
      ...view,
    };
  });
  const channels = channelReadiness();
  const actions = buildActionItems({
    instances: doc.instances,
    charges: doc.charges,
    leads: doc.leads,
    jobs: doc.jobs,
    payments,
    channels,
    waiting: (doc.deliveries || []).filter((item) => item.status === "waiting").length,
    lastTickAt: doc.ops?.lastTickAt,
  });
  const trialStages = (["setup", "running", "ending", "ended", "paid"] as const).map((stage) => ({
    stage,
    label: TRIAL_STAGE_LABEL[stage],
    clients: clients
      .filter((client) => client.trial?.stage === stage)
      .map((client) => ({ email: client.email, businessName: client.businessName, days: client.trial?.days ?? 0 })),
  }));
  return {
    trialStages,
    referrals: await adminReferrals(),
    mrrKes: active.reduce((sum, item) => sum + item.monthlyKes, 0),
    active: active.length,
    pending: live.filter((item) => item.status === "pending_payment").length,
    paused: live.filter((item) => item.status === "paused").length,
    demos: doc.instances.filter((item) => item.ownerEmail === SANDBOX_EMAIL).length,
    channels,
    clients,
    sandbox: snapshotFor(doc, doc.instances.filter((item) => item.ownerEmail === SANDBOX_EMAIL)),
    actions,
    ops: doc.ops || {},
    adminLog: (doc.adminLog || []).slice(-60).reverse(),
    paystack: isPaystackConfigured(),
    invoices: payments
      .filter((payment) => payment.status === "pending" && (payment.tierId === "automation-bundle" || payment.tierId.startsWith("care-") || payment.automationInstanceIds?.length))
      .map((payment) => ({
        id: payment.id,
        email: payment.payerEmail,
        name: payment.payerName,
        amount: payment.amount,
        currency: payment.currency,
        tierName: payment.tierName,
        createdAt: payment.createdAt,
        note: payment.note,
      })),
  };
}

function analyticsFor(doc: AutomationDoc, instances: AutomationInstance[]) {
  const ids = new Set(instances.map((item) => item.id));
  return buildAnalytics({
    instances,
    logs: doc.logs.filter((log) => ids.has(log.instanceId)),
    deliveries: (doc.deliveries || []).filter((item) => ids.has(item.instanceId)),
    leads: doc.leads.filter((lead) => ids.has(lead.instanceId)),
    bookings: doc.bookings.filter((booking) => ids.has(booking.instanceId)),
    reviews: doc.reviews.filter((review) => ids.has(review.instanceId)),
    charges: doc.charges.filter((charge) => ids.has(charge.instanceId)),
  });
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

export async function saveInstanceConfig(id: string, config: unknown, email?: string, origin = "") {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.id === id);
  if (!instance) return { ok: false, message: "Not found." };
  if (email && instance.ownerEmail !== normalizeEmail(email)) return { ok: false, message: "Not your automation." };
  const parsed = parseTemplateConfig(instance.templateId, config);
  if (!parsed.ok) return parsed;
  if (Array.isArray(parsed.config.entries)) {
    parsed.config.entries = parsed.config.entries.map((row) => {
      if (!row || typeof row !== "object") return row;
      const record = row as Record<string, unknown>;
      return record.id ? record : { ...record, id: randomUUID() };
    });
  }
  instance.config = parsed.config;
  instance.inputsUpdatedAt = new Date().toISOString();
  instance.updatedAt = instance.inputsUpdatedAt;
  addLog(doc, id, "Setup updated.");
  await syncLedger(doc, instance, origin || "https://thebeaconstudio.co.ke");
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
  const sent = await deliver({
    instance,
    email: booking.email,
    phone: booking.phone,
    subject: `Booked — ${instance.businessName}`,
    text: `Hello ${booking.name}, you are booked for ${formatBookingWhen(start)}. We will remind you 24 hours and 1 hour before. Calendar: ${origin}/api/automations/bookings/${booking.id}/ics`,
  });
  rememberDeliveries(doc, instance.id, sent);
  instance.stats.messages += 1;
  addLog(doc, instance.id, `Booking for ${booking.name} at ${formatBookingWhen(start)}.`);
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
  if (!template) return null;
  if (page === "lead" && template.hook === "lead") {
    return { businessName: instance.businessName, templateId: instance.templateId, question: "", categories: "", title: template.name };
  }
  if (template.page !== page) return null;
  return { businessName: instance.businessName, templateId: instance.templateId, question: String(instance.config.question || ""), categories: String(instance.config.categories || ""), title: template.name };
}

export async function markOwnedCharge(chargeId: string, email?: string, actor: "client" | "studio" = "client") {
  const doc = await loadAutomations();
  const charge = doc.charges.find((item) => item.id === chargeId);
  if (!charge) return { ok: false, message: "That charge was not found." };
  const instance = doc.instances.find((item) => item.id === charge.instanceId);
  if (email && instance && instance.ownerEmail !== normalizeEmail(email)) return { ok: false, message: "Not your automation." };
  if (!markChargePaid(doc, chargeId)) return { ok: false, message: "It is already paid." };
  addAdminLog(doc, actor === "studio" ? "done" : "automated", "Charge marked paid", `${charge.name} · KES ${charge.amountKes.toLocaleString("en-KE")}. Reminders stopped.`);
  await saveAutomations(doc);
  return { ok: true, message: "Marked paid. Reminders stopped." };
}

export async function markBundleInvoicePaid(paymentId: string) {
  const payments = await listPayments();
  const payment = payments.find((item) => item.id === paymentId);
  if (!payment) return { ok: false, message: "Invoice not found." };
  if (payment.status === "success") return { ok: true, message: "Already paid." };
  await updatePaymentById(payment.id, { status: "success", resultDesc: "Marked paid in the action center." });
  if (payment.automationInstanceIds?.length) {
    const doc = await loadAutomations();
    applyBundlePayment(doc, payment.automationInstanceIds, new Date(), "done");
    await saveAutomations(doc);
    if (payment.payerEmail) await settleReferralsForPayment(payment.payerEmail);
  }
  return { ok: true, message: "Invoice marked paid. The paid period starts when the trial ends." };
}

export async function changeTrial(id: string, action: "extend" | "end", days = 14) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.id === id && !item.demo);
  if (!instance) return { ok: false, message: "Automation not found." };
  if (action === "end") {
    endInstanceTrial(instance);
    addLog(doc, id, "Trial ended by the studio.");
    addAdminLog(doc, "done", "Trial ended", `${instance.businessName} · ${instance.ownerEmail}`);
  } else {
    extendInstanceTrial(instance, days);
    addLog(doc, id, `Trial extended by ${days} days.`);
    addAdminLog(doc, "done", "Trial extended", `${instance.businessName} · ${days} more days.`);
  }
  await saveAutomations(doc);
  return { ok: true, message: action === "end" ? "Trial ended." : `Trial extended by ${days} days.` };
}

export async function retryFailedJobs() {
  const doc = await loadAutomations();
  const now = new Date().toISOString();
  let count = 0;
  for (const job of doc.jobs) {
    if (!job.failed) continue;
    job.failed = false;
    job.attempts = 0;
    job.status = "due";
    delete job.claimedAt;
    job.runAt = now;
    count += 1;
  }
  if (count) addAdminLog(doc, "done", "Failed runs queued", `${count} run${count === 1 ? "" : "s"} will try again on the next tick.`);
  await saveAutomations(doc);
  return { ok: true, message: count ? `${count} run${count === 1 ? "" : "s"} queued.` : "No failed runs." };
}

export async function markLeadRead(id: string) {
  const doc = await loadAutomations();
  const lead = doc.leads.find((item) => item.id === id);
  if (!lead) return { ok: false, message: "Lead not found." };
  lead.readAt = new Date().toISOString();
  addAdminLog(doc, "done", "Lead marked read", lead.name);
  await saveAutomations(doc);
  return { ok: true, message: "Marked read." };
}

export async function rememberShare(id: string, key: string, email?: string) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.id === id);
  if (!instance) return { ok: false, message: "Not found." };
  if (email && instance.ownerEmail !== normalizeEmail(email)) return { ok: false, message: "Not your automation." };
  const shared = instance.config.shared && typeof instance.config.shared === "object" ? { ...(instance.config.shared as Record<string, unknown>) } : {};
  shared[key] = true;
  instance.config = { ...instance.config, shared };
  instance.updatedAt = new Date().toISOString();
  await saveAutomations(doc);
  return { ok: true, message: "Link marked shared." };
}

export async function requestOwnerInvoice(email: string) {
  const doc = await loadAutomations();
  const mine = instancesForEmail(doc, email);
  if (mine.length === 0) return { ok: false, message: "No automations on this login." };
  const normalized = normalizeEmail(email);
  const payments = await listPayments();
  const open = payments.find((payment) => payment.payerEmail === normalized && payment.status === "pending" && payment.tierId === "automation-bundle");
  if (open) return { ok: true, message: "An invoice is already open.", invoiceId: open.id };
  const amount = mine.reduce((sum, item) => sum + item.monthlyKes, 0);
  const payment = await createPayment({
    provider: "bank",
    status: "pending",
    mode: "invoice",
    tierId: "automation-bundle",
    tierName: mine.map((item) => templateById(item.templateId)?.name || item.templateId).join(", ").slice(0, 140),
    amount,
    currency: "KES",
    depositPercent: 100,
    payerEmail: normalized,
    payerName: mine[0]?.ownerName,
    automationInstanceIds: mine.map((item) => item.id),
    note: `Requested from the portal. Due after the trial. KES ${amount.toLocaleString("en-KE")}.`,
  });
  addAdminLog(doc, "automated", "Invoice requested", `${normalized} · KES ${amount.toLocaleString("en-KE")}`);
  await saveAutomations(doc);
  return { ok: true, message: "Invoice requested. The studio will mark it when it is paid.", invoiceId: payment.id };
}

export async function runOwnerHook(email: string, id: string, kind: "inbox" | "notes", body: Record<string, unknown>, origin: string) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.id === id);
  if (!instance || instance.ownerEmail !== normalizeEmail(email)) return { ok: false, message: "Not your automation." };
  const template = templateById(instance.templateId);
  if (!template || template.hook !== kind) return { ok: false, message: "This automation does not take that input." };
  if (instance.status !== "active") return { ok: false, message: "This automation is paused." };
  const result = await runEngine({ doc, instance, mode: "hook", body, origin });
  const shared = instance.config.shared && typeof instance.config.shared === "object" ? { ...(instance.config.shared as Record<string, unknown>) } : {};
  shared[kind] = true;
  instance.config = { ...instance.config, shared };
  await saveAutomations(doc);
  return { ok: result.ok, message: result.message, reply: result.reply };
}

/** Client may pause or resume only its own automation, and resume only inside a trial or paid period. */
export function ownerCanResume(instance: { status: string; trial?: { endsAt: string; endedAt?: string; paidUntil?: string }; periodEnd?: string }, now = Date.now()): boolean {
  if (instance.status !== "paused") return false;
  const t = instance.trial;
  if (t?.paidUntil && Date.parse(t.paidUntil) > now) return true;
  if (t && !t.endedAt && Date.parse(t.endsAt) > now) return true;
  if (!t && instance.periodEnd && Date.parse(instance.periodEnd) > now) return true;
  return false;
}

export async function ownerSetStatus(id: string, status: "active" | "paused", email: string, origin: string) {
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.id === id);
  if (!instance || instance.ownerEmail !== normalizeEmail(email)) return { ok: false, message: "Not your automation." };
  if (status === "paused") {
    if (instance.status !== "active") return { ok: false, message: "Only a running automation can be paused." };
    await setInstanceStatus(id, "paused", origin);
    return { ok: true };
  }
  if (!ownerCanResume(instance)) return { ok: false, message: "Choose a plan or request an invoice to resume." };
  await setInstanceStatus(id, "active", origin);
  return { ok: true };
}
