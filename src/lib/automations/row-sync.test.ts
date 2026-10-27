import assert from "node:assert/strict";
import test from "node:test";
import { runEngine } from "@/lib/automations/engine";
import { syncScheduledRows } from "@/lib/automations/lifecycle";
import { emptyDoc, type AutomationInstance } from "@/lib/automations/types";

function instance(templateId: string, config: Record<string, unknown>): AutomationInstance {
  return {
    id: "inst-1",
    templateId,
    slug: templateId,
    ownerName: "Max",
    ownerEmail: "owner@studio.test",
    businessName: "Jamii",
    status: "active",
    config,
    monthlyKes: 0,
    monthlyUsd: 0,
    setupFeeKes: 0,
    billing: "monthly",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    stats: { runs: 0, leads: 0, messages: 0, payments: 0, reminders: 0 },
    notes: [],
    demo: true,
  };
}

test("a dated row added after signup gets one reminder, signup rows are not rescheduled", async () => {
  const doc = emptyDoc();
  const item = instance("greetings", { entries: [{ name: "Amina", email: "a@studio.test", date: "2026-12-01" }] });
  doc.instances.push(item);
  await runEngine({ doc, instance: item, mode: "activate", origin: "https://studio.test", now: new Date("2026-11-01T00:00:00.000Z") });
  assert.equal(doc.jobs.length, 1);
  item.config = { entries: [...(item.config.entries as object[]), { name: "Brian", email: "b@studio.test", date: "2026-12-05" }] };
  assert.equal(syncScheduledRows(doc, item, new Date("2026-11-01T00:00:00.000Z")), 1);
  assert.equal(doc.jobs.length, 2);
  assert.equal(syncScheduledRows(doc, item, new Date("2026-11-01T00:00:00.000Z")), 0);
});

test("a sequence row added after signup gets every step once", async () => {
  const doc = emptyDoc();
  const item = instance("onboarding", { steps: "Welcome\nTip\nCheck-in", entries: [{ name: "Amina", email: "a@studio.test" }] });
  doc.instances.push(item);
  await runEngine({ doc, instance: item, mode: "activate", origin: "https://studio.test", now: new Date("2026-11-01T00:00:00.000Z") });
  assert.equal(doc.jobs.length, 3);
  item.config = { ...item.config, entries: [...(item.config.entries as object[]), { name: "Brian", email: "b@studio.test" }] };
  assert.equal(syncScheduledRows(doc, item, new Date("2026-11-01T00:00:00.000Z")), 1);
  assert.equal(doc.jobs.length, 6);
  assert.equal(syncScheduledRows(doc, item, new Date("2026-11-01T00:00:00.000Z")), 0);
});
