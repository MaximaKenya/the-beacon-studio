import { groqConfigured } from "@/lib/automations/groq";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import type { AutomationInstance } from "@/lib/automations/types";

export type ChannelReadiness = {
  email: "ready" | "not configured";
  sms: "ready" | "not configured";
  whatsapp: "link only";
  groq: "ready" | "not configured";
  summary: string;
};

export function channelReadiness(): ChannelReadiness {
  const email = isResendConfigured() ? "ready" : "not configured";
  const sms = process.env.AT_API_KEY?.trim() && process.env.AT_USERNAME?.trim() ? "ready" : "not configured";
  const groq = groqConfigured() ? "ready" : "not configured";
  const summary = [
    email === "ready" ? "Email is ready." : "Email is off until RESEND_API_KEY is set. Runs are still saved.",
    sms === "ready" ? "SMS is ready." : "SMS is off until AT_API_KEY and AT_USERNAME are set.",
    "WhatsApp is a wa.me link. There is no WhatsApp Business API key yet.",
    groq === "ready" ? "Groq is ready for drafts and replies." : "Groq is off until GROQ_API_KEY is set. Drafts use the saved text.",
  ].join(" ");
  return { email, sms, whatsapp: "link only", groq, summary };
}

export function whatsappLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendSms(phone: string, message: string): Promise<{ sent: boolean; link: string }> {
  const link = whatsappLink(phone, message);
  const key = process.env.AT_API_KEY?.trim();
  const username = process.env.AT_USERNAME?.trim();
  if (!key || !username || !phone.trim()) return { sent: false, link };
  const body = new URLSearchParams({
    username,
    to: phone.replace(/\s+/g, ""),
    message: message.slice(0, 480),
  });
  const sender = process.env.AT_SENDER_ID?.trim();
  if (sender) body.set("from", sender);
  try {
    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey: key,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    return { sent: response.ok, link };
  } catch {
    return { sent: false, link };
  }
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
}): Promise<{ emailed: boolean; sms: boolean; whatsapp?: string; note: string }> {
  const wa = input.phone ? whatsappLink(input.phone, input.text) : "";
  if (input.instance.demo && !input.liveTest) {
    return {
      emailed: false,
      sms: false,
      ...(wa ? { whatsapp: wa } : {}),
      note: "Demo run. Saved on the automation. Nothing was sent.",
    };
  }
  const channel = input.channel || "both";
  const wantEmail = channel !== "sms" && channel !== "whatsapp";
  const wantPhone = channel !== "email";
  const notes: string[] = [];
  let emailed = false;
  let sms = false;
  const text = wa && wantPhone ? `${input.text}\n\nWhatsApp: ${wa}` : input.text;
  if (wantEmail && input.email) {
    if (input.email.endsWith("@example.com")) {
      notes.push("Email skipped for an example.com address.");
    } else if (!isResendConfigured()) {
      notes.push("Email not sent: RESEND_API_KEY is not set.");
    } else {
      const result = await sendResendEmail({
        to: input.email,
        subject: input.subject,
        text,
        html: `<p>${escapeHtml(input.text).replace(/\n/g, "<br/>")}</p>${wa ? `<p><a href="${escapeHtml(wa)}">Open WhatsApp</a></p>` : ""}`,
      });
      emailed = result.sent;
      notes.push(result.sent ? "Email sent." : `Email not sent: ${result.error || "Resend rejected it."}`);
    }
  } else if (wantEmail) {
    notes.push("No email address on this run.");
  }
  if (wantPhone && input.phone) {
    const result = await sendSms(input.phone, input.text);
    sms = result.sent;
    notes.push(result.sent ? "SMS sent." : "SMS not sent: AT_API_KEY or AT_USERNAME is not set.");
    if (wa) notes.push("WhatsApp link ready.");
  } else if (wantPhone) {
    notes.push("No phone number on this run.");
  }
  return { emailed, sms, ...(wa ? { whatsapp: wa } : {}), note: notes.join(" ") || "Nothing to send." };
}
