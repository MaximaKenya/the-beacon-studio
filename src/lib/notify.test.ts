import assert from "node:assert/strict";
import test from "node:test";
import {
  parseSmsInbound,
  parseWhatsAppWebhook,
  sendSms,
  sendWhatsApp,
  toInternationalDigits,
  whatsAppChallenge,
} from "@/lib/notify";

test("normalises Kenyan numbers", () => {
  assert.equal(toInternationalDigits("0712 345 678"), "254712345678");
  assert.equal(toInternationalDigits("+254712345678"), "254712345678");
});

test("SMS no-ops when Africa's Talking is unset", async () => {
  const previousUser = process.env.AT_USERNAME;
  const previousKey = process.env.AT_API_KEY;
  delete process.env.AT_USERNAME;
  delete process.env.AT_API_KEY;
  let called = false;
  const result = await sendSms("0712345678", "Hello", async () => {
    called = true;
    return new Response("no");
  });
  assert.equal(called, false);
  assert.equal(result.sent, false);
  assert.equal(result.skipped, true);
  if (previousUser === undefined) delete process.env.AT_USERNAME;
  else process.env.AT_USERNAME = previousUser;
  if (previousKey === undefined) delete process.env.AT_API_KEY;
  else process.env.AT_API_KEY = previousKey;
});

test("WhatsApp no-ops when the Cloud API is unset", async () => {
  const previousToken = process.env.WHATSAPP_TOKEN;
  const previousPhone = process.env.WHATSAPP_PHONE_ID;
  delete process.env.WHATSAPP_TOKEN;
  delete process.env.WHATSAPP_PHONE_ID;
  const result = await sendWhatsApp("0712345678", "Hello", async () => new Response("no"));
  assert.equal(result.skipped, true);
  assert.equal(result.sent, false);
  if (previousToken === undefined) delete process.env.WHATSAPP_TOKEN;
  else process.env.WHATSAPP_TOKEN = previousToken;
  if (previousPhone === undefined) delete process.env.WHATSAPP_PHONE_ID;
  else process.env.WHATSAPP_PHONE_ID = previousPhone;
});

test("SMS sends through the supplied fetcher when configured", async () => {
  process.env.AT_USERNAME = "sandbox";
  process.env.AT_API_KEY = "test-key";
  let body = "";
  const result = await sendSms("0712345678", "Booked", async (_url, init) => {
    body = String(init?.body ?? "");
    return new Response("{}", { status: 201 });
  });
  assert.equal(result.sent, true);
  assert.match(body, /to=%2B254712345678|to=\+254712345678/);
  delete process.env.AT_USERNAME;
  delete process.env.AT_API_KEY;
});

test("parses Africa's Talking form posts and WhatsApp payloads", () => {
  const sms = parseSmsInbound("from=%2B254712345678&text=Hello+there", "application/x-www-form-urlencoded");
  assert.equal(sms?.from, "+254712345678");
  assert.equal(sms?.text, "Hello there");
  const rows = parseWhatsAppWebhook({
    entry: [{ changes: [{ value: { messages: [{ from: "254712345678", text: { body: "Need a call" } }] } }] }],
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.text, "Need a call");
});

test("WhatsApp verify token accepts the matching challenge", () => {
  process.env.WHATSAPP_VERIFY_TOKEN = "beacon-verify";
  const ok = whatsAppChallenge(
    new URL("https://thebeaconstudio.co.ke/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=beacon-verify&hub.challenge=12345")
  );
  assert.equal(ok.status, 200);
  assert.equal(ok.body, "12345");
  const bad = whatsAppChallenge(
    new URL("https://thebeaconstudio.co.ke/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=12345")
  );
  assert.equal(bad.status, 403);
  delete process.env.WHATSAPP_VERIFY_TOKEN;
  const missing = whatsAppChallenge(new URL("https://thebeaconstudio.co.ke/api/whatsapp/webhook"));
  assert.equal(missing.status, 503);
});
