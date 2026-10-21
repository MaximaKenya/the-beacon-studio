import { randomUUID } from "crypto";
import { pricedTemplates, templateById } from "@/automations/templates/public";
import { deliver } from "@/lib/automations/channels";
import { runEngine } from "@/lib/automations/engine";
import { addLog } from "@/lib/automations/store";
import { runWithTrace, traceStep } from "@/lib/automations/trace";
import type { AutomationDoc, AutomationInstance, SandboxStep } from "@/lib/automations/types";
import { SANDBOX_BUSINESS, SANDBOX_EMAIL, SANDBOX_OWNER } from "@/lib/automations/setup-guides";
import { siteConfig } from "@/data/site";
import { isPlaceholderContact } from "@/lib/launch";

export { SANDBOX_BUSINESS, SANDBOX_EMAIL, SANDBOX_OWNER };

const SEND_KINDS = new Set([
  "sequence",
  "payment-reminder",
  "digest",
  "draft",
  "date-reminder",
  "custom-reminder",
  "stock",
  "appointment-reminder",
]);

function day(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function person(name: string, email: string, phone: string, extra: Record<string, unknown> = {}) {
  return { name, email, phone, ...extra };
}

function kenyanConfig(id: string, base: Record<string, unknown>): Record<string, unknown> {
  const amina = person("Amina Wanjiku", "amina.wanjiku@example.com", "254711000014");
  const juma = person("Juma Otieno", "juma.traders@example.com", "254722000028");
  const neema = person("Neema Kariuki", "neema.kariuki@example.com", "254733000041");
  const wanjiku = person("Wanjiku Mwangi", "wanjiku.mwangi@example.com", "254701000066");
  const faith = person("Faith Achieng", "faith.achieng@example.com", "254712000077");
  const brian = person("Brian Mwangi", "brian.mwangi@example.com", "254723000088");
  const patches: Record<string, Record<string, unknown>> = {
    "lead-reply": {
      greeting: "Thanks for writing to Jamii Traders. We have your message and will call you about the order.",
      qualifyNotes: "Warm and short. Jamii Traders is a hardware shop in Industrial Area, Nairobi. A good lead names the goods they need, a Nairobi location, and a phone number.",
    },
    "abandoned-quote": {
      steps: "Still thinking about the quote from Jamii Traders?\nWe can hold the cement price until Friday.\nLast note from us on this quote.",
      entries: [{ ...amina, date: day(-3), note: "Quote for 40 bags of cement" }],
    },
    "lead-nurture": {
      steps: "Thanks for visiting Jamii Traders.\nBuilders in South B usually start with cement and iron sheets.\nReply if you want us to set the order aside.",
      entries: [{ ...amina, date: day(0), note: "Asked about iron sheets" }],
    },
    "daily-sales": { sendHour: 8, note: "New leads and payments received at the Industrial Area shop." },
    "social-drafts": {
      weekday: "1",
      topics: "Monday: a tip on storing cement in the rains.\nWednesday: a South B delivery story.\nFriday: this week's paint offer.",
    },
    "invoice-reminders": {
      entries: [{ ...juma, amountKes: 48500, date: day(7), note: "October hardware invoice" }],
    },
    "subscription-renewal": {
      entries: [{ ...neema, amountKes: 3500, date: day(12), note: "Monthly delivery plan" }],
    },
    "debt-collection": {
      entries: [{ ...juma, amountKes: 18600, date: day(-2), note: "Balance on account JT-204" }],
    },
    "sacco-repayments": {
      entries: [{ ...wanjiku, amountKes: 7500, date: day(9), note: "SACCO loan instalment" }],
    },
    appointments: { days: "1,2,3,4,5", start: "09:00", end: "16:00", slotMinutes: 30 },
    "faq-bot": {
      widgetTitle: "Ask Jamii Traders",
      knowledge:
        "Jamii Traders is in Industrial Area, Nairobi. The shop is open Monday to Friday, 8:00 to 17:00, and Saturday 8:00 to 13:00. Delivery in Nairobi is next day for orders placed before 15:00. We take M-Pesa and cash. Cement is sold in bags of 50kg.",
    },
    reviews: { googleReviewUrl: "https://g.page/r/demo", lowScoreMax: 3 },
    onboarding: {
      steps: "Welcome to Jamii Traders.\nPay by M-Pesa to the till on your invoice.\nCall the shop if a delivery is late.",
      entries: [{ ...neema, note: "New delivery-plan customer" }],
    },
    greetings: {
      message: "Happy {{kind}}, {{name}}. From all of us at Jamii Traders.",
      entries: [{ ...neema, date: day(14), kind: "birthday" }],
    },
    rsvp: {
      eventName: "Jamii Traders open Saturday",
      eventDate: day(18),
      entries: [{ ...brian, date: day(18), note: "yes" }],
    },
    nps: {
      question: "How likely are you to recommend Jamii Traders, from 0 to 10?",
      lowScoreMax: 6,
      googleReviewUrl: "https://g.page/r/demo",
    },
    "weekly-report": { weekday: "1", note: "Include leads and payments from the shop." },
    "staff-shifts": {
      message: "Hi {{name}}, you are on {{note}} at {{date}}.",
      entries: [{ ...faith, date: day(1), note: "counter, Industrial Area" }],
    },
    "low-stock": { entries: [{ name: "Bamburi cement 50kg", qty: 4, reorderAt: 20, note: "Aisle 2" }] },
    "doc-expiry": {
      leadDays: 14,
      entries: [{ name: "Landlord", email: "landlord.plot12@example.com", phone: "254700000090", date: day(21), note: "Shop lease, Plot 12" }],
    },
    "inbox-triage": { instructions: "Be brief. Do not promise a refund. Offer a call with the shop." },
    "meeting-notes": { instructions: "Decisions, owners, and dates only." },
    "kpi-digest": {
      weekday: "1",
      metrics: ["leads", "payments", "messages"],
      note: "Compare with last week in the note you add.",
    },
    "school-fees": {
      notice: "Term fees are due on the date below. Pay with the link or by M-Pesa.",
      entries: [{ name: "Parent of Achieng", email: "achieng.parent@example.com", phone: "254724000055", amountKes: 24500, date: day(11), note: "Term 3" }],
    },
    "clinic-recall": {
      recallDays: 180,
      entries: [{ name: "Kamau Njoroge", email: "kamau.njoroge@example.com", phone: "254710000033", date: day(-200), note: "review" }],
    },
    "rent-collection": {
      entries: [{ name: "House 12, South B", email: "house12.southb@example.com", phone: "254701000099", amountKes: 32000, date: day(8), note: "November rent" }],
    },
    maintenance: { categories: "Plumbing, power, locks" },
    "custom-reminder": {
      message: "Hi {{name}}, {{note}} is due on {{date}}.",
      recurrence: "weekly",
      channel: "email",
      recipients: "asha.kamau@example.com",
      entries: [{ name: "Shop team", email: "asha.kamau@example.com", phone: "254706000010", date: day(2), note: "stock take" }],
    },
    "custom-report": {
      metrics: ["leads", "payments", "messages", "runs"],
      recurrence: "weekly",
      recipients: "asha.kamau@example.com",
      channel: "email",
      note: "Weekly shop report for Jamii Traders.",
    },
  };
  return { ...structuredClone(base), ...(patches[id] || {}) };
}

function sampleBody(templateId: string): Record<string, unknown> {
  const common = {
    name: "Amina Wanjiku",
    email: "amina.wanjiku@example.com",
    phone: "254711000014",
  };
  if (templateId === "faq-bot") return { ...common, message: "Are you open on Saturday, and do you deliver cement in South B?" };
  if (templateId === "inbox-triage") {
    return { from: "juma.traders@example.com", subject: "Wrong paint colour", body: "The paint delivered to Westlands was the wrong colour. I want it replaced." };
  }
  if (templateId === "meeting-notes") {
    return { notes: "Monday shop meeting. Asha will reorder cement by Wednesday. Faith covers Saturday. Delivery price stays KES 500 inside Nairobi." };
  }
  if (templateId === "maintenance") return { ...common, message: "The lock on shop 4 at Plot 12 is stuck." };
  if (templateId === "reviews" || templateId === "nps") return common;
  return { ...common, message: "We need 40 bags of cement delivered to South B next week. Call me on this number." };
}

function blankInstance(templateId: string, config: Record<string, unknown>, priceKes: number, priceUsd: number): AutomationInstance {
  const now = new Date().toISOString();
  return {
    id: `sandbox-${templateId}`,
    templateId,
    slug: `jamii-${templateId}`,
    ownerName: SANDBOX_OWNER,
    ownerEmail: SANDBOX_EMAIL,
    businessName: SANDBOX_BUSINESS,
    status: "active",
    config,
    monthlyKes: priceKes,
    monthlyUsd: priceUsd,
    setupFeeKes: 0,
    billing: "monthly",
    demo: true,
    createdAt: now,
    updatedAt: now,
    activatedAt: now,
    stats: { runs: 0, leads: 0, messages: 0, payments: 0, reminders: 0 },
    notes: [],
  };
}

function stripIds(doc: AutomationDoc, ids: Set<string>) {
  doc.instances = doc.instances.filter((item) => !ids.has(item.id));
  doc.logs = doc.logs.filter((item) => !ids.has(item.instanceId));
  doc.jobs = doc.jobs.filter((item) => !ids.has(item.instanceId));
  doc.leads = doc.leads.filter((item) => !ids.has(item.instanceId));
  doc.charges = doc.charges.filter((item) => !ids.has(item.instanceId));
  doc.bookings = doc.bookings.filter((item) => !ids.has(item.instanceId));
  doc.reviews = doc.reviews.filter((item) => !ids.has(item.instanceId));
}

export function sandboxIds(doc: AutomationDoc): Set<string> {
  return new Set(
    doc.instances
      .filter((item) => item.demo || item.ownerEmail === SANDBOX_EMAIL || item.id.startsWith("demo-") || item.id.startsWith("sandbox-"))
      .map((item) => item.id)
  );
}

/** Add Jamii Traders, with every template on, when the sandbox is missing. */
export async function syncSandbox(doc: AutomationDoc): Promise<boolean> {
  const legacy = doc.instances.filter((item) => item.id.startsWith("demo-"));
  const has = doc.instances.some((item) => item.ownerEmail === SANDBOX_EMAIL);
  if (has && legacy.length === 0) return false;
  if (legacy.length) stripIds(doc, new Set(legacy.map((item) => item.id)));
  if (!has) await seedSandbox(doc);
  return true;
}

export async function seedSandbox(doc: AutomationDoc): Promise<void> {
  const now = new Date();
  for (const template of pricedTemplates()) {
    if (doc.instances.some((item) => item.id === `sandbox-${template.id}`)) continue;
    const instance = blankInstance(template.id, kenyanConfig(template.id, template.demoConfig), template.priceKes, template.priceUsd);
    doc.instances.push(instance);
    await runEngine({ doc, instance, mode: "activate", origin: "http://sandbox.local", now });
    addLog(doc, instance.id, `${template.name} is on for ${SANDBOX_BUSINESS}. Sandbox runs stay as previews.`);
  }
  const leadId = "sandbox-lead-reply";
  if (!doc.leads.some((lead) => lead.instanceId === leadId)) {
    doc.leads.push({
      id: randomUUID(),
      instanceId: leadId,
      at: now.toISOString(),
      name: "Amina Wanjiku",
      email: "amina.wanjiku@example.com",
      phone: "254711000014",
      message: "Need 40 bags of cement in South B next week.",
      qualified: true,
      summary: "Nairobi delivery lead for cement.",
    });
  }
  if (!doc.charges.some((charge) => charge.note === "Paint order, paid by M-Pesa")) {
    doc.charges.push({
      id: randomUUID(),
      instanceId: "sandbox-invoice-reminders",
      name: "Amina Wanjiku",
      email: "amina.wanjiku@example.com",
      phone: "254711000014",
      amountKes: 12400,
      note: "Paint order, paid by M-Pesa",
      status: "paid",
      remindersSent: 1,
    });
  }
  const bookId = "sandbox-appointments";
  if (!doc.bookings.some((booking) => booking.instanceId === bookId)) {
    const start = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    start.setHours(10, 0, 0, 0);
    doc.bookings.push({
      id: randomUUID(),
      instanceId: bookId,
      start: start.toISOString(),
      name: "Brian Mwangi",
      email: "brian.mwangi@example.com",
      phone: "254723000088",
      note: "Measure the shop shutter",
      status: "confirmed",
    });
  }
}

export function studioTestTarget(): { email?: string; phone?: string } {
  const email = isPlaceholderContact(siteConfig.email) ? undefined : siteConfig.email;
  const phone = siteConfig.phone?.trim() || undefined;
  return { ...(email ? { email } : {}), ...(phone ? { phone } : {}) };
}

export async function previewSandboxInstance(
  doc: AutomationDoc,
  instance: AutomationInstance,
  deliverTo?: { email?: string; phone?: string }
): Promise<SandboxStep[]> {
  const template = templateById(instance.templateId);
  const steps: SandboxStep[] = [];
  const scratch = structuredClone(doc);
  const copy = scratch.instances.find((item) => item.id === instance.id);
  if (!template || !copy) return steps;
  const body = sampleBody(template.id);
  const jobs = scratch.jobs.filter((job) => job.instanceId === copy.id && job.status === "due" && job.kind !== "renewal");
  const job = jobs.find((item) => SEND_KINDS.has(item.kind)) || jobs[0];
  await runWithTrace(steps, async () => {
    traceStep({
      kind: "trigger",
      title: job ? `Scheduled ${job.kind.replaceAll("-", " ")}` : template.hook !== "none" ? `Webhook · ${template.hook}` : "Run now",
      detail: job
        ? `Jamii Traders is active. This run fires the next saved job (${job.kind}).`
        : `Jamii Traders is active. This run uses a sample ${template.hook === "none" ? "event" : template.hook} for ${template.name}.`,
    });
    traceStep({
      kind: "data",
      title: "Data used",
      detail: JSON.stringify({ config: copy.config, sample: body }, null, 2),
    });
    if (job) {
      await runEngine({ doc: scratch, instance: copy, mode: "job", job, origin: "http://sandbox.local", deliverTo });
    } else if (template.hook !== "none") {
      await runEngine({ doc: scratch, instance: copy, mode: "hook", body, origin: "http://sandbox.local", deliverTo });
    } else if (template.behavior === "booking") {
      const booking = scratch.bookings.find((item) => item.instanceId === copy.id);
      const when = booking ? new Date(booking.start).toUTCString() : "the next open slot";
      const text = `Hello ${booking?.name || "Brian Mwangi"}, you are booked at ${SANDBOX_BUSINESS} for ${when}. We will remind you 24 hours and 1 hour before.`;
      traceStep({
        kind: "preview",
        title: `Booked — ${SANDBOX_BUSINESS}`,
        detail: `To ${booking?.email || "brian.mwangi@example.com"}${booking?.phone ? ` · ${booking.phone}` : ""}\n\n${text}`,
      });
      if (deliverTo) {
        await deliver({
          instance: copy,
          email: deliverTo.email,
          phone: deliverTo.phone,
          subject: `[Demo test] Booked — ${SANDBOX_BUSINESS}`,
          text: `This is a test for you. The customer was not contacted.\n\n${text}`,
          liveTest: true,
        });
      }
    } else {
      await runEngine({ doc: scratch, instance: copy, mode: "activate", origin: "http://sandbox.local", deliverTo });
    }
    if (!steps.some((step) => step.kind === "ai")) {
      traceStep({
        kind: "note",
        title: "No model call",
        detail: "This step uses the saved message. Groq is not part of it.",
      });
    }
    if (!steps.some((step) => step.kind === "preview")) {
      traceStep({
        kind: "note",
        title: "Nothing to preview",
        detail: "This run scheduled work or saved a record. It did not build a customer message.",
      });
    }
  });
  return steps;
}

export async function runSandboxNow(id: string, sendToMe: boolean): Promise<{ ok: boolean; message: string; steps: SandboxStep[] }> {
  const { loadAutomations, saveAutomations } = await import("@/lib/automations/store");
  const doc = await loadAutomations();
  const instance = doc.instances.find((item) => item.id === id);
  if (!instance?.demo) return { ok: false, message: "Only the demo client can be run from here.", steps: [] };
  const target = sendToMe ? studioTestTarget() : undefined;
  const steps = await previewSandboxInstance(doc, instance, target && (target.email || target.phone) ? target : undefined);
  if (sendToMe) {
    const emailNote = target?.email ? `Email test: ${target.email}.` : "Studio email is still a placeholder, so no test email was sent.";
    const phoneNote = target?.phone ? `Phone on file: ${siteConfig.phoneDisplay}. SMS sends only when Africa's Talking is configured.` : "No studio phone is set.";
    steps.push({
      id: randomUUID(),
      kind: "note",
      title: "Send to me",
      detail: `${emailNote} ${phoneNote} Sample customers were not contacted, and nothing was charged.`,
    });
  }
  instance.lastRunView = { at: new Date().toISOString(), sentToMe: sendToMe, steps };
  instance.stats.runs += 1;
  instance.stats.lastRunAt = instance.lastRunView.at;
  instance.updatedAt = instance.lastRunView.at;
  addLog(
    doc,
    instance.id,
    sendToMe ? "Sandbox run with send-to-me. Customers were not contacted." : "Sandbox preview. Nothing was sent or charged."
  );
  await saveAutomations(doc);
  return { ok: true, message: sendToMe ? "Preview ready. A test was attempted to you only." : "Preview ready. Nothing was sent.", steps };
}

export async function resetDemoSandbox(): Promise<{ ok: boolean; message: string }> {
  const { loadAutomations, saveAutomations } = await import("@/lib/automations/store");
  const doc = await loadAutomations();
  stripIds(doc, sandboxIds(doc));
  await seedSandbox(doc);
  await saveAutomations(doc);
  return { ok: true, message: `${SANDBOX_BUSINESS} is reset. Every automation is back on sample data.` };
}
