import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import { DELETE, POST } from "../app/api/admin/auth/route";
import { proxy } from "../proxy";
import { portalSessionCookieOptions } from "./portal-auth";
import {
  applySessionCookie,
  browserWouldStoreCookie,
  cookieSentToHost,
  expireSessionCookie,
  httpsRedirectTarget,
  serializeSetCookie,
  sessionCookieOptions,
  sessionCookieOptionsFromRequest,
} from "./session-cookie";

const WEEK = 60 * 60 * 24 * 7;

function productionRequest(proto: "http" | "https", host = "thebeaconstudio.co.ke", path = "/admin") {
  return {
    forwardedProto: proto,
    forwardedHost: null,
    host,
    requestProtocol: "http:",
    urlHostname: host,
    maxAge: WEEK,
    url: new URL(`http://${host}${path}`),
  };
}

describe("https redirect", () => {
  it("redirects the production apex when x-forwarded-proto is http", () => {
    const input = productionRequest("http");
    const target = httpsRedirectTarget(input);
    assert.equal(target?.toString(), "https://thebeaconstudio.co.ke/admin");
  });

  it("keeps the query string and www host", () => {
    const target = httpsRedirectTarget({
      ...productionRequest("http", "www.thebeaconstudio.co.ke", "/admin?next=%2Fmail"),
      url: new URL("http://10.0.0.5/admin?next=%2Fmail"),
    });
    assert.equal(target?.toString(), "https://www.thebeaconstudio.co.ke/admin?next=%2Fmail");
  });

  it("does not redirect when Heroku already terminated TLS", () => {
    const target = httpsRedirectTarget(productionRequest("https"));
    assert.equal(target, null);
  });

  it("trusts the first forwarded proto, not the dyno URL", () => {
    const target = httpsRedirectTarget({
      ...productionRequest("http"),
      forwardedProto: "https, http",
    });
    assert.equal(target, null);
  });

  it("leaves localhost, herokuapp, and vercel preview on their own scheme", () => {
    for (const host of ["localhost", "the-beacon-studio.herokuapp.com", "beacon-git-main.vercel.app"]) {
      const target = httpsRedirectTarget(productionRequest("http", host, "/admin"));
      assert.equal(target, null, host);
    }
  });
});

