import { test } from "node:test";
import assert from "node:assert/strict";
import { countRequests, parseRevenueRequest, type RevenueRequest } from "./revenue-requests-rules";

test("valid WhatsApp add-on request", () => {
  const result = parseRevenueRequest({ kind: "whatsapp-addon", name: "Amina", email: "AMINA@Example.com ", item: "wa-growth", message: "Hi" });
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal(result.value.email, "amina@example.com");
    assert.equal(result.value.itemLabel, "WhatsApp Growth");
  }
});

test("rejects honeypot, bad email, unknown kind and bad option", () => {
  assert.equal(parseRevenueRequest({ kind: "pro-addon", name: "A", email: "a@b.co", website: "spam" }).ok, false);
  assert.equal(parseRevenueRequest({ kind: "pro-addon", name: "A", email: "nope" }).ok, false);
  assert.equal(parseRevenueRequest({ kind: "free-money", name: "A", email: "a@b.co" }).ok, false);
  assert.equal(parseRevenueRequest({ kind: "care-plan", name: "A", email: "a@b.co", item: "care-gold" }).ok, false);
});

test("partner needs a business; template needs no name", () => {
  assert.equal(parseRevenueRequest({ kind: "partner", name: "A", email: "a@b.co" }).ok, false);
  assert.equal(parseRevenueRequest({ kind: "partner", name: "A", email: "a@b.co", company: "Agency" }).ok, true);
  const template = parseRevenueRequest({ kind: "template", email: "a@b.co", item: "rent-tracker" });
  assert.ok(template.ok);
});

test("M-Pesa uses are validated", () => {
  assert.equal(parseRevenueRequest({ kind: "mpesa-addon", name: "A", email: "a@b.co", item: "sacco" }).ok, true);
  assert.equal(parseRevenueRequest({ kind: "mpesa-addon", name: "A", email: "a@b.co", item: "crypto" }).ok, false);
});

test("countRequests groups add-ons and open items", () => {
  const base = { createdAt: "2026-10-27T00:00:00Z", name: "A", email: "a@b.co" };
  const list: RevenueRequest[] = [
    { ...base, id: "1", kind: "care-plan", status: "new" },
    { ...base, id: "2", kind: "whatsapp-addon", status: "done" },
    { ...base, id: "3", kind: "partner", status: "new" },
    { ...base, id: "4", kind: "template", status: "done" },
  ];
  const counts = countRequests(list);
  assert.equal(counts.addOns, 2);
  assert.equal(counts.open, 2);
  assert.equal(counts.counts.partner, 1);
  assert.equal(counts.counts.template, 1);
});
