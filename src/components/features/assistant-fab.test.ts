import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { siteConfig } from "../../data/site";
import { AssistantFabButton, AssistantPanelHeader } from "./AssistantBrand";
import {
  ASSISTANT_BRAND_NAME,
  ASSISTANT_FAB_BOX,
  ASSISTANT_FAB_GAP,
  ASSISTANT_SUBTITLE,
  assistantFabBox,
  assistantPanelBox,
  boxesOverlap,
  placeAssistantFab,
  placeAssistantPanel,
  resolveAssistantFab,
  showsPublicAssistant,
  type Box,
} from "./assistant-fab";

function assertClear(box: Box, obstacles: Box[], gap = ASSISTANT_FAB_GAP) {
  for (const obstacle of obstacles) {
    assert.equal(boxesOverlap(box, obstacle, gap), false, JSON.stringify({ box, obstacle }));
  }
  assert.ok(box.x >= 0 && box.y >= 0, "on screen");
}

describe("assistant brand", () => {
  it("uses the studio name and a small AI assistant subtitle", () => {
    assert.equal(ASSISTANT_BRAND_NAME, "The Beacon Studio");
    assert.equal(ASSISTANT_BRAND_NAME, siteConfig.brand.name);
    assert.equal(ASSISTANT_SUBTITLE, "AI assistant");

    const header = renderToString(createElement(AssistantPanelHeader, { onClose() {} }));
    assert.match(header, /The Beacon Studio/);
    assert.match(header, /AI assistant/);
    assert.match(header, /\/brand\/beacon-mark\.svg/);
    assert.doesNotMatch(header, /border/);
    assert.doesNotMatch(header, /FinalMark/);
    assert.doesNotMatch(header, /beacon-mark-mono/);
  });

  it("renders a frosted pill on desktop and a logo-only button when asked", () => {
    const pill = renderToString(createElement(AssistantFabButton, { mode: "pill", onClick() {} }));
    assert.match(pill, /data-assistant-fab-mode="pill"/);
    assert.match(pill, /sleek-card/);
    assert.match(pill, /rounded-full/);
    assert.match(pill, /data-assistant-name=""/);
    assert.match(pill, /The Beacon Studio/);
    assert.match(pill, /\/brand\/beacon-mark\.svg/);
    assert.doesNotMatch(pill, /border/);

    const mark = renderToString(createElement(AssistantFabButton, { mode: "mark", onClick() {} }));
    assert.match(mark, /data-assistant-fab-mode="mark"/);
    assert.equal(mark.includes("data-assistant-name"), false);
    assert.match(mark, /aria-label="The Beacon Studio AI assistant"/);
    assert.match(mark, /\/brand\/beacon-mark\.svg/);
  });
});

