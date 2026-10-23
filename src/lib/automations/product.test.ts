import assert from "node:assert/strict";
import test from "node:test";
import { planChannels, channelForWaiting } from "@/lib/automations/delivery-plan";
import { forwardingTargets } from "@/lib/automations/forwarding";
import { entryKey } from "@/lib/automations/inputs";
import { initialCustomReminderAt, nextYearlyIso, paymentReminderText, splitRecipients } from "@/lib/automations/messages";
import { normalizeKenyanPhone } from "@/lib/automations/phone";
import { tickHealth } from "@/lib/automations/tick-health";
import { TRIAL_DAYS, markTrialReminder, nextTrialReminder, trialDaysRemaining, trialWindow } from "@/lib/automations/trial";
import { markChargePaid } from "@/lib/automations/engine";
import { emptyDoc } from "@/lib/automations/types";
import { formatBookingWhen } from "@/lib/time";

test("trial window is 30 days and the counter counts down", () => {
  const start = new Date("2026-01-01T00:00:00.000Z");
  const window = trialWindow(start);
  assert.equal(TRIAL_DAYS, 30);
  assert.equal(trialDaysRemaining(window.endsAt, start), 30);
  const later = new Date(start.getTime() + 23 * 24 * 60 * 60 * 1000);
  assert.equal(trialDaysRemaining(window.endsAt, later), 7);
  assert.equal(trialDaysRemaining(window.endsAt, new Date(window.endsAt)), 0);
});

test("trial reminders fire at 7, 3, and 1 day and skip ones already passed", () => {
  assert.equal(nextTrialReminder([], 8), null);
  assert.equal(nextTrialReminder([], 7), 7);
  assert.equal(nextTrialReminder([], 3), 3);
  assert.equal(nextTrialReminder([7], 3), 3);
  assert.equal(nextTrialReminder([], 1), 1);
  assert.deepEqual(markTrialReminder([], 3).sort(), [3, 7]);
  assert.equal(nextTrialReminder(markTrialReminder([], 3), 3), null);
});

test("non-escalating ladder does not say now due twice", () => {
  const due = paymentReminderText({ step: 1, escalate: false, name: "Amina", amountKes: 1000 });
  const follow = paymentReminderText({ step: 2, escalate: false, name: "Amina", amountKes: 1000 });
  assert.match(due, /now due/);
  assert.doesNotMatch(follow, /now due/);
  assert.notEqual(due, follow);
  assert.match(paymentReminderText({ step: 2, escalate: true, name: "Amina", amountKes: 1000 }), /final reminder/);
});

test("reports keep every recipient", () => {
  assert.deepEqual(splitRecipients("a@studio.test, b@studio.test", "owner@studio.test"), ["a@studio.test", "b@studio.test"]);
  assert.deepEqual(splitRecipients("", "owner@studio.test"), ["owner@studio.test"]);
});

test("custom reminder is due immediately, then birthdays repeat next year", () => {
  const now = new Date("2026-10-23T06:00:00.000Z");
  assert.equal(initialCustomReminderAt(now), now.toISOString());
  assert.notEqual(initialCustomReminderAt(now), new Date(now.getTime() + 7 * 86400000).toISOString());
  const next = nextYearlyIso("1990-04-02", now);
  assert.equal(next && new Date(next).toISOString().startsWith("2027-04-02"), true);
});

test("channel plan prefers what is connected and queues the rest", () => {
  const phoneOnly = planChannels({ preference: "both", phone: "0712345678", smsReady: false, whatsappReady: false });
  assert.deepEqual(phoneOnly.send, []);
  assert.deepEqual(phoneOnly.waiting, ["sms"]);
  assert.equal(phoneOnly.phone, "+254712345678");

  const sms = planChannels({ preference: "both", phone: "+254712345678", smsReady: true, whatsappReady: false });
  assert.deepEqual(sms.send, ["sms"]);

  const emailFirst = planChannels({ preference: "email", email: "a@studio.test", phone: "0712345678", smsReady: true, whatsappReady: true });
  assert.deepEqual(emailFirst.send, ["email"]);

  const fallback = planChannels({ preference: "sms", email: "a@studio.test", phone: "0712345678", smsReady: false, whatsappReady: true });
  assert.deepEqual(fallback.send, ["whatsapp"]);

  assert.equal(channelForWaiting("sms", false, true), "whatsapp");
});

test("Kenyan numbers become +254", () => {
  assert.equal(normalizeKenyanPhone("0712 345 678"), "+254712345678");
  assert.equal(normalizeKenyanPhone("712345678"), "+254712345678");
  assert.equal(normalizeKenyanPhone("+254712345678"), "+254712345678");
  assert.equal(normalizeKenyanPhone("2540712345678"), "+254712345678");
  assert.equal(normalizeKenyanPhone("123"), "");
});

test("mark paid stops reminder jobs", () => {
  const doc = emptyDoc();
  doc.charges.push({
    id: "charge-1",
    instanceId: "inst-1",
    name: "Amina",
    amountKes: 500,
    status: "unpaid",
    remindersSent: 1,
    entryKey: entryKey({ name: "Amina", amountKes: 500 }),
  });
  doc.instances.push({
    id: "inst-1",
    templateId: "rent-collection",
    slug: "rent",
    ownerName: "Max",
    ownerEmail: "owner@studio.test",
    businessName: "Jamii",
    status: "active",
    config: {},
    monthlyKes: 0,
    monthlyUsd: 0,
    setupFeeKes: 0,
    billing: "monthly",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    stats: { runs: 0, leads: 0, messages: 0, payments: 0, reminders: 0 },
    notes: [],
  });
  doc.jobs.push({
    id: "job-1",
    instanceId: "inst-1",
    runAt: "2026-01-02T00:00:00.000Z",
    status: "due",
    kind: "payment-reminder",
    chargeId: "charge-1",
  });
  assert.equal(markChargePaid(doc, "charge-1"), true);
  assert.equal(doc.charges[0]?.status, "paid");
  assert.equal(doc.jobs[0]?.status, "cancelled");
  assert.equal(markChargePaid(doc, "charge-1"), false);
});

test("booking times are shown in Nairobi, not GMT", () => {
  const label = formatBookingWhen("2026-01-15T09:00:00.000Z");
  assert.match(label, /12:00/);
  assert.match(label, /Nairobi/);
  assert.doesNotMatch(label, /GMT/);
});

test("tick health warns after two hours", () => {
  const now = new Date("2026-10-23T12:00:00.000Z");
  assert.equal(tickHealth(new Date(now.getTime() - 60 * 60 * 1000).toISOString(), now).warning, false);
  assert.equal(tickHealth(new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), now).warning, true);
  assert.equal(tickHealth(undefined, now).warning, true);
});

test("forwarding addresses map to inbox and notes", () => {
  assert.deepEqual(forwardingTargets(["Notes+Lead-Reply-Ab12@thebeaconstudio.co.ke"]), [{ kind: "notes", slug: "lead-reply-ab12" }]);
  assert.deepEqual(forwardingTargets("hello@thebeaconstudio.co.ke"), []);
});
