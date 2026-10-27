import { siteConfig } from "@/data/site";
import { templateById } from "@/automations/templates/public";
import { renderBrandEmail, publicSiteUrl } from "@/lib/brand-email";
import { actionBadge, buildActionItems } from "@/lib/automations/action-center";
import { channelReadiness } from "@/lib/automations/channels";
import { channelForWaiting } from "@/lib/automations/delivery-plan";
import { runEngine, schedulePaymentReminders } from "@/lib/automations/engine";
import { entryKey, type InputRow } from "@/lib/automations/inputs";
import { createChargeLink } from "@/lib/automations/paylinks";
import { addAdminLog, addLog } from "@/lib/automations/store";
import {
  extendTrialEnd,
  markTrialReminder,
  nextTrialReminder,
  paidUntilFromTrial,
  TRIAL_DAYS,
  trialDaysRemaining,
  trialWindow,
} from "@/lib/automations/trial";
import { quoteBundle } from "@/automations/pricing";
import { markTrialStage, nextTrialStage, type TrialStage } from "@/lib/automations/trial-sequence";
import { trialOptOutUrl } from "@/lib/automations/trial-optout";
import type { AutomationCharge, AutomationDoc, AutomationInstance } from "@/lib/automations/types";
import { sendSms, sendWhatsApp, smsConfigured, whatsAppConfigured } from "@/lib/notify";
import { listPayments } from "@/lib/payments";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { claimIsFresh } from "@/lib/tick-claim";
import { mutateJsonFile } from "@/lib/storage";
import { emptyDoc } from "@/lib/automations/types";

const TICK_LOCK_MS = 10 * 60 * 1000;

async function ownerLetter(input: {
  to: string;
  subject: string;
  heading: string;
  paragraphs: string[];
  action?: { label: string; href: string };
  actions?: { label: string; href: string }[];
  card?: { label: string; value: string }[];
  unsubscribeUrl?: string;
}) {
  if (!isResendConfigured() || !input.to || input.to.endsWith("@example.com")) return false;
  const actions = input.actions || (input.action ? [input.action] : []);
  const letter = renderBrandEmail({
    heading: input.heading,
    greeting: "Hello,",
    paragraphs: input.paragraphs,
    ...(actions.length ? { actions } : {}),
    ...(input.card ? { card: input.card } : {}),
    ...(input.unsubscribeUrl
      ? { unsubscribeUrl: input.unsubscribeUrl, unsubscribeNote: "from trial tips. Trial reminders and receipts still arrive." }
      : {}),
  });
  const result = await sendResendEmail({ to: input.to, subject: input.subject, text: letter.text, html: letter.html });
  return result.sent;
}

export async function activateOnTrial(doc: AutomationDoc, instance: AutomationInstance, origin: string, now: Date) {
  if (instance.demo || instance.trial) return;
  const window = trialWindow(now);
  instance.trial = { start: window.start, endsAt: window.endsAt, remindersSent: [] };
  instance.status = "active";
  instance.activatedAt = now.toISOString();
  instance.updatedAt = instance.activatedAt;
  instance.periodEnd = window.endsAt;
  await runEngine({ doc, instance, mode: "activate", origin, now });
  addLog(doc, instance.id, `Free for ${TRIAL_DAYS} days, until ${window.endsAt.slice(0, 10)}. No card needed.`);
  addAdminLog(doc, "automated", "Trial started", `${instance.businessName} · ${instance.ownerEmail} · ${TRIAL_DAYS} days.`);
}

export async function sendTrialWelcome(doc: AutomationDoc, email: string) {
  const mine = doc.instances.filter((item) => item.ownerEmail === email && item.trial && !item.trial.welcomed && !item.demo);
  if (mine.length === 0) return;
  const days = trialDaysRemaining(mine[0].trial!.endsAt);
  const names = mine.map((item) => templateById(item.templateId)?.name || item.templateId);
  const sent = await ownerLetter({
    to: email,
    subject: `Your ${TRIAL_DAYS}-day trial is on`,
    heading: `${days} days free`,
    paragraphs: [
      `${mine[0].businessName} is live on The Beacon Studio.`,
      `Included: ${names.join(", ")}.`,
      `You have ${days} days left. No card is needed. When the trial ends the automations pause until you choose a plan or request an invoice.`,
      annualLine(mine),
      "Setup checklist: 1) Open the portal and fill in each automation's settings. 2) Add your customer list or connect your form. 3) Run a test and check the preview. 4) Connect SMS or WhatsApp when you are ready.",
    ],
    action: { label: "Open your portal", href: `${publicSiteUrl()}/portal` },
  });
  if (sent) {
    for (const item of mine) {
      if (item.trial) item.trial.welcomed = true;
    }
  }
}

