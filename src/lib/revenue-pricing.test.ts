import { test } from "node:test";
import assert from "node:assert/strict";
import { annualPrice, carePlanById, foundersLockActive, makeFoundersLock, partnerTierFor, whatsappBill, whatsappUnitKes, wholesalePrice } from "./revenue-pricing";
import { carePlans, whatsappAddon } from "../data/site";

test("care plans are $50, $150 and $450", () => {
  assert.deepEqual(carePlans.map((plan) => plan.monthlyUsd), [50, 150, 450]);
  assert.equal(carePlanById("care-growth")?.name, "Growth Care");
  assert.equal(carePlanById("nope"), undefined);
});

test("annual price applies the 15% discount", () => {
  const price = annualPrice(150);
  assert.equal(price.percent, 15);
  assert.equal(price.perMonth, 128);
  assert.equal(price.perYear, 1536);
  assert.equal(price.savingPerYear, 264);
  assert.equal(annualPrice(100, 0).savingPerYear, 0);
});

test("WhatsApp unit price is pass-through cost plus markup", () => {
  assert.equal(whatsappAddon.costBasisKes.marketing, 2.93);
  assert.equal(whatsappAddon.costBasisKes.utility, 0.52);
  assert.equal(whatsappUnitKes("marketing", 0), 2.93);
  assert.equal(whatsappUnitKes("utility", 0), 0.52);
  assert.equal(whatsappUnitKes("marketing", 20), 3.52);
  assert.equal(whatsappUnitKes("utility", 20), 0.62);
});

test("WhatsApp bill charges only usage above the allowance", () => {
  const within = whatsappBill("wa-starter", { marketing: 100, utility: 100 }, 0)!;
  assert.equal(within.overageKes, 0);
  assert.equal(within.totalKes, within.tier.monthlyKes);
  const over = whatsappBill("wa-starter", { marketing: within.tier.marketingIncluded + 10, utility: within.tier.utilityIncluded + 100 }, 0)!;
  assert.equal(over.extraMarketing, 10);
  assert.equal(over.extraUtility, 100);
  assert.equal(over.overageKes, 81.3);
  assert.equal(whatsappBill("missing", { marketing: 1, utility: 1 }), null);
});

test("partner tiers by client count and wholesale price", () => {
  assert.equal(partnerTierFor(0), null);
  assert.equal(partnerTierFor(1)?.id, "partner-registered");
  assert.equal(partnerTierFor(7)?.id, "partner-silver");
  assert.equal(partnerTierFor(40)?.id, "partner-gold");
  assert.equal(wholesalePrice(1000, 25), 750);
  assert.equal(wholesalePrice(1000, 150), 0);
});

test("founders lock lasts 12 months", () => {
  const now = new Date("2026-10-27T09:00:00Z");
  const lock = makeFoundersLock(now);
  assert.equal(lock.until.slice(0, 10), "2027-10-27");
  assert.equal(foundersLockActive(lock, now), true);
  assert.equal(foundersLockActive(lock, new Date("2027-11-01T00:00:00Z")), false);
  assert.equal(foundersLockActive(null, now), false);
});