describe("session cookie", () => {
  it("does not set Secure on the production host when the browser used http", () => {
    const options = sessionCookieOptions(productionRequest("http"));
    assert.equal(options.secure, false);
    assert.equal(options.domain, "thebeaconstudio.co.ke");
    assert.equal(options.httpOnly, true);
    assert.equal(options.path, "/");
    assert.equal(options.sameSite, "lax");
    assert.equal(browserWouldStoreCookie(options, "http"), true);

    const legacy = { secure: true as const };
    assert.equal(browserWouldStoreCookie(legacy, "http"), false);
    const legacyHeader = serializeSetCookie("beacon_admin", "token", { ...options, ...legacy });
    assert.match(legacyHeader, /Secure/);
  });

  it("sets Secure and a shared domain on https for both apex and www", () => {
    const apex = sessionCookieOptions(productionRequest("https"));
    const www = sessionCookieOptions(productionRequest("https", "www.thebeaconstudio.co.ke"));
    assert.equal(apex.secure, true);
    assert.equal(www.secure, true);
    assert.equal(apex.domain, "thebeaconstudio.co.ke");
    assert.equal(www.domain, apex.domain);
    assert.equal(browserWouldStoreCookie(apex, "https"), true);
    assert.equal(cookieSentToHost(apex, "thebeaconstudio.co.ke", "www.thebeaconstudio.co.ke"), true);
    assert.equal(cookieSentToHost(apex, "www.thebeaconstudio.co.ke", "thebeaconstudio.co.ke"), true);
    assert.equal(cookieSentToHost({ domain: undefined }, "thebeaconstudio.co.ke", "www.thebeaconstudio.co.ke"), false);

    const header = serializeSetCookie("beacon_portal", "tok.sig", www);
    assert.match(header, /^beacon_portal=tok\.sig;/);
    assert.match(header, /Domain=thebeaconstudio\.co\.ke/);
    assert.match(header, /Secure/);
    assert.match(header, /HttpOnly/);
    assert.match(header, /SameSite=Lax/);
    assert.match(header, /Path=\//);
  });

  it("omits Domain and Secure for local development", () => {
    const options = sessionCookieOptions({
      forwardedProto: null,
      forwardedHost: null,
      host: "localhost:3000",
      requestProtocol: "http:",
      urlHostname: "localhost",
      maxAge: WEEK,
    });
    assert.equal(options.secure, false);
    assert.equal(options.domain, undefined);
    const header = serializeSetCookie("beacon_admin", "abc", options);
    assert.doesNotMatch(header, /Domain=/);
    assert.doesNotMatch(header, /Secure/);
  });

  it("reads the same flags from a Heroku-style request", () => {
    const request = new Request("http://thebeaconstudio.co.ke/api/admin/auth", {
      headers: {
        host: "thebeaconstudio.co.ke",
        "x-forwarded-proto": "https",
      },
    });
    const options = sessionCookieOptionsFromRequest(request, WEEK);
    assert.equal(options.secure, true);
    assert.equal(options.domain, "thebeaconstudio.co.ke");
    assert.deepEqual(portalSessionCookieOptions(request).domain, options.domain);
    assert.equal(portalSessionCookieOptions(request).secure, true);
  });
});

describe("admin auth route", () => {
  const previous = process.env.ADMIN_PASSWORD;

  it("sets a storeable cookie on https and none on a bad password", async () => {
    process.env.ADMIN_PASSWORD = "correct-horse";
    try {
      const ok = await POST(
        new Request("http://thebeaconstudio.co.ke/api/admin/auth", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            host: "www.thebeaconstudio.co.ke",
            "x-forwarded-proto": "https",
          },
          body: JSON.stringify({ password: "correct-horse" }),
        })
      );
      assert.equal(ok.status, 200);
      const setCookies = ok.headers.getSetCookie();
      const session = setCookies.find((line) => line.startsWith("beacon_admin=") && !line.startsWith("beacon_admin=;"));
      assert.ok(session, setCookies.join("\n"));
      assert.match(session, /Domain=thebeaconstudio\.co\.ke/);
      assert.match(session, /Secure/);
      assert.match(session, /HttpOnly/);
      assert.match(session, /Path=\//);
      assert.match(session, /SameSite=Lax/);
      const cleared = setCookies.find((line) => line.startsWith("beacon_admin=;"));
      assert.ok(cleared);
      assert.doesNotMatch(cleared, /Domain=/);

      const bad = await POST(
        new Request("https://thebeaconstudio.co.ke/api/admin/auth", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            host: "thebeaconstudio.co.ke",
            "x-forwarded-proto": "https",
          },
          body: JSON.stringify({ password: "nope" }),
        })
      );
      assert.equal(bad.status, 401);
      assert.equal(bad.headers.getSetCookie().length, 0);
    } finally {
      if (previous === undefined) delete process.env.ADMIN_PASSWORD;
      else process.env.ADMIN_PASSWORD = previous;
    }
  });

  it("omits Secure when the production host is still on http", async () => {
    process.env.ADMIN_PASSWORD = "correct-horse";
    try {
      const res = await POST(
        new Request("http://thebeaconstudio.co.ke/api/admin/auth", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            host: "thebeaconstudio.co.ke",
            "x-forwarded-proto": "http",
          },
          body: JSON.stringify({ password: "correct-horse" }),
        })
      );
      const session = res.headers.getSetCookie().find((line) => /beacon_admin=[^;]/.test(line) && !line.startsWith("beacon_admin=;"));
      assert.ok(session);
      assert.doesNotMatch(session, /Secure/);
      assert.match(session, /Domain=thebeaconstudio\.co\.ke/);
    } finally {
      if (previous === undefined) delete process.env.ADMIN_PASSWORD;
      else process.env.ADMIN_PASSWORD = previous;
    }
  });

  it("expires both the host-only and the shared cookie on logout", async () => {
    const res = await DELETE(
      new Request("https://www.thebeaconstudio.co.ke/api/admin/auth", {
        method: "DELETE",
        headers: {
          host: "www.thebeaconstudio.co.ke",
          "x-forwarded-proto": "https",
        },
      })
    );
    const lines = res.headers.getSetCookie();
    assert.equal(lines.length, 2);
    assert.ok(lines.some((line) => line.startsWith("beacon_admin=;") && !/Domain=/.test(line)));
    assert.ok(lines.some((line) => line.startsWith("beacon_admin=;") && /Domain=thebeaconstudio\.co\.ke/.test(line)));
    assert.ok(lines.every((line) => /Secure/.test(line)));
  });
});

describe("proxy", () => {
  it("308s an http production request and preserves the method", () => {
    const request = new NextRequest("http://thebeaconstudio.co.ke/portal/login?token=abc", {
      headers: {
        host: "thebeaconstudio.co.ke",
        "x-forwarded-proto": "http",
      },
    });
    const response = proxy(request);
    assert.equal(response.status, 308);
    assert.equal(response.headers.get("location"), "https://thebeaconstudio.co.ke/portal/login?token=abc");
  });

  it("does not redirect an already secure production request", () => {
    const request = new NextRequest("http://thebeaconstudio.co.ke/admin", {
      headers: {
        host: "thebeaconstudio.co.ke",
        "x-forwarded-proto": "https",
      },
    });
    const response = proxy(request);
    assert.notEqual(response.status, 308);
    assert.equal(response.headers.get("location"), null);
  });
});

describe("set-cookie helper", () => {
  it("appends two Set-Cookie headers when a domain is present", () => {
    const headers = new Headers();
    const options = sessionCookieOptions(productionRequest("https"));
    applySessionCookie({ headers }, "beacon_admin", "abc", options);
    expireSessionCookie({ headers }, "beacon_portal", options);
    const lines = headers.getSetCookie();
    assert.equal(lines.filter((line) => line.startsWith("beacon_admin=")).length, 2);
    assert.equal(lines.filter((line) => line.startsWith("beacon_portal=")).length, 2);
  });
});
