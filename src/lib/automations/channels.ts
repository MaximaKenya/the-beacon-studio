import { randomUUID } from "crypto";
import { renderBrandEmail, publicSiteUrl } from "@/lib/brand-email";
import { clientBrandFromConfig, withSmsSignoff, withWhatsappSignoff, type ClientBrand } from "@/lib/brand-comms";
import { groqConfigured } from "@/lib/automations/groq";
import { planChannels, type OutboundChannel } from "@/lib/automations/delivery-plan";
import { sendSms, sendWhatsApp, smsConfigured, whatsAppConfigured } from "@/lib/notify";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import type { AutomationDelivery, AutomationDoc, AutomationInstance } from "@/lib/automations/types";

export type ChannelReadiness = {
  email: "ready" | "not configured";
  sms: "ready" | "not connected";
  whatsapp: "ready" | "not connected";
  marketing: "not connected";
  groq: "ready" | "not configured";
  summary: string;
};

export function channelReadiness(): ChannelReadiness {
  const email = isResendConfigured() ? "ready" : "not configured";
  const sms = smsConfigured() ? "ready" : "not connected";
  const whatsapp = whatsAppConfigured() ? "ready" : "not connected";
  const groq = groqConfigured() ? "ready" : "not configured";
  const summary = [
    email === "ready" ? "Email is ready." : "Email is off until RESEND_API_KEY is set. Runs are still saved.",
    sms === "ready" ? "SMS is ready." : "SMS is waiting for Africa's Talking (AT_USERNAME and AT_API_KEY).",
    whatsapp === "ready" ? "WhatsApp is ready." : "WhatsApp is waiting for WHATSAPP_TOKEN and WHATSAPP_PHONE_ID.",
    "Marketing is not connected.",
    groq === "ready" ? "Groq is ready for drafts and replies." : "Groq is off until GROQ_API_KEY is set. Drafts use the saved text.",
  ].join(" ");
  return { email, sms, whatsapp, marketing: "not connected", groq, summary };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type DeliveryRecord = Omit<AutomationDelivery, "id" | "instanceId" | "at">;

export type DeliverResult = {
  emailed: boolean;
  sms: boolean;
  whatsapp: boolean;
  waiting: Array<"sms" | "whatsapp">;
  note: string;
  records: DeliveryRecord[];
};

function letter(subject: string, text: string, client?: ClientBrand): { html: string; text: string } {
  const origin = publicSiteUrl();
  return renderBrandEmail({
    heading: subject,
    greeting: "Hello,",
    paragraphs: text.split(/\n{2,}/).filter((part) => part.trim()),
    // Messages to a client's own customers carry the client's branding and a small
    // "Powered by The Beacon Studio" line. Studio tests to the owner keep the portal link.
    ...(client ? { client } : { actions: [{ label: "Open your portal", href: `${origin}/portal` }] }),
  });
}

/** The client's branding for one automation (name from the instance; optional brand* config keys). */
export function instanceBrand(instance: AutomationInstance): ClientBrand {
  return clientBrandFromConfig(instance.businessName, instance.config || {});
}

/** SMS / WhatsApp text with the client's regards line. Idempotent. */
export function brandPhoneText(channel: "sms" | "whatsapp", text: string, instance: AutomationInstance): string {
  const client = instanceBrand(instance);
  return channel === "sms" ? withSmsSignoff(text, { client }) : withWhatsappSignoff(text, { client });
}

export async function deliver(input: {
  instance: AutomationInstance;
  email?: string;
  phone?: string;
  subject: string;
  text: string;
  channel?: string;
  /** Send only to the addresses passed in. Used for a studio test of a sandbox run. */
  liveTest?: boolean;
  idempotencyKey?: string;
}): Promise<DeliverResult> {
  if (input.instance.demo && !input.liveTest) {
    return {
      emailed: false,
      sms: false,
      whatsapp: false,
      waiting: [],
      note: "Demo run. Saved on the automation. Nothing was sent.",
      records: [],
    };
  }

  const notes: string[] = [];
  const records: DeliveryRecord[] = [];
  let emailed = false;
  let sms = false;
  let whatsapp = false;
  const waiting: Array<"sms" | "whatsapp"> = [];

  if (input.liveTest) {
    const email = input.email?.trim() || "";
    if (!email) notes.push("No test email address.");
    else if (!isResendConfigured()) notes.push("Email not sent: RESEND_API_KEY is not set.");
    else {
      const branded = letter(`[Demo test] ${input.subject}`, `This is a test for you. The customer was not contacted.\n\n${input.text}`);
      const result = await sendResendEmail({
        to: email,
        subject: `[Demo test] ${input.subject}`,
        text: branded.text,
        html: branded.html,
        ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
      });
      emailed = result.sent;
      notes.push(result.sent ? "Email sent." : `Email not sent: ${result.error || "Resend rejected it."}`);
      records.push({
        channel: "email",
        status: result.sent ? "sent" : "failed",
        to: email,
        subject: input.subject,
        text: input.text,
        note: notes[notes.length - 1] || "",
      });
    }
    return { emailed, sms, whatsapp, waiting, note: notes.join(" ") || "Nothing to send.", records };
  }

  const plan = planChannels({
    preference: input.channel,
    email: input.email,
    phone: input.phone,
    smsReady: smsConfigured(),
    whatsappReady: whatsAppConfigured(),
  });

  const sendOne = async (channel: OutboundChannel) => {
    if (channel === "email") {
      if (!plan.email) {
        notes.push("No email address on this run.");
        return;
      }
      if (plan.email.endsWith("@example.com")) {
        notes.push("Email skipped for an example.com address.");
        return;
      }
      if (!isResendConfigured()) {
        notes.push("Email not sent: RESEND_API_KEY is not set.");
        records.push({ channel: "email", status: "failed", to: plan.email, subject: input.subject, text: input.text, note: "RESEND_API_KEY is not set." });
        return;
      }
      const branded = letter(input.subject, input.text, instanceBrand(input.instance));
      const result = await sendResendEmail({
        to: plan.email,
        subject: input.subject,
        text: branded.text,
        html: branded.html,
        ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
      });
      emailed = result.sent;
      const note = result.sent ? "Email sent." : `Email not sent: ${result.error || "Resend rejected it."}`;
      notes.push(note);
      records.push({ channel: "email", status: result.sent ? "sent" : "failed", to: plan.email, subject: input.subject, text: input.text, note });
      return;
    }
    const sender = channel === "sms" ? sendSms : sendWhatsApp;
    const result = await sender(plan.phone, brandPhoneText(channel, input.text, input.instance));
    const note = result.sent ? `${channel === "sms" ? "SMS" : "WhatsApp"} sent.` : result.detail || `${channel} not sent.`;
    notes.push(note);
    if (channel === "sms") sms = result.sent;
    else whatsapp = result.sent;
    records.push({
      channel,
      status: result.sent ? "sent" : "failed",
      to: plan.phone,
      subject: input.subject,
      text: input.text,
      note,
    });
  };

  for (const channel of plan.send) await sendOne(channel);

  for (const channel of plan.waiting) {
    waiting.push(channel);
    const note = channel === "sms" ? "Waiting for SMS to be connected." : "Waiting for WhatsApp to be connected.";
    notes.push(note);
    records.push({
      channel,
      status: "waiting",
      to: plan.phone,
      subject: input.subject,
      text: input.text,
      note,
    });
  }

  if (plan.send.length === 0 && plan.waiting.length === 0) notes.push("Nothing to send.");
  return { emailed, sms, whatsapp, waiting, note: notes.join(" ") || "Nothing to send.", records };
}

export function rememberDeliveries(doc: AutomationDoc, instanceId: string, result: DeliverResult, at = new Date()) {
  doc.deliveries = doc.deliveries || [];
  for (const record of result.records) {
    doc.deliveries.push({
      id: randomUUID(),
      instanceId,
      at: at.toISOString(),
      ...record,
    });
  }
}
