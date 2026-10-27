import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SISTER_APPS,
  SMS_SIGNOFF_MAX,
  brandContact,
  emailSignatureHtml,
  emailSignatureText,
  gsm7Length,
  hasSignature,
  isGsm7,
  letterheadLines,
  renderEmailShell,
  smsSegments,
  smsSignoff,
  stripSignature,
  welcomeEmail,
  whatsappSignoff,
  withSignature,
  withSmsSignoff,
  withWhatsappSignoff,
} from "./brand-comms";
import { sendTrialWelcome, sendWelcomeEmail } from "./automations/lifecycle";
import type { AutomationDoc } from "./automations/types";

test("SMS sign-offs are GSM-7 and short for the studio and every sister app", () => {
  for (const appName of [undefined, ...SISTER_APPS]) {
    const s = smsSignoff(appName ? { appName } : {});
    assert.ok(isGsm7(s), s);
    assert.ok(gsm7Length(s) <= SMS_SIGNOFF_MAX, `${s} is ${gsm7Length(s)}`);
    assert.ok(s.startsWith("- "));
    assert.match(s, /The Beacon Studio/);
  }
  assert.equal(smsSignoff(), "- The Beacon Studio, support@thebeaconstudio.co.ke");
  assert.match(smsSignoff({ appName: "ConfiRent" }), /^- ConfiRent by The Beacon Studio/);
});

test("SMS length counts GSM-7 extension chars and segments", () => {
  assert.equal(gsm7Length("{}"), 4);
  assert.equal(smsSegments("a".repeat(160)), 1);
  assert.equal(smsSegments("a".repeat(161)), 2);
  assert.equal(smsSegments("a".repeat(306)), 2);
  assert.equal(smsSegments("é€" + "😀"), 1);
  assert.equal(smsSegments("😀".repeat(36)), 2);
});

test("withSmsSignoff appends once and stays GSM-7", () => {
  const once = withSmsSignoff("Your invoice is due Friday.");
  assert.ok(isGsm7(once));
  assert.equal(withSmsSignoff(once), once);
  assert.ok(once.endsWith(smsSignoff()));
});

test("client SMS and WhatsApp sign-offs use the client's name", () => {
  assert.match(smsSignoff({ client: { name: "Acme Dental", phone: "0712 000 000" } }), /^- Acme Dental/);
  const wa = whatsappSignoff({ client: { name: "Acme Dental" } });
  assert.match(wa, /\*Acme Dental\*/);
  assert.match(wa, /_Powered by The Beacon Studio_/);
});

test("WhatsApp sign-off has a Regards block and appends once", () => {
  const wa = whatsappSignoff();
  assert.match(wa, /^Regards,/);
  assert.match(wa, /\*The Beacon Studio\*/);
  assert.match(wa, /0706 397 373/);
  const msg = withWhatsappSignoff("Hello");
  assert.equal(withWhatsappSignoff(msg), msg);
});

test("signatures carry the mailbox address, phone and site", () => {
  for (const id of ["hello", "support", "billing", "admin"] as const) {
    const text = emailSignatureText(id);
    assert.match(text, new RegExp(`${id}@thebeaconstudio\\.co\\.ke`));
    assert.match(text, /0706 397 373/);
    assert.match(text, /thebeaconstudio\.co\.ke/);
    const html = emailSignatureHtml(id);
    assert.match(html, new RegExp(`mailto:${id}@thebeaconstudio\\.co\\.ke`));
    assert.doesNotMatch(html, /border:\s*1px/);
  }
  assert.match(emailSignatureText("support", { appName: "Convoria" }), /Convoria by The Beacon Studio/);
});

test("withSignature swaps mailboxes without duplicating or eating forwards", () => {
  const a = withSignature("Hi there", "hello");
  assert.ok(hasSignature(a));
  const b = withSignature(a, "billing");
  assert.match(b, /billing@/);
  assert.doesNotMatch(b, /hello@thebeaconstudio/);
  assert.equal(stripSignature(b), "Hi there");
  const forwarded = "FYI\n\n--\n---------- Forwarded message ----------\nFrom: x@y.com\nhello@thebeaconstudio.co.ke";
  assert.equal(hasSignature(forwarded), false);
});

test("email shell has preheader, dark mode, CTA and no secrets/placeholders", () => {
  const { html, text } = renderEmailShell({ heading: "Hi", preheader: "Pre", paragraphs: ["Body"], actions: [{ label: "Go", href: "https://x.test" }], signature: "support" });
  assert.match(html, /prefers-color-scheme: dark/);
  assert.match(html, /Pre/);
  assert.match(html, /href="https:\/\/x\.test"/);
  assert.match(html, /support@thebeaconstudio\.co\.ke/);
  assert.doesNotMatch(html, /yourusername|example\.com/);
  assert.match(text, /Body/);
  const client = renderEmailShell({ heading: "Hi", paragraphs: ["x"], client: { name: "Acme" } });
  assert.match(client.html, /Powered by The Beacon Studio/);
});

test("welcome email explains each mailbox, trial counter and links", () => {
  const mail = welcomeEmail({ name: "Amina", daysLeft: 27, siteUrl: "https://thebeaconstudio.co.ke" });
  assert.match(mail.subject, /27 of 30 trial days left/);
  for (const id of ["hello", "support", "billing", "admin"]) assert.match(mail.text, new RegExp(`${id}@thebeaconstudio`));
  assert.match(mail.html, /\/how-it-works/);
  assert.match(mail.html, /\/portal/);
});

test("letterhead lines are config-driven and never invent values", () => {
  const empty = letterheadLines({ contact: brandContact({}) });
  assert.equal(empty.registration, "");
  assert.equal(empty.footer(1, 2).includes("Page 1 of 2"), true);
  const set = letterheadLines({ contact: brandContact({ BRAND_REGISTRATION_NO: "PVT-123" }) });
  assert.match(set.registration, /PVT-123/);
});

test("welcome email sends once per signup", async () => {
  const calls: Array<{ idempotencyKey?: string; purpose?: string }> = [];
  const fake = async (opts: { idempotencyKey?: string; purpose?: string }) => {
    calls.push(opts);
    return { sent: true };
  };
  const doc = {
    instances: [
      { id: "i1", ownerEmail: "a@shop.co.ke", ownerName: "A", businessName: "Shop", templateId: "x", trial: { start: "2026-10-01", endsAt: "2026-10-31T00:00:00.000Z", remindersSent: [] } },
    ],
  } as unknown as AutomationDoc;
  await sendTrialWelcome(doc, "a@shop.co.ke", fake as never);
  await sendTrialWelcome(doc, "a@shop.co.ke", fake as never);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].purpose, "welcome");
  assert.equal(calls[0].idempotencyKey, "welcome/a@shop.co.ke/2026-10-01");
  assert.equal(await sendWelcomeEmail({ to: "x@example.com" }, fake as never), false);
  assert.equal(calls.length, 1);
});

test("failed welcome send is retried later", async () => {
  let n = 0;
  const failing = async () => ((n += 1), { sent: false });
  const doc = { instances: [{ id: "i", ownerEmail: "b@x.co.ke", templateId: "x", trial: { start: "s", endsAt: "2026-12-01T00:00:00.000Z", remindersSent: [] } }] } as unknown as AutomationDoc;
  await sendTrialWelcome(doc, "b@x.co.ke", failing as never);
  await sendTrialWelcome(doc, "b@x.co.ke", failing as never);
  assert.equal(n, 2);
});
