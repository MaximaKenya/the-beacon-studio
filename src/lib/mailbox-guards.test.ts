import assert from "node:assert/strict";
import test from "node:test";
import { fromHeaderFor, mailboxOfAddress, mailboxesOf } from "@/lib/mail-addresses";
import { MAIL_SEND_LIMIT, checkSend, sameOrigin, sendRateLimit } from "@/lib/mail-guard";
import { blockRemoteImages, sanitizeEmailHtml } from "@/lib/html-sanitize";

test("mailbox labels come from the studio addresses", () => {
  assert.equal(mailboxOfAddress("Support <support@thebeaconstudio.co.ke>"), "support");
  assert.equal(mailboxOfAddress("BILLING@thebeaconstudio.co.ke"), "billing");
  assert.equal(mailboxOfAddress("hello+lead-reply@thebeaconstudio.co.ke"), "hello");
  assert.equal(mailboxOfAddress("someone@example.com"), null);
  assert.deepEqual(
    mailboxesOf([
      { direction: "in", from: "a@example.com", to: ["support@thebeaconstudio.co.ke"], cc: ["admin@thebeaconstudio.co.ke"] },
      { direction: "out", from: "billing@thebeaconstudio.co.ke", to: ["a@example.com"], cc: [] },
    ]),
    ["support", "billing", "admin"]
  );
  assert.deepEqual(mailboxesOf([{ direction: "in", from: "a@example.com", to: ["x@example.com"], cc: [] }]), ["hello"]);
});

test("send from a chosen address, unknown falls back to hello", () => {
  assert.equal(fromHeaderFor("billing").address, "billing@thebeaconstudio.co.ke");
  assert.equal(fromHeaderFor("billing").header, "The Beacon Studio <billing@thebeaconstudio.co.ke>");
  assert.equal(fromHeaderFor("evil@attacker.com").address, "hello@thebeaconstudio.co.ke");
});

test("sends need same origin, confirmation and sane sizes", () => {
  const base = {
    origin: "https://thebeaconstudio.co.ke",
    referer: null,
    host: "thebeaconstudio.co.ke",
    contentLength: 1000,
    confirm: true,
    to: "a@example.com",
    subject: "Hi",
    text: "Hello",
  };
  assert.equal(checkSend(base), null);
  assert.match(String(checkSend({ ...base, origin: "https://evil.example" })), /admin page/);
  assert.match(String(checkSend({ ...base, origin: null })), /admin page/);
  assert.match(String(checkSend({ ...base, confirm: undefined })), /Confirm/);
  assert.match(String(checkSend({ ...base, contentLength: 50_000_000 })), /too large/);
  assert.match(String(checkSend({ ...base, to: "" })), /recipient/);
  assert.match(String(checkSend({ ...base, to: Array.from({ length: 25 }, (_, i) => `u${i}@example.com`).join(",") })), /At most/);
  assert.match(String(checkSend({ ...base, text: "x".repeat(60_000) })), /longer/);
  assert.equal(sameOrigin(null, "https://www.thebeaconstudio.co.ke/admin", "thebeaconstudio.co.ke"), true);
});

test("send rate limit per session", () => {
  const key = `test-${Math.random()}`;
  const now = Date.now();
  for (let i = 0; i < MAIL_SEND_LIMIT; i += 1) assert.equal(sendRateLimit(key, now).ok, true);
  const blocked = sendRateLimit(key, now);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfter > 0);
});

test("HTML has no scripts and remote images are blocked by default", () => {
  const clean = sanitizeEmailHtml('<p onclick="x()">Hi</p><script>alert(1)</script><img src="https://track.example/p.gif" alt="logo"><img src="cid:abc">');
  assert.doesNotMatch(clean, /script|onclick/i);
  const blocked = blockRemoteImages(clean);
  assert.equal(blocked.blocked, 1);
  assert.doesNotMatch(blocked.html, /track\.example/);
  assert.match(blocked.html, /mail-blocked-image/);
});
