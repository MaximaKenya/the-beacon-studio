import assert from "node:assert/strict";
import test from "node:test";
import { TEMPLATE_DEFS } from "@/automations/templates/public";
import { HOW_IT_WORKS } from "@/lib/automations/how-it-works";
import { stockLevels, withOrgInputs } from "@/lib/automations/engine";
import {
  ORG_TEMPLATE_IDS,
  applyOrgInputs,
  checkValue,
  orgCompleteness,
  orgFieldsFor,
  orgMetrics,
  orgTemplateVars,
  readOrgInputs,
  strictKenyanPhone,
  validateOrgInputs,
} from "@/lib/automations/org-fields";
import type { AutomationInstance } from "@/lib/automations/types";

test("every automation has Organization inputs with at least one required field", () => {
  assert.deepEqual([...ORG_TEMPLATE_IDS].sort(), TEMPLATE_DEFS.map((def) => def.id).sort());
  for (const def of TEMPLATE_DEFS) {
    const fields = orgFieldsFor(def.id);
    assert.ok(fields.some((field) => field.required), `${def.id} has no required field`);
    assert.equal(new Set(fields.map((field) => field.key)).size, fields.length, `${def.id} repeats a key`);
    assert.match(HOW_IT_WORKS[def.id].needs, /Organization inputs/, `${def.id} card does not mention Organization inputs`);
  }
});

test("Kenyan phones normalise to +254 and bad ones are rejected", () => {
  assert.equal(strictKenyanPhone("0712 345 678"), "+254712345678");
  assert.equal(strictKenyanPhone("712345678"), "+254712345678");
  assert.equal(strictKenyanPhone("254-110-123-456"), "+254110123456");
  assert.equal(strictKenyanPhone("+254712345678"), "+254712345678");
  for (const bad of ["12345", "0812345678", "07123456789", "+1 202 555 0100"]) assert.equal(strictKenyanPhone(bad), null, bad);
});

test("each type validates with a clear message", () => {
  const money = checkValue({ label: "Late fee", type: "money", min: 0 }, "KES 1,500.50");
  assert.deepEqual(money, { ok: true, value: 150050 });
  assert.equal(checkValue({ label: "Late fee", type: "money" }, "1.555").ok, false);
  const badMoney = checkValue({ label: "Late fee", type: "money" }, "abc");
  assert.ok(!badMoney.ok && /Late fee: enter an amount in KES/.test(badMoney.error));
  assert.equal(checkValue({ label: "Fee", type: "money" }, "-5").ok, false);
  assert.deepEqual(checkValue({ label: "Commission", type: "percent" }, "12.5%"), { ok: true, value: 12.5 });
  assert.equal(checkValue({ label: "Commission", type: "percent" }, "150").ok, false);
  assert.equal(checkValue({ label: "Days", type: "integer", min: 1, max: 28 }, "2.5").ok, false);
  assert.equal(checkValue({ label: "Days", type: "integer", min: 1, max: 28 }, "29").ok, false);
  assert.deepEqual(checkValue({ label: "Day", type: "date" }, "2026-02-28"), { ok: true, value: "2026-02-28" });
  assert.equal(checkValue({ label: "Day", type: "date" }, "2026-02-30").ok, false);
  assert.deepEqual(checkValue({ label: "Opens", type: "time" }, "8:05"), { ok: true, value: "08:05" });
  assert.equal(checkValue({ label: "Opens", type: "time" }, "24:00").ok, false);
  assert.equal(checkValue({ label: "Email", type: "email" }, "nope").ok, false);
  assert.equal(checkValue({ label: "Site", type: "url" }, "javascript:alert(1)").ok, false);
  assert.equal(checkValue({ label: "Tone", type: "select", options: [{ value: "a", label: "A" }] }, "b").ok, false);
  assert.deepEqual(checkValue({ label: "Days", type: "multiselect", options: [{ value: "mon", label: "Mon" }, { value: "tue", label: "Tue" }] }, "mon, tue, mon"), {
    ok: true,
    value: ["mon", "tue"],
  });
  assert.equal(checkValue({ label: "Note", type: "text", maxLength: 5 }, "too long").ok, false);
  assert.equal(checkValue({ key: "mpesaPaybill", label: "Paybill", type: "text", maxLength: 10 }, "12ab").ok, false);
  const rows = checkValue(
    { label: "Levels", type: "rows", columns: [{ key: "item", label: "Item", type: "text", required: true }, { key: "level", label: "Level", type: "integer", min: 0 }] },
    [{ item: "Sugar", level: "x" }]
  );
  assert.ok(!rows.ok && /Levels row 1: Level/.test(rows.error));
});

