import { sendResendEmail } from "@/lib/resend";
import type { AutomationInstance } from "@/lib/automations/types";

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
}): Promise<{ emailed: boolean; sms: boolean; whatsapp?: string }> {
  if (input.instance.demo) {
    return { emailed: false, sms: false, whatsapp: input.phone ? whatsappLink(input.phone, input.text) : undefined };
  }
  const channel = input.channel || "both";
  const wantEmail = channel !== "sms" && channel !== "whatsapp";
  const wantPhone = channel !== "email";
  let emailed = false;
  let sms = false;
  const wa = input.phone ? whatsappLink(input.phone, input.text) : "";
  const text = wa && !wantPhone ? input.text : wa ? `${input.text}\n\nWhatsApp: ${wa}` : input.text;
  if (wantEmail && input.email && !input.email.endsWith("@example.com")) {
    const result = await sendResendEmail({
      to: input.email,
      subject: input.subject,
      text,
      html: `<p>${escapeHtml(input.text).replace(/\n/g, "<br/>")}</p>${wa ? `<p><a href="${escapeHtml(wa)}">Open WhatsApp</a></p>` : ""}`,
    });
    emailed = result.sent;
  }
  if (wantPhone && input.phone) {
    const result = await sendSms(input.phone, input.text);
    sms = result.sent;
  }
  return { emailed, sms, ...(wa ? { whatsapp: wa } : {}) };
}
