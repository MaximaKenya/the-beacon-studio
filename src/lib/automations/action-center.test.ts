import assert from "node:assert/strict";
import { test } from "node:test";
import { buildActionItems } from "@/lib/automations/action-center";

const channels = { email: "ready", sms: "ready", whatsapp: "ready" } as never;

function base(instances: { id: string; demo?: boolean }[], leads: { id: string; instanceId: string }[]) {
  return buildActionItems({
    instances: instances.map((item) => ({ status: "active", ownerEmail: "a@example.com", businessName: "A", createdAt: "2020-01-01T00:00:00Z", ...item })),
    charges: [],
    leads: leads.map((lead) => ({ at: "2026-01-01T00:00:00Z", ...lead })),
    jobs: [{ id: "j", status: "failed", failed: true, runAt: "2026-01-01T00:00:00Z", instanceId: "sandbox-x" }],
    payments: [],
    channels,
    waiting: 0,
    lastTickAt: new Date().toISOString(),
  });
}

test("demo sandbox leads and jobs never need the studio", () => {
  const items = base([{ id: "sandbox-x", demo: true }], [{ id: "l1", instanceId: "sandbox-x" }]);
  assert.equal(items.find((item) => item.id === "unread-leads"), undefined);
  assert.equal(items.some((item) => item.count > 0 && /fail/i.test(item.title)), false);
});

test("real client leads still show as unread", () => {
  const items = base([{ id: "real-1" }, { id: "sandbox-x", demo: true }], [
    { id: "l1", instanceId: "real-1" },
    { id: "l2", instanceId: "sandbox-x" },
  ]);
  assert.equal(items.find((item) => item.id === "unread-leads")?.count, 1);
});