test("validateOrgInputs drops unknown keys, checks custom fields, reports completeness", () => {
  const bad = validateOrgInputs("invoice-reminders", { values: { lateFee: "ten", contactPhone: "123" } });
  assert.equal(bad.ok, false);
  if (!bad.ok) {
    assert.ok(bad.errors.lateFee && bad.errors.contactPhone);
  }
  const dupe = validateOrgInputs("invoice-reminders", { values: {}, custom: [{ label: "Tier", type: "text" }, { label: "tier", type: "text" }] });
  assert.equal(dupe.ok, false);
  const badType = validateOrgInputs("invoice-reminders", { values: {}, custom: [{ label: "Tier", type: "script" }] });
  assert.equal(badType.ok, false);

  const good = validateOrgInputs("invoice-reminders", {
    values: { paymentTermsDays: "14", lateFee: "500", contactPhone: "0712345678", optOutText: "Reply STOP to opt out.", hacker: "x" },
    custom: [{ label: "Branch code", type: "integer", value: "7" }],
  });
  assert.ok(good.ok);
  if (!good.ok) return;
  assert.equal(good.org.values.lateFee, 50000);
  assert.equal(good.org.values.contactPhone, "+254712345678");
  assert.equal("hacker" in good.org.values, false);
  assert.deepEqual(good.org.custom[0], { id: "branch_code", label: "Branch code", type: "integer", value: 7 });
  const done = orgCompleteness("invoice-reminders", good.org);
  assert.equal(done.ready, true);
  assert.ok(done.percent > 0 && done.percent < 100);
  const empty = orgCompleteness("invoice-reminders", { values: {}, custom: [] });
  assert.deepEqual(empty.requiredMissing.map((item) => item.key).sort(), ["optOutText", "paymentTermsDays"]);
  assert.equal(validateOrgInputs("invoice-reminders", { values: {} }, { requireAll: true }).ok, false);
});

test("old saved config still works and legacy keys are mirrored", () => {
  const old = { lowScoreMax: 3, googleReviewUrl: "https://g.page/r/x" };
  const read = readOrgInputs("reviews", old);
  assert.equal(read.values.lowScoreMax, 3);
  assert.equal(read.values.googleReviewUrl, "https://g.page/r/x");
  assert.equal(orgCompleteness("reviews", read).requiredMissing.some((item) => item.key === "lowScoreMax"), false);
  assert.deepEqual(readOrgInputs("lead-reply", undefined), { values: {}, custom: [] });
  const next = applyOrgInputs("clinic-recall", { recallDays: 90, other: "kept" }, { values: { recallDays: 180 }, custom: [] });
  assert.equal(next.recallDays, 180);
  assert.equal(next.other, "kept");
});

function instance(templateId: string, config: Record<string, unknown>): AutomationInstance {
  return { id: "i1", templateId, ownerEmail: "owner@example.com", businessName: "Biz", config } as unknown as AutomationInstance;
}

test("values reach messages, stock levels and chart metrics", () => {
  const checked = validateOrgInputs("invoice-reminders", {
    values: { paymentTermsDays: "14", lateFee: "500", mpesaPaybill: "522522", contactPhone: "0712345678", optOutText: "Reply STOP to opt out.", signOff: "Asante" },
    custom: [{ label: "Branch", type: "text", value: "Westlands" }],
  });
  assert.ok(checked.ok);
  if (!checked.ok) return;
  const config = applyOrgInputs("invoice-reminders", {}, checked.org);
  const vars = orgTemplateVars("invoice-reminders", config);
  assert.equal(vars.lateFee, "KES 500");
  assert.equal(vars.lateFeeKes, 500);
  assert.equal(vars.branch, "Westlands");
  const out = withOrgInputs({ instance: instance("invoice-reminders", config) }, { email: "c@example.com", subject: "Pay {{branch}}", text: "Late fee is {{lateFee}}. {{unknown}}" });
  assert.equal(out.subject, "Pay Westlands");
  assert.match(out.text, /Late fee is KES 500\. \{\{unknown\}\}/);
  assert.match(out.text, /paybill 522522/);
  assert.match(out.text, /Reply STOP to opt out\./);
  assert.match(out.text, /\+254712345678/);
  const toOwner = withOrgInputs({ instance: instance("invoice-reminders", config) }, { email: "owner@example.com", subject: "Digest", text: "Numbers" });
  assert.equal(toOwner.text, "Numbers");
  assert.ok(orgMetrics("invoice-reminders", config).some((metric) => metric.label === "Late fee" && metric.value === 500));

  const stock = validateOrgInputs("low-stock", { values: { defaultReorderLevel: "10", reorderLevels: [{ item: "Sugar", level: "25" }] } });
  assert.ok(stock.ok);
  if (!stock.ok) return;
  const levels = stockLevels(instance("low-stock", applyOrgInputs("low-stock", {}, stock.org)));
  assert.equal(levels({ name: "sugar", qty: 20 }), 25);
  assert.equal(levels({ name: "Flour", qty: 5 }), 10);
  assert.equal(levels({ name: "Rice", qty: 5, reorderAt: 3 }), 3);
});
