import { test } from "node:test";
import assert from "node:assert/strict";
import { industryPacks } from "@/data/site";
import { quoteBundle } from "@/automations/pricing";
import { packById, packForIndustry, packQuote } from "@/automations/packs";

test("every pack uses real buffet templates", () => {
  assert.equal(industryPacks.length, 6);
  for (const pack of industryPacks) {
    const quote = packQuote(pack);
    assert.equal(quote.count, pack.templateIds.length, pack.id);
  }
});

test("pack price equals the buffet quote for the same picks", () => {
  for (const pack of industryPacks) {
    for (const billing of ["monthly", "annual"] as const) {
      const viaPack = packQuote(pack, billing);
      const viaBuffet = quoteBundle([...pack.templateIds].reverse(), { billing });
      assert.ok(viaBuffet);
      assert.equal(viaPack.recurringMonthlyKes, viaBuffet.recurringMonthlyKes);
      assert.equal(viaPack.dueKes, viaBuffet.dueKes);
      assert.equal(viaPack.bundlePercent, viaBuffet.bundlePercent);
    }
  }
});

test("industry text maps to a pack", () => {
  assert.equal(packForIndustry("dental clinic").id, "clinic");
  assert.equal(packForIndustry("Our SACCO").id, "sacco");
  assert.equal(packForIndustry("I own apartments with tenants").id, "landlord");
  assert.equal(packForIndustry("law firm").id, "services");
  assert.equal(packById("RETAIL")?.id, "retail");
  assert.equal(packById("nope"), undefined);
});
