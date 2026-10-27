import assert from "node:assert/strict";
import test from "node:test";
import { adapterFor } from "@/lib/hub/adapters";
import { findAppByKey, resolveApps, type AppCreds } from "@/lib/hub/apps";
import { appendLedger, walletSummary } from "@/lib/hub/ledger";
import { collectionCapReason, collectionWindowOpen, kenyanHolidays, kenyanNetwork, normalizePhone } from "@/lib/hub/policy";
import { acceptMessage, addSuppression, deliverCallbacks, dispatchQueued, parseSendBody } from "@/lib/hub/service";
import { ReplayGuard, signPayload, verifySignature } from "@/lib/hub/signature";
import { emptyState } from "@/lib/hub/state";

const env = (e: Record<string, string>) => e as unknown as NodeJS.ProcessEnv;
const creds: AppCreds = { app: "cadenceapp", key: "k1", secret: "s1", callbackUrl: "https://cadence.example/api/hub/events", source: "env", pricing: "transfer", enforceWallet: false };
// Tuesday 27 Oct 2026, 10:00 EAT
const TUE_10 = new Date("2026-10-27T07:00:00Z");

function input(over: Record<string, unknown> = {}) {
  const p = parseSendBody({ app: "cadenceapp", channel: "sms", to: "0712345678", body: "Hi", reference: "r1", ...over });
  assert.ok(p.ok, JSON.stringify(p));
  return p.input;
}

test("signature: valid, invalid, skew, replay", () => {
  const now = 1_800_000_000_000;
  const ts = String(now / 1000);
  const body = '{"a":1}';
  const sig = signPayload("sec", ts, body);
  assert.match(sig, /^sha256=[0-9a-f]{64}$/);
  assert.deepEqual(verifySignature("sec", ts, sig, body, now), { ok: true });
  assert.equal(verifySignature("sec", ts, sig, '{"a":2}', now).ok, false);
  assert.equal(verifySignature("other", ts, sig, body, now).ok, false);
  assert.deepEqual(verifySignature("sec", ts, sig, body, now + 301_000), { ok: false, reason: "timestamp_skew" });
  const guard = new ReplayGuard();
  assert.equal(guard.check(sig, now), true);
  assert.equal(guard.check(sig, now + 1000), false);
});

test("phone normalisation and network", () => {
  assert.equal(normalizePhone("0712 345 678"), "+254712345678");
  assert.equal(normalizePhone("254733000111"), "+254733000111");
  assert.equal(normalizePhone("+447700900123"), "+447700900123");
  assert.equal(normalizePhone("12"), null);
  assert.equal(kenyanNetwork("+254712345678"), "safaricom");
  assert.equal(kenyanNetwork("+254733000111"), "airtel");
});

test("validation", () => {
  assert.equal(parseSendBody({ app: "x", channel: "sms", to: "0712345678", reference: "r" }).ok, false);
  assert.equal(parseSendBody({ app: "x", channel: "fax", to: "0712345678", body: "b", reference: "r" }).ok, false);
  assert.equal(parseSendBody({ app: "x", channel: "sms", to: "0712345678", templateKey: "t", reference: "r" }).ok, true);
});

test("idempotency returns the original id", () => {
  const s = emptyState();
  const a = acceptMessage(s, creds, input(), TUE_10);
  const b = acceptMessage(s, creds, input({ body: "changed" }), TUE_10);
  assert.equal(a.status, "queued");
  assert.equal(b.id, a.id);
  assert.equal(b.duplicate, true);
  assert.equal(s.messages.length, 1);
  // Same reference from another app is a different message.
  const c = acceptMessage(s, { ...creds, app: "confirent" }, { ...input(), app: "confirent" }, TUE_10);
  assert.notEqual(c.id, a.id);
});

test("opt-out suppresses per app+number+channel and queues a callback for inbound STOP", () => {
  const s = emptyState();
  addSuppression(s, creds, "+254712345678", "sms", "inbound:mock", TUE_10);
  assert.equal(s.callbacks.length, 1);
  assert.equal(JSON.parse(s.callbacks[0].payload).type, "opt_out");
  assert.equal(acceptMessage(s, creds, input(), TUE_10).reason, "opted_out");
  assert.equal(acceptMessage(s, creds, input({ channel: "whatsapp", reference: "r2" }), TUE_10).status, "queued");
  assert.equal(acceptMessage(s, { ...creds, app: "confirent" }, { ...input({ reference: "r3" }), app: "confirent" }, TUE_10).status, "queued");
});

test("marketing needs consentRef", () => {
  const s = emptyState();
  assert.equal(acceptMessage(s, creds, input({ category: "marketing" }), TUE_10).reason, "marketing_requires_consent");
  assert.equal(acceptMessage(s, creds, input({ category: "marketing", consentRef: "c1", reference: "r2" }), TUE_10).status, "queued");
});

test("collection window: hours, Sunday, public holidays", () => {
  assert.equal(collectionWindowOpen(TUE_10).ok, true);
  assert.equal(collectionWindowOpen(new Date("2026-10-27T04:59:00Z")).reason, "collection_outside_hours"); // 07:59 EAT
  assert.equal(collectionWindowOpen(new Date("2026-10-27T16:00:00Z")).reason, "collection_outside_hours"); // 19:00 EAT
  assert.equal(collectionWindowOpen(new Date("2026-10-27T15:59:00Z")).ok, true); // 18:59 EAT
  assert.equal(collectionWindowOpen(new Date("2026-10-25T07:00:00Z")).reason, "collection_outside_days"); // Sunday
  assert.equal(collectionWindowOpen(new Date("2026-10-20T07:00:00Z")).reason, "collection_public_holiday"); // Mashujaa
  assert.ok(kenyanHolidays(2026).has("2026-04-03")); // Good Friday
  assert.ok(kenyanHolidays(2026).has("2026-04-06")); // Easter Monday
  const s = emptyState();
  assert.equal(acceptMessage(s, creds, input({ category: "collection" }), new Date("2026-10-25T07:00:00Z")).status, "rejected");
});

