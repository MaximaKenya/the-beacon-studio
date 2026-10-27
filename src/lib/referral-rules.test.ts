import { test } from "node:test";
import assert from "node:assert/strict";
import {
  creditIsLive,
  makeReferralCode,
  normalizeReferralCode,
  referralEligibility,
  referralSummary,
  settleReferral,
  type ReferralDoc,
} from "@/lib/referral-rules";

const doc = (): ReferralDoc => ({
  codes: [{ email: "amy@clinic.co.ke", code: "AMY12345", createdAt: "2026-01-01T00:00:00Z" }],
  referrals: [],
});

test("codes are normalised and generated in the right shape", () => {
  assert.equal(normalizeReferralCode(" amy12345 "), "AMY12345");
  assert.equal(normalizeReferralCode("x!"), null);
  assert.match(makeReferralCode(), /^[A-Z0-9]{8}$/);
});

test("self-referral and existing clients are refused", () => {
  assert.equal(referralEligibility({ doc: doc(), code: "AMY12345", referredEmail: "amy@clinic.co.ke", referredIsNewClient: true }).ok, false);
  assert.equal(referralEligibility({ doc: doc(), code: "AMY12345", referredEmail: "bob@clinic.co.ke", referredIsNewClient: true }).ok, false);
  assert.equal(referralEligibility({ doc: doc(), code: "AMY12345", referredEmail: "bob@gmail.com", referredIsNewClient: false }).ok, false);
  assert.equal(referralEligibility({ doc: doc(), code: "NOPE0000", referredEmail: "bob@gmail.com", referredIsNewClient: true }).ok, false);
  const ok = referralEligibility({ doc: doc(), code: "AMY12345", referredEmail: "bob@gmail.com", referredIsNewClient: true });
  assert.deepEqual(ok, { ok: true, referrerEmail: "amy@clinic.co.ke" });
});

test("a person can only be referred once", () => {
  const d = doc();
  d.referrals.push({ id: "1", code: "AMY12345", referrerEmail: "amy@clinic.co.ke", referredEmail: "bob@gmail.com", createdAt: "x", status: "pending" });
  assert.equal(referralEligibility({ doc: d, code: "AMY12345", referredEmail: "bob@gmail.com", referredIsNewClient: true }).ok, false);
});

test("credit stays pending until first paid month, then expires after a year", () => {
  const now = new Date("2026-03-01T00:00:00Z");
  const d = doc();
  d.referrals.push({ id: "1", code: "AMY12345", referrerEmail: "amy@clinic.co.ke", referredEmail: "bob@gmail.com", createdAt: "x", status: "pending" });
  assert.deepEqual(referralSummary(d, "amy@clinic.co.ke", now), { pending: 1, earned: 0, redeemed: 0, expired: 0 });
  d.referrals[0] = settleReferral(d.referrals[0], now);
  assert.equal(d.referrals[0].status, "earned");
  assert.equal(settleReferral(d.referrals[0], new Date("2026-04-01T00:00:00Z")).earnedAt, now.toISOString());
  assert.equal(creditIsLive(d.referrals[0], new Date("2026-12-01T00:00:00Z")), true);
  assert.equal(creditIsLive(d.referrals[0], new Date("2027-03-02T00:00:00Z")), false);
  assert.deepEqual(referralSummary(d, "amy@clinic.co.ke", now), { pending: 0, earned: 1, redeemed: 0, expired: 0 });
});