export async function sweepTrials(doc: AutomationDoc, origin: string, now = new Date()) {
  for (const instance of doc.instances) {
    if (instance.demo || instance.trial || instance.status !== "pending_payment") continue;
    await activateOnTrial(doc, instance, origin, now);
  }
  const owners = new Set(doc.instances.filter((item) => item.trial && !item.trial.welcomed && !item.demo).map((item) => item.ownerEmail));
  for (const email of owners) await sendTrialWelcome(doc, email);

  await sendTrialSequence(doc, now);

  const reminders = new Map<string, { days: number; names: string[] }>();
  const ended = new Map<string, string[]>();

  for (const instance of doc.instances) {
    const trial = instance.trial;
    if (!trial || instance.demo) continue;
    if (trial.paidUntil && Date.parse(trial.paidUntil) > now.getTime()) continue;
    const days = trialDaysRemaining(trial.endsAt, now);
    if (days <= 0) {
      if (trial.endedAt || instance.status === "paused") {
        if (!trial.endedAt) trial.endedAt = now.toISOString();
        continue;
      }
      trial.endedAt = now.toISOString();
      instance.status = "paused";
      instance.updatedAt = trial.endedAt;
      addLog(doc, instance.id, "Trial ended. Paused until you choose a plan or request an invoice.");
      addAdminLog(doc, "automated", "Trial ended", `${instance.businessName} · ${instance.ownerEmail} is paused.`);
      const list = ended.get(instance.ownerEmail) || [];
      list.push(templateById(instance.templateId)?.name || instance.templateId);
      ended.set(instance.ownerEmail, list);
      continue;
    }
    const due = nextTrialReminder(trial.remindersSent, days);
    if (!due) continue;
    trial.remindersSent = markTrialReminder(trial.remindersSent, due);
    const bucket = reminders.get(instance.ownerEmail) || { days, names: [] };
    bucket.days = Math.min(bucket.days, days);
    bucket.names.push(templateById(instance.templateId)?.name || instance.templateId);
    reminders.set(instance.ownerEmail, bucket);
  }

  for (const [email, bucket] of reminders) {
    const sent = await ownerLetter({
      to: email,
      subject: `${bucket.days} day${bucket.days === 1 ? "" : "s"} left on your trial`,
      heading: `${bucket.days} days remaining`,
      paragraphs: [
        `Your free month on The Beacon Studio ends soon.`,
        bucket.names.join(", "),
        "Choose a plan or request an invoice from the portal. Nothing is deleted.",
      ],
      action: { label: "Open your portal", href: `${publicSiteUrl()}/portal` },
    });
    if (sent) addAdminLog(doc, "automated", "Trial reminder sent", `${email} · ${bucket.days} days left.`);
  }
  for (const [email, names] of ended) {
    await ownerLetter({
      to: email,
      subject: "Your trial has ended",
      heading: "Trial ended",
      paragraphs: [
        "The free month is over. The automations are paused, not deleted.",
        names.join(", "),
        "Request an invoice from the portal when you want them back on. Card checkout stays hidden until Paystack is connected.",
      ],
      action: { label: "Open your portal", href: `${publicSiteUrl()}/portal` },
    });
  }
}

export async function flushWaitingDeliveries(doc: AutomationDoc) {
  const smsReady = smsConfigured();
  const whatsappReady = whatsAppConfigured();
  if (!smsReady && !whatsappReady) return 0;
  let sent = 0;
  for (const delivery of doc.deliveries || []) {
    if (delivery.status !== "waiting") continue;
    const channel = channelForWaiting(delivery.channel === "email" ? "sms" : delivery.channel, smsReady, whatsappReady);
    if (!channel || !delivery.to) continue;
    const instance = doc.instances.find((item) => item.id === delivery.instanceId);
    if (!instance || instance.status !== "active" || instance.demo) continue;
    const result = channel === "sms" ? await sendSms(delivery.to, delivery.text) : await sendWhatsApp(delivery.to, delivery.text);
    if (!result.sent) continue;
    delivery.status = "sent";
    delivery.channel = channel;
    delivery.note = "Sent after the channel was connected.";
    instance.stats.messages += 1;
    sent += 1;
  }
  if (sent) addAdminLog(doc, "automated", "Queued messages sent", `${sent} waiting message${sent === 1 ? "" : "s"} left once SMS or WhatsApp connected.`);
  return sent;
}

