import { test } from "node:test";
import assert from "node:assert/strict";
import { siteConfig } from "./site";
import { productCopy, LOOKFINESSE_URL, EVERY_APP_INCLUDES } from "./product-copy";

const PLACEHOLDER = /lorem|ipsum|\bTODO\b|\bTBD\b|xxx|placeholder|\[.*?\]/i;
const all = (v: unknown): string[] =>
  typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(all) : v && typeof v === "object" ? Object.values(v).flatMap(all) : [];

test("every product has slug, name, url, selling points and FAQs", () => {
  for (const p of siteConfig.products) {
    assert.match(p.id, /^[a-z0-9-]+$/);
    assert.ok(p.name);
    const copy = productCopy[p.id];
    assert.ok(copy, `${p.id} has copy`);
    if (p.status !== "coming-soon") assert.match(p.liveUrl, /^https:\/\//, `${p.id} url`);
    const points = copy.sellingPoints.flatMap((g) => g.points);
    assert.ok(points.length >= 8 && points.length <= 15, `${p.id} has 8-15 selling points (${points.length})`);
    assert.equal(copy.faqs.length, 5, `${p.id} has 5 FAQs`);
    assert.equal(copy.outcomes.length, 3, `${p.id} has 3 outcomes`);
    assert.ok(copy.howItWorks.length >= 3 && copy.howItWorks.length <= 4);
    assert.ok(copy.audiences.length > 0);
  }
});

test("no placeholder text in product copy", () => {
  for (const s of all([productCopy, EVERY_APP_INCLUDES, siteConfig.products])) {
    assert.doesNotMatch(s, PLACEHOLDER, s);
  }
});

test("TriviaYard is not promoted and ConfiTrade has a risk disclaimer and no trial", () => {
  assert.ok(!siteConfig.products.some((p) => /trivia/i.test(p.id)));
  const ct = productCopy.confitrade;
  assert.match(ct.disclaimer ?? "", /risk of loss/i);
  assert.equal(ct.trial, undefined);
  assert.doesNotMatch(all(ct).join(" "), /guarantee(d)? (profit|return)/i);
});

test("LookFinesse uses the single URL constant", () => {
  assert.equal(siteConfig.products.find((p) => p.id === "lookfinesse")?.liveUrl, LOOKFINESSE_URL);
});
