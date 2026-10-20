import { randomUUID } from "crypto";
import { templateById } from "@/automations/templates/public";
import { deliver } from "@/lib/automations/channels";
import { groqText } from "@/lib/automations/groq";
import { createChargeLink } from "@/lib/automations/paylinks";
import { addLog } from "@/lib/automations/store";
import type {
  AutomationCharge,
  AutomationDoc,
  AutomationInstance,
  AutomationJob,
} from "@/lib/automations/types";

type Entry = {
  name?: string;
  email?: string;
  phone?: string;
  amountKes?: number;
  date?: string;
  note?: string;
  qty?: number;
  reorderAt?: number;
  kind?: string;
};

type RunMode = "activate" | "job" | "hook";

export type EngineInput = {
  doc: AutomationDoc;
  instance: AutomationInstance;
  mode: RunMode;
  job?: AutomationJob;
  body?: Record<string, unknown>;
  origin: string;
  now?: Date;
};

function nowOf(input: EngineInput): Date {
  return input.now ?? new Date();
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numOf(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function fillTemplate(template: string, vars: Record<string, string | number | undefined>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function entriesFromConfig(config: Record<string, unknown>): Entry[] {
  const rows: Entry[] = [];
  if (Array.isArray(config.entries)) {
    for (const row of config.entries) {
      if (row && typeof row === "object") rows.push(row as Entry);
    }
  }
  const csv = textOf(config.csv);
  if (csv) {
    const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const start = /name/i.test(lines[0] || "") ? 1 : 0;
    for (const line of lines.slice(start)) {
      const [name, email, phone, amount, date, note] = line.split(",").map((part) => part.trim());
      rows.push({
        name,
        email,
        phone,
        amountKes: amount ? Number(amount) : undefined,
        date,
        note,
      });
    }
  }
  return rows.filter((row) => row.name || row.email || row.phone);
}

function plusDays(from: Date, days: number): string {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

function plusHours(from: Date, hours: number): string {
  return new Date(from.getTime() + hours * 60 * 60 * 1000).toISOString();
}

function schedule(doc: AutomationDoc, instanceId: string, runAt: string, kind: string, extra: Partial<AutomationJob> = {}) {
  doc.jobs.push({
    id: randomUUID(),
    instanceId,
    runAt,
    status: "due",
    kind,
    ...extra,
  });
}

async function touch(instance: AutomationInstance, at: Date, stat?: "leads" | "messages" | "payments" | "reminders") {
  instance.stats.runs += 1;
  instance.stats.lastRunAt = at.toISOString();
  instance.updatedAt = at.toISOString();
  if (stat) instance.stats[stat] += 1;
}

async function sendOut(
  input: EngineInput,
  target: { email?: string; phone?: string; subject: string; text: string; channel?: string }
) {
  const result = await deliver({
    instance: input.instance,
    email: target.email,
    phone: target.phone,
    subject: target.subject,
    text: target.text,
    channel: target.channel || textOf(input.instance.config.channel) || "both",
  });
  await touch(input.instance, nowOf(input), "messages");
  const via = [result.emailed ? "email" : "", result.sms ? "sms" : "", result.whatsapp && !result.sms ? "WhatsApp link" : ""]
    .filter(Boolean)
    .join(", ");
  addLog(input.doc, input.instance.id, `${target.subject}${via ? ` (${via})` : ""}. ${input.instance.demo ? "Demo: not sent." : ""}`.trim());
  return result;
}

function ownerEmail(instance: AutomationInstance): string {
  return textOf(instance.config.notifyEmail) || instance.ownerEmail;
}

export async function runEngine(input: EngineInput): Promise<{ ok: boolean; message: string; reply?: string }> {
  const template = templateById(input.instance.templateId);
  if (!template) return { ok: false, message: "Unknown automation." };
  if (input.mode !== "activate" && input.instance.status !== "active") {
    return { ok: false, message: "This automation is not active." };
  }
  try {
    switch (template.behavior) {
      case "lead-qualify":
        return await runLead(input);
      case "payment-cycle":
        return await runPayments(input, template.id === "debt-collection");
      case "booking":
        return runBookingActivate(input);
      case "faq":
        return await runFaq(input);
      case "review":
        return await runReview(input);
      case "digest":
      case "custom-report":
        return await runDigest(input);
      case "sequence":
        return await runSequence(input);
      case "date-reminder":
      case "custom-reminder":
        return await runDates(input);
      case "threshold-alert":
        return await runStock(input);
      case "groq-draft":
        return await runDraft(input);
      case "inbox-triage":
        return await runInbox(input);
      case "meeting-notes":
        return await runNotes(input);
      case "intake":
        return await runIntake(input);
      default:
        return { ok: false, message: "This automation has no runner." };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Run failed";
    addLog(input.doc, input.instance.id, message, "error");
    return { ok: false, message };
  }
}

async function runLead(input: EngineInput): Promise<{ ok: boolean; message: string; reply?: string }> {
  if (input.mode === "activate") {
    addLog(input.doc, input.instance.id, `Lead webhook is ready at /api/automations/hooks/lead/${input.instance.slug}`);
    return { ok: true, message: "Lead auto-reply is on." };
  }
  const body = input.body || {};
  const name = textOf(body.name) || "there";
  const email = textOf(body.email);
  const phone = textOf(body.phone);
  const message = textOf(body.message) || textOf(body.text);
  const config = input.instance.config;
  const system = `You qualify leads and draft a short reply. Use only the business rules given. Reply as JSON: {"qualified":true|false,"summary":"...","reply":"..."}. Do not invent prices.`;
  const user = `Rules: ${textOf(config.qualifyNotes)}\nTone: ${textOf(config.greeting)}\nLead ${name} <${email}> ${phone}: ${message}`;
  const raw = await groqText(system, user);
  let qualified = Boolean(message);
  let summary = message.slice(0, 180) || "New lead";
  let reply = textOf(config.greeting) || `Thanks ${name}. We have your message and will follow up.`;
  if (raw) {
    try {
      const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "")) as { qualified?: boolean; summary?: string; reply?: string };
      if (typeof parsed.qualified === "boolean") qualified = parsed.qualified;
      if (parsed.summary) summary = parsed.summary;
      if (parsed.reply) reply = parsed.reply;
    } catch {
      reply = raw.slice(0, 500);
    }
  }
  input.doc.leads.push({
    id: randomUUID(),
    instanceId: input.instance.id,
    at: nowOf(input).toISOString(),
    name,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    message,
    qualified,
    summary,
  });
  await touch(input.instance, nowOf(input), "leads");
  if (email || phone) await sendOut(input, { email, phone, subject: `Re: ${input.instance.businessName}`, text: reply });
  await sendOut(input, {
    email: ownerEmail(input.instance),
    subject: `New lead: ${name}`,
    text: `${summary}\nQualified: ${qualified ? "yes" : "no"}\n${email} ${phone}\n${message}`,
    channel: "email",
  });
  return { ok: true, message: "Lead saved.", reply };
}

async function runPayments(input: EngineInput, escalate: boolean): Promise<{ ok: boolean; message: string }> {
  if (input.mode === "activate") {
    const rows = entriesFromConfig(input.instance.config);
    for (const row of rows) {
      const charge: AutomationCharge = {
        id: randomUUID(),
        instanceId: input.instance.id,
        name: row.name || "Customer",
        ...(row.email ? { email: row.email } : {}),
        ...(row.phone ? { phone: row.phone } : {}),
        amountKes: Math.max(0, Number(row.amountKes) || 0),
        ...(row.date ? { dueDate: row.date } : {}),
        ...(row.note ? { note: row.note } : {}),
        status: "unpaid",
        remindersSent: 0,
      };
      if (charge.amountKes > 0 && charge.email) {
        const link = await createChargeLink({
          email: charge.email,
          amountKes: charge.amountKes,
          chargeId: charge.id,
          instanceId: input.instance.id,
          label: `${input.instance.businessName} — ${charge.name}`,
          callbackUrl: `${input.origin}/api/paystack/callback`,
        });
        if (link.url) charge.payUrl = link.url;
        if (link.reference) charge.reference = link.reference;
      }
      input.doc.charges.push(charge);
      const due = row.date ? new Date(row.date) : new Date(nowOf(input).getTime() + 3 * 24 * 60 * 60 * 1000);
      const base = Number.isNaN(due.getTime()) ? nowOf(input) : due;
      const offsets = escalate ? [-3, 0, 7] : [-3, 0, 3];
      offsets.forEach((offset, step) => {
        const when = new Date(base.getTime() + offset * 24 * 60 * 60 * 1000);
        const runAt = when.getTime() < nowOf(input).getTime() ? plusHours(nowOf(input), 1 + step) : when.toISOString();
        schedule(input.doc, input.instance.id, runAt, "payment-reminder", { chargeId: charge.id, step });
      });
    }
    addLog(input.doc, input.instance.id, `Tracking ${rows.length} payment${rows.length === 1 ? "" : "s"}.`);
    return { ok: true, message: "Payment reminders scheduled." };
  }
  const charge = input.doc.charges.find((item) => item.id === input.job?.chargeId);
  if (!charge || charge.status === "paid") return { ok: true, message: "Already paid." };
  const step = input.job?.step ?? charge.remindersSent;
  const ladder = [
    `Hello ${charge.name}, a payment of KES ${charge.amountKes.toLocaleString("en-KE")} is coming due${charge.dueDate ? ` on ${charge.dueDate}` : ""}.`,
    `Hello ${charge.name}, KES ${charge.amountKes.toLocaleString("en-KE")} is now due. Please pay so we can close it.`,
    `Hello ${charge.name}, this is a final reminder for KES ${charge.amountKes.toLocaleString("en-KE")}.`,
  ];
  const notice = textOf(input.instance.config.notice);
  const text = `${escalate ? ladder[Math.min(step, 2)] : ladder[Math.min(step, 1)]}${notice ? `\n${notice}` : ""}${charge.payUrl ? `\nPay: ${charge.payUrl}` : "\nReply to this message if you need an invoice."}`;
  await sendOut(input, { email: charge.email, phone: charge.phone, subject: `Payment reminder — ${input.instance.businessName}`, text });
  charge.remindersSent += 1;
  await touch(input.instance, nowOf(input), "reminders");
  return { ok: true, message: "Reminder sent." };
}

function runBookingActivate(input: EngineInput): { ok: boolean; message: string } {
  if (input.mode === "activate") {
    addLog(input.doc, input.instance.id, `Booking page: /a/${input.instance.slug}/book`);
  }
  return { ok: true, message: "Booking page is on." };
}

async function runFaq(input: EngineInput): Promise<{ ok: boolean; message: string; reply?: string }> {
  if (input.mode === "activate") {
    addLog(input.doc, input.instance.id, `Widget script: /api/automations/widget/${input.instance.slug}`);
    return { ok: true, message: "FAQ bot is on." };
  }
  const question = textOf(input.body?.message) || textOf(input.body?.question);
  const knowledge = textOf(input.instance.config.knowledge);
  const system = `Answer only from the FAQ below. If the answer is not in the FAQ, say you do not have it and ask for an email. Do not use outside knowledge. FAQ:\n${knowledge}`;
  const reply = (await groqText(system, question)) || "I can only answer from the FAQ stored for this business, and that answer is not in it. Leave your email and the team will follow up.";
  const email = textOf(input.body?.email);
  const name = textOf(input.body?.name) || "Visitor";
  if (email || /do not have|not in it/i.test(reply)) {
    input.doc.leads.push({
      id: randomUUID(),
      instanceId: input.instance.id,
      at: nowOf(input).toISOString(),
      name,
      ...(email ? { email } : {}),
      message: question,
      summary: reply.slice(0, 180),
    });
    await touch(input.instance, nowOf(input), "leads");
    if (email) {
      await sendOut(input, { email: ownerEmail(input.instance), subject: `FAQ question from ${name}`, text: `${question}\n\n${reply}`, channel: "email" });
    }
  }
  return { ok: true, message: "Answered.", reply };
}

async function runReview(input: EngineInput): Promise<{ ok: boolean; message: string }> {
  if (input.mode === "activate") {
    addLog(input.doc, input.instance.id, `Review link: /a/${input.instance.slug}/review`);
    return { ok: true, message: "Review requests are on." };
  }
  if (input.mode === "hook") {
    const name = textOf(input.body?.name) || "there";
    const email = textOf(input.body?.email);
    const phone = textOf(input.body?.phone);
    const link = `${input.origin}/a/${input.instance.slug}/review`;
    await sendOut(input, {
      email,
      phone,
      subject: `How did we do? — ${input.instance.businessName}`,
      text: `Hello ${name}, please rate your experience: ${link}`,
    });
    return { ok: true, message: "Review request sent." };
  }
  return { ok: true, message: "Waiting for a rating." };
}

export async function recordReview(input: EngineInput, score: number, comment: string, name: string, email: string) {
  const maxLow = numOf(input.instance.config.lowScoreMax) || (input.instance.templateId === "nps" ? 6 : 3);
  input.doc.reviews.push({
    id: randomUUID(),
    instanceId: input.instance.id,
    at: nowOf(input).toISOString(),
    name: name || "Customer",
    ...(email ? { email } : {}),
    score,
    ...(comment ? { comment } : {}),
  });
  await touch(input.instance, nowOf(input), "leads");
  const google = textOf(input.instance.config.googleReviewUrl);
  if (score <= maxLow) {
    await sendOut(input, {
      email: ownerEmail(input.instance),
      subject: `Low score ${score} from ${name || "a customer"}`,
      text: `${comment || "No comment."}\n${email}`,
      channel: "email",
    });
    return { ok: true, message: "Thanks. The team has been told.", high: false as const };
  }
  return {
    ok: true,
    message: google ? "Thank you. A public review helps." : "Thank you.",
    high: true as const,
    google,
  };
}

async function runDigest(input: EngineInput): Promise<{ ok: boolean; message: string }> {
  const at = nowOf(input);
  if (input.mode === "activate") {
    schedule(input.doc, input.instance.id, plusDays(at, 1), "digest");
    addLog(input.doc, input.instance.id, "First report is scheduled.");
    return { ok: true, message: "Report scheduled." };
  }
  const mine = input.doc.instances.filter((item) => item.ownerEmail === input.instance.ownerEmail && !item.demo);
  const leads = input.doc.leads.filter((lead) => mine.some((item) => item.id === lead.instanceId)).length;
  const paid = input.doc.charges.filter((charge) => charge.status === "paid" && mine.some((item) => item.id === charge.instanceId));
  const payments = paid.reduce((sum, charge) => sum + charge.amountKes, 0);
  const messages = mine.reduce((sum, item) => sum + item.stats.messages, 0);
  const runs = mine.reduce((sum, item) => sum + item.stats.runs, 0);
  const metrics = Array.isArray(input.instance.config.metrics) ? input.instance.config.metrics.map(String) : ["leads", "payments", "messages", "runs"];
  const lines = [
    metrics.includes("leads") ? `Leads: ${leads}` : "",
    metrics.includes("payments") ? `Payments collected: KES ${payments.toLocaleString("en-KE")} across ${paid.length} charges` : "",
    metrics.includes("messages") ? `Messages: ${messages}` : "",
    metrics.includes("runs") ? `Runs: ${runs}` : "",
    textOf(input.instance.config.note),
  ].filter(Boolean);
  const recipients = textOf(input.instance.config.recipients) || ownerEmail(input.instance);
  await sendOut(input, {
    email: recipients.split(",")[0]?.trim() || ownerEmail(input.instance),
    subject: `${input.instance.businessName} report`,
    text: lines.join("\n"),
    channel: "email",
  });
  schedule(input.doc, input.instance.id, plusDays(at, input.instance.templateId === "daily-sales" ? 1 : 7), "digest");
  return { ok: true, message: "Report sent." };
}

async function runSequence(input: EngineInput): Promise<{ ok: boolean; message: string }> {
  const steps = textOf(input.instance.config.steps).split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (input.mode === "hook") {
    const name = textOf(input.body?.name) || "there";
    const email = textOf(input.body?.email);
    const phone = textOf(input.body?.phone);
    input.doc.leads.push({
      id: randomUUID(),
      instanceId: input.instance.id,
      at: nowOf(input).toISOString(),
      name,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      message: textOf(input.body?.message),
    });
    steps.forEach((step, index) => {
      schedule(input.doc, input.instance.id, plusDays(nowOf(input), index === 0 ? 0 : index * 2), "sequence", {
        step: index,
        label: JSON.stringify({ name, email, phone, text: step }),
      });
    });
    return { ok: true, message: "Sequence started." };
  }
  if (input.mode === "activate") {
    for (const row of entriesFromConfig(input.instance.config)) {
      steps.forEach((step, index) => {
        schedule(input.doc, input.instance.id, plusDays(nowOf(input), index + 1), "sequence", {
          step: index,
          label: JSON.stringify({ name: row.name, email: row.email, phone: row.phone, text: step }),
        });
      });
    }
    addLog(input.doc, input.instance.id, `Onboarding sequence has ${steps.length} steps.`);
    return { ok: true, message: "Sequence scheduled." };
  }
  let payload: { name?: string; email?: string; phone?: string; text?: string } = {};
  try {
    payload = JSON.parse(input.job?.label || "{}") as typeof payload;
  } catch {
    payload = {};
  }
  const text = fillTemplate(payload.text || steps[input.job?.step ?? 0] || "", { name: payload.name || "there" });
  await sendOut(input, { email: payload.email, phone: payload.phone, subject: input.instance.businessName, text });
  return { ok: true, message: "Step sent." };
}

async function runDates(input: EngineInput): Promise<{ ok: boolean; message: string }> {
  if (input.mode === "hook") {
    const name = textOf(input.body?.name) || "Guest";
    const email = textOf(input.body?.email);
    const phone = textOf(input.body?.phone);
    const eventDate = textOf(input.instance.config.eventDate);
    const rows = entriesFromConfig(input.instance.config);
    rows.push({ name, email, phone, date: eventDate, note: textOf(input.body?.note) || "yes" });
    input.instance.config = { ...input.instance.config, entries: rows };
    if (eventDate) {
      const when = new Date(eventDate);
      if (!Number.isNaN(when.getTime())) {
        schedule(input.doc, input.instance.id, plusDays(when, -1), "date-reminder", {
          label: JSON.stringify({ name, email, phone, date: eventDate, note: input.instance.config.eventName }),
        });
      }
    }
    addLog(input.doc, input.instance.id, `RSVP from ${name}.`);
    return { ok: true, message: "RSVP saved." };
  }
  if (input.mode === "activate") {
    const leadDays = numOf(input.instance.config.leadDays) || (input.instance.templateId === "clinic-recall" ? 0 : 1);
    const message = textOf(input.instance.config.message) || "Hello {{name}}, a reminder for {{note}} on {{date}}.";
    const recurrence = textOf(input.instance.config.recurrence);
    if (!recurrence) {
    for (const row of entriesFromConfig(input.instance.config)) {
      const base = row.date ? new Date(row.date) : nowOf(input);
      const recall = input.instance.templateId === "clinic-recall" ? numOf(input.instance.config.recallDays) || 180 : 0;
      const when = new Date(base.getTime() + recall * 24 * 60 * 60 * 1000 - leadDays * 24 * 60 * 60 * 1000);
      const runAt = when.getTime() < nowOf(input).getTime() ? plusDays(nowOf(input), 1) : when.toISOString();
      schedule(input.doc, input.instance.id, runAt, "date-reminder", {
        label: JSON.stringify({ ...row, message }),
      });
    }
    }
    if (recurrence) {
      schedule(input.doc, input.instance.id, plusDays(nowOf(input), recurrence === "daily" ? 1 : recurrence === "monthly" ? 30 : 7), "custom-reminder");
    }
    addLog(input.doc, input.instance.id, "Reminders scheduled.");
    return { ok: true, message: "Reminders scheduled." };
  }
  if (input.job?.kind === "custom-reminder") {
    const message = textOf(input.instance.config.message);
    const recipients = textOf(input.instance.config.recipients);
    const rows = entriesFromConfig(input.instance.config);
    const targets: Entry[] = rows.length
      ? rows
      : recipients
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
          .map((email) => ({ email }));
    for (const row of targets) {
      const text = fillTemplate(message, {
        name: row.name || "there",
        date: row.date || "",
        amount: row.amountKes || "",
        note: row.note || "",
        kind: row.kind || "",
      });
      await sendOut(input, { email: row.email, phone: row.phone, subject: input.instance.businessName, text });
    }
    const recurrence = textOf(input.instance.config.recurrence) || "weekly";
    schedule(input.doc, input.instance.id, plusDays(nowOf(input), recurrence === "daily" ? 1 : recurrence === "monthly" ? 30 : 7), "custom-reminder");
    return { ok: true, message: "Custom reminder sent." };
  }
  let payload: Entry & { message?: string } = {};
  try {
    payload = JSON.parse(input.job?.label || "{}") as typeof payload;
  } catch {
    payload = {};
  }
  const text = fillTemplate(payload.message || textOf(input.instance.config.message) || "Reminder for {{name}} on {{date}}.", {
    name: payload.name || "there",
    date: payload.date || textOf(input.instance.config.eventDate),
    note: payload.note || textOf(input.instance.config.eventName),
    kind: payload.kind || "",
  });
  await sendOut(input, { email: payload.email, phone: payload.phone, subject: `Reminder — ${input.instance.businessName}`, text });
  await touch(input.instance, nowOf(input), "reminders");
  return { ok: true, message: "Reminder sent." };
}

async function runStock(input: EngineInput): Promise<{ ok: boolean; message: string }> {
  const rows = entriesFromConfig(input.instance.config).filter((row) => numOf(row.qty) <= numOf(row.reorderAt));
  if (input.mode === "activate") {
    schedule(input.doc, input.instance.id, plusDays(nowOf(input), 1), "stock");
  }
  if (rows.length === 0) {
    if (input.mode !== "activate") schedule(input.doc, input.instance.id, plusDays(nowOf(input), 1), "stock");
    addLog(input.doc, input.instance.id, "Stock is above the reorder levels.");
    return { ok: true, message: "No low stock." };
  }
  await sendOut(input, {
    email: ownerEmail(input.instance),
    subject: `Low stock — ${input.instance.businessName}`,
    text: rows.map((row) => `${row.name}: ${row.qty} left (reorder at ${row.reorderAt})`).join("\n"),
    channel: "email",
  });
  if (input.mode !== "activate") schedule(input.doc, input.instance.id, plusDays(nowOf(input), 1), "stock");
  return { ok: true, message: "Low-stock alert sent." };
}

async function runDraft(input: EngineInput): Promise<{ ok: boolean; message: string }> {
  if (input.mode === "activate") {
    schedule(input.doc, input.instance.id, plusDays(nowOf(input), 1), "draft");
    return { ok: true, message: "Drafts scheduled." };
  }
  const topics = textOf(input.instance.config.topics);
  const draft =
    (await groqText(
      "Draft three short social posts the owner can publish. Do not claim they are already posted. Plain text.",
      topics
    )) || `Drafts (Groq is not configured yet):\n${topics}`;
  await sendOut(input, { email: ownerEmail(input.instance), subject: "Social drafts", text: draft, channel: "email" });
  schedule(input.doc, input.instance.id, plusDays(nowOf(input), 7), "draft");
  return { ok: true, message: "Drafts emailed." };
}

async function runInbox(input: EngineInput): Promise<{ ok: boolean; message: string }> {
  if (input.mode === "activate") {
    addLog(input.doc, input.instance.id, `POST an email to /api/automations/hooks/inbox/${input.instance.slug}`);
    return { ok: true, message: "Inbox triage is on." };
  }
  const from = textOf(input.body?.from);
  const subject = textOf(input.body?.subject) || "No subject";
  const body = textOf(input.body?.body) || textOf(input.body?.message);
  const draft =
    (await groqText(
      `Draft a reply the owner will send themselves. Do not send it. Follow these rules: ${textOf(input.instance.config.instructions)}`,
      `From: ${from}\nSubject: ${subject}\n\n${body}`
    )) || "Groq is not configured, so this draft is only a note to reply manually.";
  await sendOut(input, {
    email: ownerEmail(input.instance),
    subject: `Draft reply: ${subject}`,
    text: `Draft only. Not sent to ${from || "the sender"}.\n\n${draft}`,
    channel: "email",
  });
  return { ok: true, message: "Draft sent to the owner." };
}

async function runNotes(input: EngineInput): Promise<{ ok: boolean; message: string }> {
  if (input.mode === "activate") {
    addLog(input.doc, input.instance.id, `POST notes to /api/automations/hooks/notes/${input.instance.slug}`);
    return { ok: true, message: "Meeting notes are on." };
  }
  const notes = textOf(input.body?.notes) || textOf(input.body?.text) || textOf(input.body?.message);
  const summary =
    (await groqText(
      `Summarize the meeting notes and list action items. ${textOf(input.instance.config.instructions)} Use only the notes.`,
      notes
    )) || notes.slice(0, 1000);
  await sendOut(input, { email: ownerEmail(input.instance), subject: "Meeting summary", text: summary, channel: "email" });
  return { ok: true, message: "Summary emailed." };
}

async function runIntake(input: EngineInput): Promise<{ ok: boolean; message: string }> {
  if (input.mode === "activate") {
    addLog(input.doc, input.instance.id, `Request form: /a/${input.instance.slug}/request`);
    return { ok: true, message: "Intake form is on." };
  }
  const name = textOf(input.body?.name) || "Resident";
  const message = textOf(input.body?.message) || textOf(input.body?.note);
  const email = textOf(input.body?.email);
  const phone = textOf(input.body?.phone);
  input.doc.leads.push({
    id: randomUUID(),
    instanceId: input.instance.id,
    at: nowOf(input).toISOString(),
    name,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    message,
    summary: message.slice(0, 180),
  });
  await touch(input.instance, nowOf(input), "leads");
  await sendOut(input, {
    email: ownerEmail(input.instance),
    subject: `Maintenance request from ${name}`,
    text: `${message}\n${email} ${phone}\nCategories: ${textOf(input.instance.config.categories)}`,
    channel: "email",
  });
  return { ok: true, message: "Request received." };
}

export function markChargePaid(doc: AutomationDoc, chargeId: string): boolean {
  const charge = doc.charges.find((item) => item.id === chargeId);
  if (!charge || charge.status === "paid") return false;
  charge.status = "paid";
  charge.paidAt = new Date().toISOString();
  for (const job of doc.jobs) {
    if (job.chargeId === chargeId && job.status === "due") job.status = "cancelled";
  }
  const instance = doc.instances.find((item) => item.id === charge.instanceId);
  if (instance) {
    instance.stats.payments += 1;
    instance.updatedAt = charge.paidAt;
    addLog(doc, instance.id, `Payment received from ${charge.name} (KES ${charge.amountKes.toLocaleString("en-KE")}). Reminders stopped.`);
  }
  return true;
}
