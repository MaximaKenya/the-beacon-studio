import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { wordmarkLines } from "../brand/wordmark";
import { HomeSplash } from "./HomeSplash";
import {
  SPLASH_EXIT_MS,
  SPLASH_HOLD_MS,
  isBlockedSplashPath,
  isHomeSplashPath,
  splashDecision,
  splashTotalMs,
} from "./splash";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (/\.(tsx|ts)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("homepage splash", () => {
  it("plays on the homepage only, once, for about 2 to 2.5 seconds", () => {
    const play = splashDecision({ pathname: "/", seen: false, reducedMotion: false });
    assert.equal(play.show, true);
    assert.equal(play.animated, true);
    assert.equal(play.holdMs, SPLASH_HOLD_MS);
    assert.equal(play.exitMs, SPLASH_EXIT_MS);
    assert.ok(play.holdMs >= 1600, "intro should finish before the fade");
    const total = splashTotalMs(play);
    assert.ok(total >= 2000 && total <= 2500, `total ${total}ms`);

    assert.equal(splashDecision({ pathname: "/", seen: true, reducedMotion: false }).show, false);
  });

  it("shows the still mark briefly when motion is reduced", () => {
    const reduced = splashDecision({ pathname: "/", seen: false, reducedMotion: true });
    assert.equal(reduced.show, true);
    assert.equal(reduced.animated, false);
    const total = splashTotalMs(reduced);
    assert.ok(total > 0 && total <= 1000, `reduced total ${total}ms`);
  });

  it("never runs on admin, portal, or API routes", () => {
    const blocked = [
      "/admin",
      "/admin/logo-options",
      "/portal",
      "/portal/login",
      "/api",
      "/api/health",
      "/book",
      "/automations",
    ];
    for (const pathname of blocked) {
      assert.equal(isHomeSplashPath(pathname), false, pathname);
      assert.equal(
        splashDecision({ pathname, seen: false, reducedMotion: false }).show,
        false,
        pathname,
      );
    }
    assert.equal(isBlockedSplashPath("/admin"), true);
    assert.equal(isBlockedSplashPath("/portal/login"), true);
    assert.equal(isBlockedSplashPath("/api/health"), true);
    assert.equal(isBlockedSplashPath("/"), false);
    assert.equal(isHomeSplashPath("/"), true);
  });

  it("renders no overlay on the server", () => {
    const html = renderToString(createElement(HomeSplash));
    assert.equal(html.includes("data-home-splash"), false);
    assert.equal(html.includes("final-rise"), false);
    assert.equal(html.includes("Skip"), false);
  });

  it("stays off the server page, other routes, and noscript", () => {
    const page = readFileSync("src/app/page.tsx", "utf8");
    assert.match(page, /<noscript>/);
    assert.match(page, /data-home-splash/);
    assert.match(page, /display:\s*none/);
    assert.match(page, /HomeSplashGate/);
    assert.doesNotMatch(page, /FinalMark/);

    const gate = readFileSync("src/components/home/HomeSplashGate.tsx", "utf8");
    assert.match(gate, /ssr:\s*false/);
    assert.match(gate, /isHomeSplashPath/);

    const splash = readFileSync("src/components/home/HomeSplash.tsx", "utf8");
    const splashLogic = readFileSync("src/components/home/splash.ts", "utf8");
    assert.match(splash, /useEffect/);
    assert.match(splash, /splashAlreadySeen/);
    assert.match(splashLogic, /sessionStorage/);
    assert.match(splash, /prefers-reduced-motion/);
    assert.match(splash, /FinalMark/);
    assert.match(splash, /onClick=\{skip\}/);

    const allowed = new Set([
      "src/app/page.tsx",
      "src/components/home/HomeSplash.tsx",
      "src/components/home/HomeSplashGate.tsx",
      "src/components/home/splash.test.ts",
    ]);
    const hits = walk("src")
      .filter((file) =>
        /function HomeSplash|HomeSplashGate|components\/home\/HomeSplash/.test(readFileSync(file, "utf8")),
      )
      .map((file) => file.split(path.sep).join("/"));
    for (const file of hits) assert.ok(allowed.has(file), file);
    assert.ok(hits.includes("src/app/page.tsx"));
  });
});

describe("full wordmark", () => {
  it("keeps The Beacon Studio as a stacked lockup", () => {
    assert.deepEqual(wordmarkLines("The Beacon Studio"), {
      title: "The Beacon",
      studio: "Studio",
    });
    assert.deepEqual(wordmarkLines("Beacon"), { title: "Beacon", studio: "" });
  });

  it("does not swap the header lockup to the short name", () => {
    const source = readFileSync("src/components/brand/BeaconWordmark.tsx", "utf8");
    assert.match(source, /wordmarkLines\(siteConfig\.brand\.name\)/);
    assert.match(readFileSync("src/components/brand/wordmark.ts", "utf8"), /Studio/);
    assert.doesNotMatch(source, /sm:hidden/);
    assert.doesNotMatch(source, /shortName/);
    assert.match(source, /whitespace-nowrap/);
    assert.match(source, /min-w-max/);

    for (const file of [
      "src/components/layout/Header.tsx",
      "src/app/admin/layout.tsx",
      "src/app/portal/layout.tsx",
      "src/components/layout/Footer.tsx",
    ]) {
      const layout = readFileSync(file, "utf8");
      assert.match(layout, /BeaconWordmark/, file);
      assert.doesNotMatch(layout, /truncate/, file);
    }
  });
});