export async function syncLedger(doc: AutomationDoc, instance: AutomationInstance, origin: string, now = new Date()) {
  if (templateById(instance.templateId)?.behavior !== "payment-cycle") return;
  if (instance.status !== "active") return;
  const rows = Array.isArray(instance.config.entries) ? (instance.config.entries as InputRow[]) : [];
  const escalate = instance.templateId === "debt-collection";
  for (const row of rows) {
    const key = entryKey(row);
    const existing = doc.charges.find((charge) => charge.instanceId === instance.id && charge.entryKey === key);
    if (existing) {
      if (existing.status === "unpaid") {
        existing.name = row.name || existing.name;
        existing.amountKes = Math.max(0, Number(row.amountKes) || 0);
        if (row.email) existing.email = row.email;
        if (row.phone) existing.phone = row.phone;
        if (row.date) existing.dueDate = row.date;
      }
      continue;
    }
    const charge: AutomationCharge = {
      id: crypto.randomUUID(),
      instanceId: instance.id,
      name: row.name || "Customer",
      ...(row.email ? { email: row.email } : {}),
      ...(row.phone ? { phone: row.phone } : {}),
      amountKes: Math.max(0, Number(row.amountKes) || 0),
      ...(row.date ? { dueDate: row.date } : {}),
      ...(row.note ? { note: row.note } : {}),
      status: "unpaid",
      remindersSent: 0,
      entryKey: key,
    };
    if (charge.amountKes > 0 && charge.email && !instance.demo) {
      const link = await createChargeLink({
        email: charge.email,
        amountKes: charge.amountKes,
        chargeId: charge.id,
        instanceId: instance.id,
        label: `${instance.businessName} — ${charge.name}`,
        callbackUrl: `${origin}/api/paystack/callback`,
      });
      if (link.url) charge.payUrl = link.url;
      if (link.reference) charge.reference = link.reference;
    }
    doc.charges.push(charge);
    schedulePaymentReminders(doc, instance.id, charge.id, row.date, escalate, now);
    addLog(doc, instance.id, `Added ${charge.name} to the ledger.`);
  }
}

export function extendInstanceTrial(instance: AutomationInstance, days: number, now = new Date()) {
  const window = trialWindow(now);
  if (!instance.trial) instance.trial = { start: window.start, endsAt: window.endsAt, remindersSent: [] };
  instance.trial.endsAt = extendTrialEnd(instance.trial.endsAt, days, now);
  delete instance.trial.endedAt;
  instance.trial.remindersSent = [];
  instance.status = "active";
  instance.periodEnd = instance.trial.paidUntil && Date.parse(instance.trial.paidUntil) > Date.parse(instance.trial.endsAt) ? instance.trial.paidUntil : instance.trial.endsAt;
  instance.updatedAt = now.toISOString();
}

export function endInstanceTrial(instance: AutomationInstance, now = new Date()) {
  const window = trialWindow(now);
  if (!instance.trial) instance.trial = { start: window.start, endsAt: now.toISOString(), remindersSent: [] };
  instance.trial.endsAt = now.toISOString();
  instance.trial.endedAt = now.toISOString();
  instance.status = "paused";
  instance.updatedAt = instance.trial.endedAt;
}

