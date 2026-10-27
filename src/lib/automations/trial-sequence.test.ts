import { test } from "node:test";
import assert from "node:assert/strict";
import { markTrialStage, nextTrialStage, trialPortalStage } from "@/lib/automations/trial-sequence";
import { planTrialSequence, recordTrialStage } from "@/lib/automations/lifecycle";
import { nextTrialReminder } from "@/lib/automations/trial";
import { emptyDoc, type AutomationInstance } from "@/lib/automations/types";

const DAY = 86_400_000;
const start = new Date("2026-05-01T08:00:00Z");
const at = (day: number, hours = 1) => new Date(start.getTime() + day * DAY + hours * 3_600_000);
const trial = () => ({ start: start.toISOString(), endsAt: new Date(start.getTime() + 30 * DAY).toISOString(), remindersSent: [] as number[] });

test("schedule: nothing before day 7, then 7, 21 and keep at 3 days left", () => {
  assert.equal(nextTrialStage(trial(), at(0)), null);
  assert.equal(nextTrialStage(trial(), at(6)), null);
  assert.equal(nextTrialStage(trial(), at(7)), "digest-7");
  assert.equal(nextTrialStage(trial(), at(21)), "digest-21");
  assert.equal(nextTrialStage(trial(), at(27)), "keep");
  assert.equal(nextTrialStage(trial(), at(29, 2)), null);
  assert.equal(nextTrialStage({ ...trial(), paidUntil: "2026-07-01T00:00:00Z" }, at(21)), null);
});

test("idempotent: a sent stage never repeats and late ticks do not back-fill", () => {
  const t = { ...trial(), stagesSent: markTrialStage(undefined, "digest-7") };
  assert.equal(nextTrialStage(t, at(8)), null);
  assert.equal(nextTrialStage(t, at(21)), "digest-21");
  const late = { ...trial(), stagesSent: markTrialStage(undefined, "digest-21") };
  assert.equal(nextTrialStage(late, at(22)), null);
  const kept = { ...trial(), stagesSent: markTrialStage(undefined, "keep") };
  assert.equal(nextTrialStage(kept, at(28)), null);
  assert.deepEqual(new Set(kept.stagesSent), new Set(["keep", "digest-7", "digest-21"]));
});

function instance(id: string, email: string, t = trial()): AutomationInstance {
  return {
    id, templateId: "lead-reply", slug: id, ownerName: "A", ownerEmail: email, businessName: "B", status: "active",
    config: {}, monthlyKes: 1000, monthlyUsd: 8, setupFeeKes: 0, billing: "monthly", createdAt: "x", updatedAt: "x",
    stats: { runs: 0, leads: 0, messages: 0, payments: 0, reminders: 0 }, notes: [], trial: t,
  } as unknown as AutomationInstance;
}

test("one email per owner, and keep replaces the 3-day reminder", () => {
  const doc = emptyDoc();
  doc.instances.push(instance("a", "x@y.com"), instance("b", "x@y.com"), instance("c", "z@y.com"));
  const plan = planTrialSequence(doc, at(27));
  assert.equal(plan.size, 2);
  const mine = plan.get("x@y.com")!;
  assert.equal(mine.stage, "keep");
  assert.equal(mine.instances.length, 2);
  recordTrialStage(mine.instances, "keep");
  assert.equal(nextTrialReminder(mine.instances[0].trial!.remindersSent, 3), null);
  assert.equal(nextTrialReminder(mine.instances[0].trial!.remindersSent, 1), 1);
  assert.equal(planTrialSequence(doc, at(27, 2)).has("x@y.com"), false);
});

test("portal stage labels follow the calendar", () => {
  assert.equal(trialPortalStage(trial(), at(1)), "setup");
  assert.equal(trialPortalStage(trial(), at(10)), "running");
  assert.equal(trialPortalStage(trial(), at(25)), "ending");
  assert.equal(trialPortalStage({ ...trial(), endedAt: "x" }, at(31)), "ended");
  assert.equal(trialPortalStage({ ...trial(), paidUntil: "x" }, at(10)), "paid");
});
