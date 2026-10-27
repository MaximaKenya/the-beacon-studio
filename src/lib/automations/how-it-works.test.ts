import assert from "node:assert/strict";
import test from "node:test";
import { TEMPLATE_DEFS } from "@/automations/templates/public";
import { HOW_IT_WORKS } from "@/lib/automations/how-it-works";

test("every automation has a how-it-works card", () => {
  for (const def of TEMPLATE_DEFS) {
    const card = HOW_IT_WORKS[def.id];
    assert.ok(card, `missing card for ${def.id}`);
    for (const key of ["trigger", "needs", "does", "sees", "sends"] as const) assert.ok(card[key].length > 10, `${def.id}.${key}`);
  }
  assert.equal(Object.keys(HOW_IT_WORKS).length, TEMPLATE_DEFS.length);
});