export function applyBundlePayment(doc: AutomationDoc, ids: string[], now = new Date(), source: "done" | "automated" = "automated") {
  for (const id of ids) {
    const instance = doc.instances.find((item) => item.id === id);
    if (!instance || instance.demo) continue;
    const billingDays = instance.billing === "annual" ? 365 : 30;
    if (!instance.trial) {
      const window = trialWindow(now);
      instance.trial = { start: window.start, endsAt: window.endsAt, remindersSent: [], welcomed: true };
    }
    instance.trial.paidUntil = paidUntilFromTrial(instance.trial.endsAt, billingDays, now);
    delete instance.trial.endedAt;
    instance.periodEnd = instance.trial.paidUntil;
    instance.status = "active";
    instance.updatedAt = now.toISOString();
    addLog(doc, instance.id, `Paid through ${instance.periodEnd.slice(0, 10)}. The paid period starts at the end of the trial.`);
  }
  addAdminLog(doc, source, "Invoice marked paid", `${ids.length} automation${ids.length === 1 ? "" : "s"} stay on after the trial.`);
}

export async function sendAdminDigest(doc: AutomationDoc, now = new Date()) {
  const last = Date.parse(doc.ops?.lastDigestAt || "");
  if (!Number.isNaN(last) && now.getTime() - last < 20 * 60 * 60 * 1000) return false;
  const payments = await listPayments();
  const items = buildActionItems({
    instances: doc.instances,
    charges: doc.charges,
    leads: doc.leads,
    jobs: doc.jobs,
    payments,
    channels: channelReadiness(),
    waiting: (doc.deliveries || []).filter((item) => item.status === "waiting").length,
    lastTickAt: doc.ops?.lastTickAt,
    now,
  });
  const open = items.filter((item) => item.blocking && item.count > 0);
  const recent = (doc.adminLog || []).filter((entry) => now.getTime() - Date.parse(entry.at) < 26 * 60 * 60 * 1000);
  const paragraphs = [
    open.length ? `Needs you: ${open.map((item) => item.title).join("; ")}.` : "Nothing is waiting on you.",
    recent.length ? `Handled since yesterday: ${recent.slice(-8).map((entry) => entry.title).join("; ")}.` : "The done log is quiet.",
    `Open items: ${actionBadge(items)}.`,
  ];
  const sent = await ownerLetter({
    to: process.env.ADMIN_EMAIL?.trim() || siteConfig.email,
    subject: open.length ? `Beacon admin: ${open.length} thing${open.length === 1 ? "" : "s"} to do` : "Beacon admin: nothing waiting",
    heading: "Daily admin digest",
    paragraphs,
    action: { label: "Open the action center", href: `${publicSiteUrl()}/admin#actions` },
  });
  if (!sent) return false;
  doc.ops = doc.ops || {};
  doc.ops.lastDigestAt = now.toISOString();
  addAdminLog(doc, "automated", "Daily digest sent", open.length ? open.map((item) => item.title).join(", ") : "Nothing waiting.");
  return true;
}

export async function claimAutomationTick(now = new Date()): Promise<boolean> {
  let claimed = false;
  await mutateJsonFile<AutomationDoc>("automations.json", emptyDoc(), (doc) => {
    doc.ops = doc.ops || {};
    if (claimIsFresh(doc.ops.tickLockedAt, now.getTime(), TICK_LOCK_MS)) return doc;
    doc.ops.tickLockedAt = now.toISOString();
    claimed = true;
    return doc;
  });
  return claimed;
}

export async function finishAutomationTick(ok: boolean, error?: string) {
  await mutateJsonFile<AutomationDoc>("automations.json", emptyDoc(), (doc) => {
    doc.ops = doc.ops || {};
    delete doc.ops.tickLockedAt;
    if (ok) {
      doc.ops.lastTickAt = new Date().toISOString();
      doc.ops.lastTickOk = true;
      delete doc.ops.lastTickError;
    } else {
      doc.ops.lastTickOk = false;
      doc.ops.lastTickError = (error || "Tick failed").slice(0, 300);
    }
    return doc;
  });
}

const STAGE_ORDER: TrialStage[] = ["digest-7", "digest-21", "keep"];

/** Which nurture stage each owner is due, grouped so one owner gets one email. Pure. */
export function planTrialSequence(doc: AutomationDoc, now = new Date()) {
  const plan = new Map<string, { stage: TrialStage; instances: AutomationInstance[] }>();
  for (const instance of doc.instances) {
    if (instance.demo || !instance.trial || instance.status !== "active") continue;
    const stage = nextTrialStage(instance.trial, now);
    if (!stage) continue;
    const current = plan.get(instance.ownerEmail);
    if (!current) {
      plan.set(instance.ownerEmail, { stage, instances: [instance] });
      continue;
    }
    current.instances.push(instance);
    if (STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(current.stage)) current.stage = stage;
  }
  return plan;
}

