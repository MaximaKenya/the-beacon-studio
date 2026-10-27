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
    assert.match(p.liveUrl, /^https:\/\//, `${p.id} url`);
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

test("exactly the five live products are shown, with Convoria near the top", () => {
  const ids = siteConfig.products.map((p) => p.id);
  assert.deepEqual([...ids].sort(), ["cadenceapp", "confilearn", "confirent", "convoria", "lookfinesse"]);
  assert.ok(ids.indexOf("convoria") <= 1, "Convoria is featured in the first two");
  assert.deepEqual(Object.keys(productCopy).sort(), [...ids].sort());
  for (const p of siteConfig.products) {
    assert.equal(p.status, "live", `${p.id} is live`);
    assert.doesNotMatch(p.statusLabel, /coming soon|private|demo|beta/i);
  }
  const text = all([productCopy, siteConfig.products]).join(" ");
  assert.doesNotMatch(text, /trivia\s*yard|confi\s*trade|coming soon/i);
});

test("LookFinesse uses the single URL constant", () => {
  assert.equal(siteConfig.products.find((p) => p.id === "lookfinesse")?.liveUrl, LOOKFINESSE_URL);
});

test("shared strip contact details match site config", () => {
  const support = EVERY_APP_INCLUDES.find((i) => i.title === "Kenya-based support")?.detail ?? "";
  assert.ok(support.includes(siteConfig.phoneDisplay));
  assert.ok(support.includes(siteConfig.email));
});

test("ConfiRent copy says M-Pesa only for rent and publishes no featured or badge prices", () => {
  const text = all([productCopy.confirent, siteConfig.products.find((p) => p.id === "confirent")]).join(" ");
  assert.doesNotMatch(text, /M-Pesa or card|card or bank|1,999|KES 300|KES 500 for/);
});
