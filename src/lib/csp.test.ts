import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCsp, createNonce, isEmbeddablePath } from "./csp";
import { assetBase } from "./asset-base";
import { healthBody, healthDetailAllowed } from "./health";
import { postLimitFor } from "./rate-limit";
import { brandContact, letterheadLines, renderEmailShell } from "./brand-comms";
import { siteConfig } from "../data/site";

describe("csp", () => {
  it("uses a nonce and locks down defaults", () => {
    const n = createNonce();
    assert.notEqual(n, createNonce());
    const csp = buildCsp(n);
    for (const part of ["default-src 'self'", `'nonce-${n}'`, "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'"]) {
      assert.ok(csp.includes(part), part);
    }
    assert.ok(!/script-src[^;]*unsafe-inline/.test(csp));
    assert.ok(!csp.includes("unsafe-eval"));
  });
  it("allows the asset CDN host only when configured", () => {
    const csp = buildCsp("x", { assetBase: "https://cdn.example.com" });
    for (const d of ["script-src", "style-src", "font-src", "connect-src"]) {
      assert.ok(new RegExp(`${d} [^;]*https://cdn\\.example\\.com`).test(csp), d);
    }
    assert.ok(!buildCsp("x", { assetBase: "" }).includes("cdn.example.com"));
    assert.equal(assetBase("https://cdn.example.com/"), "https://cdn.example.com");
    assert.equal(assetBase("http://cdn.example.com"), "");
    assert.equal(assetBase("https://cdn.example.com/x"), "");
    assert.equal(assetBase(""), "");
  });
  it("lets client embeds be framed", () => {
    assert.ok(isEmbeddablePath("/a/acme/book"));
    assert.ok(isEmbeddablePath("/api/automations/embed/acme"));
    assert.equal(isEmbeddablePath("/admin"), false);
    assert.ok(buildCsp("x", { embeddable: true }).includes("frame-ancestors *"));
  });
});

describe("health", () => {
  it("hides detail from the public", () => {
    const h = { ok: true, storage: "postgres", database: "up" };
    assert.deepEqual(healthBody(h, healthDetailAllowed(null, false, "s3cret")), { ok: true });
    assert.equal(healthDetailAllowed("Bearer wrong", false, "s3cret"), false);
    assert.equal(healthDetailAllowed("Bearer s3cret", false, ""), false);
    assert.deepEqual(healthBody(h, healthDetailAllowed("Bearer s3cret", false, "s3cret")), h);
    assert.ok(healthDetailAllowed(null, true, ""));
  });
});

describe("rate limits", () => {
  it("cover admin and portal sign-in tightly", () => {
    for (const p of ["/api/admin/auth", "/api/portal/auth", "/api/portal/magic", "/api/automations/portal"]) {
      const rule = postLimitFor(p);
      assert.ok(rule && rule.limit <= 20, p);
    }
    assert.equal(postLimitFor("/api/admin/auth")!.limit, 8);
  });
});

describe("brand placeholders", () => {
  it("never shows placeholder or pending text", () => {
    const c = brandContact({});
    assert.equal(c.privacyUrl, "https://thebeaconstudio.co.ke/privacy");
    const lines = letterheadLines({ contact: c });
    assert.equal(lines.registration, "");
    assert.equal(lines.kraPin, "");
    const { html } = renderEmailShell({ heading: "Hi", paragraphs: ["x"], contact: c });
    assert.ok(!/undefined|pending|yourusername/i.test(html));
    assert.ok(html.includes("/privacy"));
    assert.ok(!JSON.stringify(siteConfig.social).includes("yourusername"));
    assert.ok(!siteConfig.seo.twitterHandle.includes("yourusername"));
  });
  it("renders values when set", () => {
    const c = brandContact({ BRAND_REGISTRATION_NO: "BN-1", BRAND_KRA_PIN: "P1", BRAND_POSTAL_ADDRESS: "P.O. Box 1", BRAND_LINKEDIN_URL: "https://www.linkedin.com/company/x", BRAND_PRIVACY_URL: "https://x.test/p" });
    assert.equal(c.privacyUrl, "https://x.test/p");
    assert.match(letterheadLines({ contact: c }).registration, /BN-1/);
    assert.equal(c.linkedinUrl, "https://www.linkedin.com/company/x");
  });
});
