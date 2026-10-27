import { test } from "node:test";
import assert from "node:assert/strict";
import { computeRoi } from "@/lib/roi";
import { packById, packQuote } from "@/automations/packs";

test("time cost is hours x 52/12 x rate", () => {
  const result = computeRoi({ industry: "clinic", weeklyHours: 6, unpaidInvoicesKes: 120000, hourlyCostKes: 500 });
  assert.equal(result.pack.id, "clinic");
  assert.equal(result.monthlyTimeCostKes, Math.round(6 * (52 / 12) * 500));
  assert.equal(result.annualTimeCostKes, result.monthlyTimeCostKes * 12);
  assert.equal(result.monthlyHours, 26);
  assert.equal(result.unpaidInvoicesKes, 120000);
});

test("pack price matches the buffet quote exactly", () => {
  const result = computeRoi({ industry: "sacco", weeklyHours: 4, unpaidInvoicesKes: 0, hourlyCostKes: 400 });
  const quote = packQuote(packById("sacco")!, "monthly");
  assert.equal(result.packMonthlyKes, quote.recurringMonthlyKes);
  assert.equal(result.monthlyDifferenceKes, result.monthlyTimeCostKes - quote.recurringMonthlyKes);
  assert.equal(result.packAnnualMonthlyKes, packQuote(packById("sacco")!, "annual").recurringMonthlyKes);
});

test("bad inputs are clamped, not invented", () => {
  const result = computeRoi({ industry: "", weeklyHours: -3, unpaidInvoicesKes: Number.NaN, hourlyCostKes: 0 });
  assert.equal(result.pack.id, "services");
  assert.equal(result.monthlyTimeCostKes, 0);
  assert.equal(result.unpaidInvoicesKes, 0);
  assert.equal(result.breakEvenHours, 0);
});