describe("assistant placement", () => {
  const hero = { x: 24, y: 420, w: 312, h: 52 };
  const auditBar = { x: 0, y: 720, w: 360, h: 80 };
  const whatsapp = { x: 16, y: 716, w: 56, h: 56 };
  const book = { x: 188, y: 728, w: 156, h: 44 };

  it("keeps the desktop pill off the book and WhatsApp buttons", () => {
    const obstacles = [
      { x: 16, y: 720, w: 56, h: 56 },
      { x: 1064, y: 728, w: 184, h: 48 },
    ];
    const placed = resolveAssistantFab({
      viewport: { w: 1280, h: 800 },
      obstacles,
      introduced: true,
      reducedMotion: false,
    });
    assert.equal(placed.mode, "pill");
    assert.equal(placed.clear, true);
    assert.equal(placed.side, "right");
    assertClear(assistantFabBox(placed), obstacles);
    assert.ok(placed.y + placed.height + ASSISTANT_FAB_GAP <= 728);
  });

  it("uses a compact named pill on a phone when the corner is free", () => {
    const obstacles = [hero, auditBar, whatsapp, book];
    const first = resolveAssistantFab({
      viewport: { w: 360, h: 800 },
      obstacles,
      introduced: false,
      reducedMotion: false,
    });
    assert.equal(first.mode, "expanded");
    assert.equal(first.width, ASSISTANT_FAB_BOX.compact.w);
    assertClear(assistantFabBox(first), obstacles);

    const settled = resolveAssistantFab({
      viewport: { w: 360, h: 800 },
      obstacles,
      introduced: true,
      reducedMotion: false,
    });
    assert.equal(settled.mode, "compact");
    assertClear(assistantFabBox(settled), obstacles);

    const still = resolveAssistantFab({
      viewport: { w: 360, h: 800 },
      obstacles,
      introduced: false,
      reducedMotion: true,
    });
    assert.equal(still.mode, "compact");
  });

  it("stays a logo when the name would cover a CTA", () => {
    const obstacles = [
      { x: 0, y: 0, w: 400, h: 600 },
      { x: 0, y: 600, w: 300, h: 100 },
    ];
    const placed = resolveAssistantFab({
      viewport: { w: 400, h: 700 },
      obstacles,
      introduced: false,
      reducedMotion: false,
    });
    assert.equal(placed.mode, "mark");
    assert.equal(placed.clear, true);
    assertClear(assistantFabBox(placed), obstacles);
  });

  it("hides rather than overlapping a screen that is all CTA", () => {
    const obstacles = [{ x: 0, y: 0, w: 360, h: 640 }];
    const placed = placeAssistantFab({
      viewport: { w: 360, h: 640 },
      fab: ASSISTANT_FAB_BOX.mark,
      obstacles,
    });
    assert.equal(placed.clear, false);
  });

  it("opens the panel above the mobile audit bar and beside the desktop book button", () => {
    const mobile = placeAssistantPanel({
      viewport: { w: 360, h: 800 },
      obstacles: [auditBar, whatsapp, book],
    });
    assert.ok(mobile.bottom >= 80 + ASSISTANT_FAB_GAP);
    const mobileBox = assistantPanelBox(800, mobile);
    assert.ok(mobileBox.y >= 64);
    assertClear(mobileBox, [auditBar]);

    const desktopObstacles = [
      { x: 16, y: 720, w: 56, h: 56 },
      { x: 1064, y: 728, w: 184, h: 48 },
    ];
    const desktop = placeAssistantPanel({
      viewport: { w: 1280, h: 800 },
      obstacles: desktopObstacles,
    });
    assertClear(assistantPanelBox(800, desktop), desktopObstacles);
  });

  it("shows the public launcher on the marketing site only", () => {
    assert.equal(showsPublicAssistant("/"), true);
    assert.equal(showsPublicAssistant("/book"), true);
    assert.equal(showsPublicAssistant(null), true);
    assert.equal(showsPublicAssistant("/admin"), false);
    assert.equal(showsPublicAssistant("/admin/logo-options"), false);
    assert.equal(showsPublicAssistant("/dashboard"), false);
    assert.equal(showsPublicAssistant("/portal/login"), false);
  });
});

describe("assistant wiring", () => {
  it("brands both chat surfaces with the static mark and keeps the public FAB singular", () => {
    const beacon = readFileSync("src/components/features/BeaconAiChat.tsx", "utf8");
    const glow = readFileSync("src/components/features/ChatWidget.tsx", "utf8");
    const mark = readFileSync("src/components/brand/BeaconMark.tsx", "utf8");

    for (const source of [beacon, glow]) {
      assert.match(source, /AssistantPanelHeader/);
      assert.match(source, /data-assistant-panel/);
      assert.doesNotMatch(source, /icon=\{Bot\}/);
      assert.doesNotMatch(source, /variant="mono"/);
      assert.doesNotMatch(source, /FinalMark/);
    }

    assert.match(beacon, /AssistantFabButton/);
    assert.match(beacon, /useAssistantFabLayout\(showsPublicAssistant\(pathname\) && !open\)/);
    assert.match(glow, /useAssistantFabLayout\(!showsPublicAssistant\(pathname\) && !chatOpen\)/);
    assert.match(mark, /\/brand\/beacon-mark\.svg/);
    assert.doesNotMatch(readFileSync("src/components/features/AssistantBrand.tsx", "utf8"), /variant="mono"/);
  });

  it("lets the booking button stay fixed so the pill can clear it", () => {
    const pulse = readFileSync("src/components/ui/AnimatedIcon.tsx", "utf8");
    assert.match(pulse, /\\bfixed\\b/);
    assert.doesNotMatch(pulse, /className=\{`relative \$\{className\}`\}/);
    const book = readFileSync("src/components/features/FloatingBookCTA.tsx", "utf8");
    assert.match(book, /data-cta-fixed/);
    assert.match(book, /fixed bottom-6 right-4/);
  });
});
