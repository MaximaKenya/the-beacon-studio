import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { ARTISTIC_PATHS } from "./artisticPaths";
import { badge, geometric, monoline, striped } from "./logoOptionPaths";

const files = {
  geometric: "public/logo-options/geometric.svg",
  striped: "public/logo-options/striped.svg",
  monoline: "public/logo-options/monoline.svg",
  badge: "public/logo-options/badge.svg",
} as const;

describe("logo option svg files", () => {
  it("exports one beam, currentColor ink, and the accent for each candidate", () => {
    const beams = {
      geometric: geometric.beam,
      striped: striped.beam,
      monoline: monoline.beam,
      badge: badge.beam,
    };
    for (const [id, file] of Object.entries(files)) {
      const svg = readFileSync(file, "utf8");
      assert.match(svg, /<svg\b/);
      assert.doesNotMatch(svg, /<image\b/);
      assert.equal(svg.match(/id="beam"/g)?.length, 1, id);
      assert.match(svg, /currentColor/);
      assert.match(svg, /var\(--accent, #45baab\)/);
      assert.ok(svg.includes(beams[id as keyof typeof beams]), id);
    }
  });

  it("writes an explicit-color svg favicon from the geometric mark", () => {
    const svg = readFileSync("public/logo-options/favicon.svg", "utf8");
    assert.match(svg, /<svg\b/);
    assert.match(svg, /fill="#140e24"/);
    assert.match(svg, /fill="#f6f3ff"/);
    assert.match(svg, /fill="#45baab"/);
    assert.equal(svg.match(/id="beam"/g)?.length, 1);
    assert.ok(svg.includes(geometric.beam));
    assert.doesNotMatch(svg, /<image\b/);
  });
});

describe("artistic logo studies", () => {
  it("exports a gradient file and a flat currentColor file for each study", () => {
    assert.equal(ARTISTIC_PATHS.length, 6);
    for (const mark of ARTISTIC_PATHS) {
      assert.ok(mark.name.length > 0, mark.id);
      assert.ok(mark.story.length > 0, mark.id);
      assert.ok(mark.paths.length > 0, mark.id);
      const color = readFileSync(`public/logo-options/${mark.id}.svg`, "utf8");
      const flat = readFileSync(`public/logo-options/${mark.id}-flat.svg`, "utf8");
      assert.match(color, /<svg\b/);
      assert.match(color, /linearGradient/);
      assert.match(color, /var\(--mark-grad-from, #d4c4f7\)/);
      assert.match(color, /var\(--mark-grad-to, #45baab\)/);
      assert.doesNotMatch(color, /<image\b/);
      assert.match(flat, /<svg\b/);
      assert.match(flat, /currentColor/);
      assert.doesNotMatch(flat, /linearGradient/);
      assert.doesNotMatch(flat, /<image\b/);
      for (const d of mark.paths) {
        assert.ok(color.includes(d), mark.id);
        assert.ok(flat.includes(d), mark.id);
      }
    }
  });
});
