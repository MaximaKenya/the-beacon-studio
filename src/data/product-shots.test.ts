import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { productShots, shotsFor, tourShots } from "./product-shots";
import { siteConfig } from "./site";

const ids = new Set(siteConfig.products.map((p) => p.id));

test("every shot belongs to a known product and its file exists", () => {
  for (const s of productShots) {
    assert.ok(ids.has(s.slug), `unknown slug ${s.slug}`);
    assert.match(s.file, new RegExp(`^/products/${s.slug}/[a-z0-9-]+\\.webp$`));
    const abs = path.join(process.cwd(), "public", s.file);
    assert.ok(fs.existsSync(abs), `missing ${s.file}`);
    assert.ok(fs.statSync(abs).size < 250_000, `${s.file} is too heavy`);
  }
});

test("alt text and captions are present and descriptive", () => {
  for (const s of productShots) {
    assert.ok(s.alt.trim().length >= 20, `alt too short for ${s.file}`);
    assert.ok(s.caption.trim().length > 0, `missing caption for ${s.file}`);
    assert.notEqual(s.alt.trim().toLowerCase(), s.caption.trim().toLowerCase(), `alt duplicates caption for ${s.file}`);
  }
});

test("shape: dimensions, device and blur placeholder", () => {
  const files = new Set<string>();
  for (const s of productShots) {
    assert.ok(!files.has(s.file), `duplicate ${s.file}`);
    files.add(s.file);
    assert.ok(s.width > 0 && s.height > 0);
    assert.ok(s.device === "desktop" || s.device === "mobile");
    assert.ok(s.blurDataURL.startsWith("data:image/webp;base64,"));
    assert.ok(s.blurDataURL.length < 2_000, "blur placeholder should stay tiny");
  }
});

test("no excluded products, helpers filter by slug", () => {
  assert.ok(!productShots.some((s) => /confitrade|triviayard/.test(s.slug)));
  for (const id of ids) {
    assert.ok(shotsFor(id).every((s) => s.slug === id));
    const t = tourShots(id);
    assert.ok(t.desktop.length <= 3 && t.mobile.length <= 3);
  }
});