test("collection caps: 1/day, 3/week per debtor", () => {
  const now = TUE_10;
  assert.equal(collectionCapReason([], now), undefined);
  assert.equal(collectionCapReason(["2026-10-27T05:30:00Z"], now), "collection_daily_cap");
  assert.equal(collectionCapReason(["2026-10-24T07:00:00Z", "2026-10-23T07:00:00Z", "2026-10-22T07:00:00Z"], now), "collection_weekly_cap");
  assert.equal(collectionCapReason(["2026-10-24T07:00:00Z", "2026-10-23T07:00:00Z", "2026-10-19T07:00:00Z"], now), undefined);
  const s = emptyState();
  assert.equal(acceptMessage(s, creds, input({ category: "collection" }), now).status, "queued");
  assert.equal(acceptMessage(s, creds, input({ category: "collection", reference: "r2" }), new Date(now.getTime() + 3600_000)).reason, "collection_daily_cap");
});

test("ledger math: reservation, debit, refund, margin", () => {
  const s = emptyState();
  appendLedger(s, "cadenceapp", "credit", 100);
  acceptMessage(s, creds, input(), TUE_10); // safaricom sms transfer price
  let w = walletSummary(s.ledger, "cadenceapp");
  assert.equal(w.reserved, 0.6);
  assert.equal(w.available, 99.4);
  const m = s.messages[0];
  appendLedger(s, "cadenceapp", "refund", m.priceKes, { messageId: m.id });
  appendLedger(s, "cadenceapp", "debit", m.priceKes, { messageId: m.id, costKes: m.costKes });
  w = walletSummary(s.ledger, "cadenceapp");
  assert.deepEqual([w.reserved, w.available, w.revenue, w.cost, w.margin], [0, 99.4, 0.6, 0.5, 0.1]);
  assert.throws(() => appendLedger(s, "x", "credit", -1));
  const client = acceptMessage(s, { ...creds, app: "acme", pricing: "client" }, { ...input({ reference: "c" }), app: "acme" }, TUE_10);
  assert.equal(s.messages.find((x) => x.id === client.id)?.priceKes, 0.8);
  const enforced = acceptMessage(s, { ...creds, app: "poor", enforceWallet: true }, { ...input(), app: "poor" }, TUE_10);
  assert.equal(enforced.reason, "insufficient_wallet");
});

test("queue-only: nothing leaves the queue unless enabled and an adapter is configured", async () => {
  const s = emptyState();
  acceptMessage(s, creds, input(), TUE_10);
  assert.deepEqual(await dispatchQueued(s, [creds], env({}), TUE_10), { sent: 0, failed: 0, held: 1 });
  assert.deepEqual(await dispatchQueued(s, [creds], env({ HUB_SENDING_ENABLED: "true" }), TUE_10), { sent: 0, failed: 0, held: 1 });
  assert.equal(adapterFor("sms", env({ HUB_SMS_PROVIDER: "africastalking" })), null);
  assert.deepEqual(await dispatchQueued(s, [creds], env({ HUB_SMS_PROVIDER: "mock" }), TUE_10), { sent: 0, failed: 0, held: 1 });
  assert.equal(s.messages[0].status, "queued");
  const r = await dispatchQueued(s, [creds], env({ HUB_SENDING_ENABLED: "true", HUB_SMS_PROVIDER: "mock" }), TUE_10);
  assert.equal(r.sent, 1);
  assert.equal(s.messages[0].status, "sent");
  assert.equal(walletSummary(s.ledger, "cadenceapp").reserved, 0);
  assert.equal(s.callbacks.length, 1);
});

test("callbacks are signed and retried with backoff", async () => {
  const s = emptyState();
  addSuppression(s, creds, "+254712345678", "sms", "inbound:mock", TUE_10);
  const seen: Array<Record<string, string>> = [];
  let status = 500;
  const fetcher = async (_url: string, init: RequestInit) => {
    seen.push(init.headers as Record<string, string>);
    return new Response("", { status });
  };
  assert.deepEqual(await deliverCallbacks(s, [creds], fetcher, TUE_10), { delivered: 0, failed: 1 });
  const h = seen[0];
  assert.equal(verifySignature("s1", h["X-Beacon-Timestamp"], h["X-Beacon-Signature"], s.callbacks[0].payload, TUE_10.getTime()).ok, true);
  assert.deepEqual(await deliverCallbacks(s, [creds], fetcher, TUE_10), { delivered: 0, failed: 0 }); // backoff
  status = 200;
  assert.deepEqual(await deliverCallbacks(s, [creds], fetcher, new Date(TUE_10.getTime() + 61_000)), { delivered: 1, failed: 0 });
  assert.equal(s.callbacks[0].attempts.length, 2);
});

test("app resolution from env JSON and per-app vars", () => {
  const apps = resolveApps({ apps: {} }, env({
    HUB_APP_KEYS: JSON.stringify({ confirent: { key: "kc", secret: "sc", callbackUrl: "https://c" } }),
    HUB_KEY_CADENCEAPP: "ka",
    HUB_SECRET_CADENCEAPP: "sa",
  }));
  assert.equal(findAppByKey(apps, "kc")?.app, "confirent");
  assert.equal(findAppByKey(apps, "ka")?.app, "cadenceapp");
  assert.equal(findAppByKey(apps, ""), undefined);
  assert.equal(findAppByKey(apps, "nope"), undefined);
});
