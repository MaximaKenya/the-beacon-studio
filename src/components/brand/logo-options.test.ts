import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { ARTISTIC_PATHS } from "./artisticPaths";
import { CONCEPT_A } from "./conceptA";
import { CONCEPT_B, CONCEPT_B_BASE } from "./conceptB";
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

describe("concept A logo family", () => {
  it("exports icon, lockups, flat, favicon, and an animated svg for each variation", () => {
    assert.equal(CONCEPT_A.length, 5);
    const kinds = ["icon", "horizontal", "stacked", "flat", "favicon", "animated"] as const;
    for (const mark of CONCEPT_A) {
      assert.match(mark.id, /^a[1-5]$/);
      assert.ok(mark.tower.includes("M"));
      assert.ok(mark.beam.length > 20);
      assert.ok(mark.wave.length > 20);
      for (const kind of kinds) {
        const svg = readFileSync(`public/logo-options/${mark.id}-${kind}.svg`, "utf8");
        assert.match(svg, /<svg\b/);
        assert.doesNotMatch(svg, /<image\b/);
        assert.ok(svg.includes(kind === "favicon" ? mark.solid : mark.beam), `${mark.id}-${kind}`);
      }
      const icon = readFileSync(`public/logo-options/${mark.id}-icon.svg`, "utf8");
      assert.match(icon, /#e2d2ff/);
      assert.match(icon, /#3ed6c6/);
      const flat = readFileSync(`public/logo-options/${mark.id}-flat.svg`, "utf8");
      assert.match(flat, /currentColor/);
      assert.doesNotMatch(flat, /linearGradient/);
      const horizontal = readFileSync(`public/logo-options/${mark.id}-horizontal.svg`, "utf8");
      const stacked = readFileSync(`public/logo-options/${mark.id}-stacked.svg`, "utf8");
      assert.match(horizontal, /currentColor/);
      assert.match(stacked, /currentColor/);
      const animated = readFileSync(`public/logo-options/${mark.id}-animated.svg`, "utf8");
      assert.match(animated, /prefers-reduced-motion/);
      assert.match(animated, /concept-a-beam/);
      assert.match(animated, /concept-a-glow/);
      const favicon = readFileSync(`public/logo-options/${mark.id}-favicon.svg`, "utf8");
      assert.match(favicon, /viewBox="0 0 320 320"/);
      assert.match(favicon, /#16082e/);
    }
  });
});

function pathXs(d: string): number[] {
  const nums = d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
  const xs: number[] = [];
  for (let i = 0; i < nums.length; i += 2) xs.push(nums[i]);
  return xs;
}

describe("concept B logo family", () => {
  it("keeps one traced tower and a short lantern light inside the base", () => {
    assert.equal(CONCEPT_B.length, 4);
    const kinds = ["icon", "horizontal", "stacked", "flat", "favicon", "animated"] as const;
    const tower = CONCEPT_B[0].tower;
    const wave = CONCEPT_B[0].wave;
    for (const mark of CONCEPT_B) {
      assert.match(mark.id, /^b[1-4]$/);
      assert.equal(mark.tower, tower);
      assert.equal(mark.wave, wave);
      assert.ok(mark.extent.minX >= CONCEPT_B_BASE.minX, mark.id);
      assert.ok(mark.extent.maxX <= CONCEPT_B_BASE.maxX, mark.id);
      assert.ok(mark.extent.maxX <= 260, mark.id);
      const glowLeft = mark.glow.cx - mark.glow.r;
      const glowRight = mark.glow.cx + mark.glow.r;
      assert.ok(glowLeft >= CONCEPT_B_BASE.minX && glowRight <= CONCEPT_B_BASE.maxX, mark.id);
      if (mark.light) {
        for (const x of pathXs(mark.light)) {
          assert.ok(x >= CONCEPT_B_BASE.minX && x <= CONCEPT_B_BASE.maxX, `${mark.id} ${x}`);
        }
      }
      for (const kind of kinds) {
        const svg = readFileSync(`public/logo-options/${mark.id}-${kind}.svg`, "utf8");
        assert.match(svg, /<svg\b/);
        assert.doesNotMatch(svg, /<image\b/);
        assert.ok(svg.includes(kind === "favicon" ? mark.solid : mark.tower), `${mark.id}-${kind}`);
        assert.ok(svg.includes(mark.wave), `${mark.id}-${kind}`);
      }
      const icon = readFileSync(`public/logo-options/${mark.id}-icon.svg`, "utf8");
      assert.match(icon, /#f6f1ff/);
      assert.match(icon, /#2ad8c6/);
      const flat = readFileSync(`public/logo-options/${mark.id}-flat.svg`, "utf8");
      assert.match(flat, /currentColor/);
      assert.doesNotMatch(flat, /linearGradient/);
      const horizontal = readFileSync(`public/logo-options/${mark.id}-horizontal.svg`, "utf8");
      const stacked = readFileSync(`public/logo-options/${mark.id}-stacked.svg`, "utf8");
      assert.match(horizontal, /currentColor/);
      assert.match(stacked, /currentColor/);
      const animated = readFileSync(`public/logo-options/${mark.id}-animated.svg`, "utf8");
      assert.match(animated, /prefers-reduced-motion/);
      assert.match(animated, /concept-b-glow/);
      assert.match(animated, /concept-b-pulse/);
      assert.doesNotMatch(animated, /concept-a-beam/);
      const favicon = readFileSync(`public/logo-options/${mark.id}-favicon.svg`, "utf8");
      assert.match(favicon, /#16082e/);
      assert.match(favicon, /#3ed6c6/);
    }
    assert.ok(CONCEPT_B[1].light.length > 0);
    assert.equal(CONCEPT_B[3].light, "");
    assert.ok(CONCEPT_B[2].extent.maxX > CONCEPT_B[0].extent.maxX);
  });
});

describe("final starburst logo", () => {
  it("keeps the approved trace, drops the field, and adds the glow, motion, and lockups", () => {
    const trace = readFileSync("public/logo-options/edit2-trace.svg", "utf8");
    const icon = readFileSync("public/logo-options/final-icon.svg", "utf8");
    const animated = readFileSync("public/logo-options/final-animated.svg", "utf8");
    assert.match(icon, /viewBox="292 264 604 770"/);
    assert.doesNotMatch(icon, /<image\b/);
    assert.doesNotMatch(icon, /M0 0 C417\.12 0 834\.24 0 1264 0/);
    assert.match(icon, /feGaussianBlur/);
    assert.match(icon, /#7EE8DC/);
    assert.match(icon, /#61BFC4/);
    assert.match(icon, /#DAF0F2/);
    const iconPaths = [...icon.matchAll(/<path d="([^"]+)"/g)].map((match) => match[1]);
    assert.ok(iconPaths.length > 500);
    assert.ok(iconPaths.length < 830);
    for (const d of iconPaths) {
      assert.ok(trace.includes(`d="${d}"`), "icon path is not from the approved trace");
    }
    assert.match(animated, /prefers-reduced-motion/);
    assert.match(animated, /final-glow/);
    assert.match(animated, /final-burst/);
    assert.match(animated, /final-wave/);
    assert.match(animated, /final-pulse/);
    assert.match(animated, /final-shimmer/);
    const darkHorizontal = readFileSync("public/logo-options/final-horizontal-dark.svg", "utf8");
    const lightHorizontal = readFileSync("public/logo-options/final-horizontal-light.svg", "utf8");
    const darkStacked = readFileSync("public/logo-options/final-stacked-dark.svg", "utf8");
    const lightStacked = readFileSync("public/logo-options/final-stacked-light.svg", "utf8");
    for (const svg of [darkHorizontal, lightHorizontal, darkStacked, lightStacked, animated]) {
      assert.doesNotMatch(svg, /<image\b/);
      assert.match(svg, /<title>The Beacon Studio<\/title>/);
      assert.ok(svg.includes("#61BFC4"));
    }
    assert.match(darkHorizontal, /#1E0A32/);
    assert.match(darkHorizontal, /#F6F3FF/);
    assert.match(lightHorizontal, /#E5F7F4/);
    assert.match(lightHorizontal, /#14312E/);
    assert.match(darkStacked, /#1E0A32/);
    assert.match(lightStacked, /#E5F7F4/);
    assert.throws(() => readFileSync("public/logo-options/final-flat.svg"));
    assert.throws(() => readFileSync("public/logo-options/final-favicon.svg"));
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