/** Record a stage on every instance of the owner. "keep" stands in for the 3-day reminder. */
export function recordTrialStage(instances: AutomationInstance[], stage: TrialStage) {
  for (const instance of instances) {
    if (!instance.trial) continue;
    instance.trial.stagesSent = markTrialStage(instance.trial.stagesSent, stage);
    if (stage === "keep") instance.trial.remindersSent = markTrialReminder(instance.trial.remindersSent, 3);
  }
}

function usageCard(instances: AutomationInstance[]) {
  const sum = (key: "runs" | "leads" | "payments" | "messages") => instances.reduce((total, item) => total + (item.stats?.[key] || 0), 0);
  return [
    { label: "Runs", value: String(sum("runs")) },
    { label: "Leads captured", value: String(sum("leads")) },
    { label: "Payments logged", value: String(sum("payments")) },
    { label: "Messages sent", value: String(sum("messages")) },
  ];
}

export function annualSavingKes(instances: AutomationInstance[]) {
  const ids = instances.map((item) => item.templateId);
  const monthly = quoteBundle(ids, { billing: "monthly" });
  const annual = quoteBundle(ids, { billing: "annual" });
  if (!monthly || !annual) return { monthlyKes: 0, savingKes: 0 };
  return {
    monthlyKes: monthly.recurringMonthlyKes,
    savingKes: Math.max(0, (monthly.recurringMonthlyKes - annual.recurringMonthlyKes) * 12),
  };
}

/** One line about the annual discount. Uses real quote figures only. */
export function annualLine(instances: AutomationInstance[]): string {
  const { savingKes } = annualSavingKes(instances);
  const percent = siteConfig.automationCatalog.annualDiscountPercent;
  return savingKes > 0
    ? `Pay yearly and save ${percent}%: KES ${savingKes.toLocaleString("en-KE")} a year on your current plan.`
    : `Pay yearly and save ${percent}% on any plan.`;
}

export async function sendTrialSequence(doc: AutomationDoc, now = new Date()) {
  const optOuts = new Set(doc.trialOptOuts || []);
  const site = publicSiteUrl();
  let sent = 0;
  for (const [email, { stage, instances }] of planTrialSequence(doc, now)) {
    if (optOuts.has(email)) {
      if (stage !== "keep") recordTrialStage(instances, stage);
      continue;
    }
    const unsubscribeUrl = trialOptOutUrl(email);
    const names = instances.map((item) => templateById(item.templateId)?.name || item.templateId).join(", ");
    const card = usageCard(instances);
    const empty = card.every((row) => row.value === "0");
    let ok = false;
    if (stage === "keep") {
      const { monthlyKes, savingKes } = annualSavingKes(instances);
      ok = await ownerLetter({
        to: email,
        subject: "Keep your automations running",
        heading: "3 days left",
        paragraphs: [
          `Your trial ends in 3 days. ${names}.`,
          `Monthly: KES ${monthlyKes.toLocaleString("en-KE")}.${savingKes > 0 ? ` Paying annually saves KES ${savingKes.toLocaleString("en-KE")} a year.` : ""}`,
          "Request an invoice from the portal, or book a short call to choose a plan. Nothing is deleted.",
        ],
        card,
        actions: [
          { label: "Request invoice", href: `${site}/portal` },
          { label: "Book a call", href: `${site}/book` },
        ],
        unsubscribeUrl,
      });
    } else {
      const day = stage === "digest-7" ? 7 : 21;
      ok = await ownerLetter({
        to: email,
        subject: `Day ${day}: what your automations did`,
        heading: `Day ${day} digest`,
        paragraphs: [
          empty
            ? "No runs yet. Finish the setup checklist in the portal so the automations can start working."
            : `Here is what ran for ${instances[0]?.businessName || "your business"} so far.`,
          names,
          annualLine(instances),
        ],
        card,
        action: { label: "Open your portal", href: `${site}/portal` },
        unsubscribeUrl,
      });
    }
    if (ok) {
      recordTrialStage(instances, stage);
      addAdminLog(doc, "automated", "Trial email sent", `${email} · ${stage}`);
      sent += 1;
    }
  }
  return sent;
}
