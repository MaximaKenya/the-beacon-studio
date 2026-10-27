import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { adminPasswordMatches, createAdminToken, safeEqual, verifyAdminToken } from "./admin-auth";
import { crossOriginBlocked, postLimitFor, rateLimit } from "./rate-limit";
import { beaconPaymentIdFromReference, beaconPaystackMetadata, beaconPaystackReference, verifyPaystackSignature } from "./paystack";
import { routePaystackEvent } from "./paystack-router";
import { ownerCanResume } from "./automations/runtime";
import { SANDBOX_ORIGIN, demoOwnerEmail, formatNairobi, isDemoPhone, nairobiTenAm } from "./automations/sandbox";

process.env.ADMIN_PASSWORD = "test-password-123";

describe("admin token", () => {
  it("is signed, not the password", () => {
    const token = createAdminToken()!;
    assert.ok(!token.includes(Buffer.from("test-password-123").toString("base64")));
    assert.ok(verifyAdminToken(token));
  });
  it("rejects tampered, expired and old base64 cookies", () => {
    const token = createAdminToken()!;
    assert.equal(verifyAdminToken(token.slice(0, -2) + "xx"), false);
    assert.equal(verifyAdminToken(token, Date.now() + 13 * 3600_000), false);
    assert.equal(verifyAdminToken(Buffer.from("test-password-123").toString("base64")), false);
    assert.equal(verifyAdminToken(undefined), false);
  });
  it("compares passwords safely", () => {
    assert.ok(adminPasswordMatches("test-password-123"));
    assert.equal(adminPasswordMatches("wrong"), false);
    assert.ok(safeEqual("a", "a"));
    assert.equal(safeEqual("a", "ab"), false);
  });
});

describe("rate limit and origin", () => {
  it("blocks after the limit", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 3; i++) assert.ok(rateLimit(key, 3, 60_000).ok);
    assert.equal(rateLimit(key, 3, 60_000).ok, false);
  });
  it("is strict on auth and skips webhooks", () => {
    assert.equal(postLimitFor("/api/admin/auth")?.limit, 8);
    assert.equal(postLimitFor("/api/paystack/webhook"), null);
  });
  it("blocks cross-site admin posts only", () => {
    assert.ok(crossOriginBlocked("/api/admin/automations", "https://evil.test", "thebeaconstudio.co.ke"));
    assert.equal(crossOriginBlocked("/api/admin/automations", "https://www.thebeaconstudio.co.ke", "thebeaconstudio.co.ke"), false);
    assert.equal(crossOriginBlocked("/api/contact", "https://client.test", "thebeaconstudio.co.ke"), false);
  });
});

describe("paystack webhook", () => {
  const raw = '{"event":"charge.success","data":{"reference":"BS-abc"}}';
  it("accepts a valid sha512 signature only", () => {
    const prev = process.env.PAYSTACK_SECRET_KEY;
    process.env.PAYSTACK_SECRET_KEY = "sk_test_unit";
    try {
      const sig = createHmac("sha512", "sk_test_unit").update(raw).digest("hex");
      assert.ok(verifyPaystackSignature(raw, sig));
      assert.equal(verifyPaystackSignature(raw + " ", sig), false);
      assert.equal(verifyPaystackSignature(raw, sig.slice(0, -2) + "00"), false);
      assert.equal(verifyPaystackSignature(raw, null), false);
      delete process.env.PAYSTACK_SECRET_KEY;
      assert.equal(verifyPaystackSignature(raw, sig), false);
    } finally {
      if (prev === undefined) delete process.env.PAYSTACK_SECRET_KEY;
      else process.env.PAYSTACK_SECRET_KEY = prev;
    }
  });
  it("keeps the BS reference prefix and beacon metadata", () => {
    assert.equal(beaconPaystackReference("abc"), "BS-abc");
    assert.equal(beaconPaystackReference("BS-abc"), "BS-abc");
    assert.equal(beaconPaymentIdFromReference("BS-abc"), "abc");
    assert.equal(beaconPaystackMetadata({ tierId: "x" }).app, "beacon-studio");
  });
  it("routes BS- and metadata.app=beacon to Beacon Studio", () => {
    assert.equal(routePaystackEvent({ data: { reference: "BS-1" } })?.route.app, "beacon-studio");
    assert.equal(routePaystackEvent({ data: { reference: "CR-1", metadata: { app: "beacon" } } })?.route.local, true);
    assert.equal(routePaystackEvent({ data: { reference: "CR-1" } })?.route.local, false);
  });
});

describe("portal resume rules", () => {
  const future = new Date(Date.now() + 86400_000).toISOString();
  const past = new Date(Date.now() - 86400_000).toISOString();
  it("allows a live trial or paid period", () => {
    assert.ok(ownerCanResume({ status: "paused", trial: { endsAt: future } }));
    assert.ok(ownerCanResume({ status: "paused", periodEnd: future }));
  });
  it("blocks pending payment and ended trials", () => {
    assert.equal(ownerCanResume({ status: "pending_payment", trial: { endsAt: future } }), false);
    assert.equal(ownerCanResume({ status: "paused", trial: { endsAt: past } }), false);
    assert.equal(ownerCanResume({ status: "paused" }), false);
  });
});

describe("demo sandbox", () => {
  it("uses fake phones, the live site and Nairobi time", () => {
    assert.ok(isDemoPhone("254700000001"));
    assert.equal(isDemoPhone("254712345678"), false);
    assert.ok(SANDBOX_ORIGIN.startsWith("https://") && !SANDBOX_ORIGIN.includes("sandbox.local"));
    const slot = nairobiTenAm(2);
    assert.ok(slot.getTime() > Date.now());
    assert.equal(slot.getUTCHours(), 7);
    assert.match(formatNairobi(slot.toISOString()), /EAT$/);
    assert.match(demoOwnerEmail("Demo Clinic (sample data)"), /^demo-[a-z0-9-]+@example\.com$/);
  });
});
