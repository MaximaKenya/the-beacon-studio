import { groqConfigured } from "@/lib/automations/groq";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import type { AutomationInstance } from "@/lib/automations/types";

export type ChannelReadiness = {
  email: "ready" | "not configured";
  sms: "not connected";
  whatsapp: "not connected";
  marketing: "not connected";
  groq: "ready" | "not configured";
  summary: string;
};

export function channelReadiness(): ChannelReadiness {
  const email = isResendConfigured() ? "ready" : "not configured";
  const groq = groqConfigured() ? "ready" : "not configured";
  const summary = [
    email === "ready" ? "Email is ready." : "Email is off until RESEND_API_KEY is set. Runs are still saved.",
    "Africa's Talking is not connected.",
    "WhatsApp is not connected.",
    "Marketing is not connected.",
    groq === "ready" ? "Groq is ready for drafts and replies." : "Groq is off until GROQ_API_KEY is set. Drafts use the saved text.",
  ].join(" ");
  return { email, sms: "not connected", whatsapp: "not connected", marketing: "not connected", groq, summary };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
}): Promise<{ emailed: boolean; sms: boolean; whatsapp?: string; note: string }> {
  if (input.instance.demo && !input.liveTest) {
    return {
      emailed: false,
      sms: false,
      note: "Demo run. Saved on the automation. Nothing was sent.",
    };
  }
  const channel = input.channel || "both";
  const wantEmail = Boolean(input.liveTest) || (channel !== "sms" && channel !== "whatsapp");
  const wantPhone = !input.liveTest && channel !== "email";
  const notes: string[] = [];
  let emailed = false;
  const text = input.text;
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
        html: `<p>${escapeHtml(input.text).replace(/\n/g, "<br/>")}</p>`,
        ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
      });
      emailed = result.sent;
      notes.push(result.sent ? "Email sent." : `Email not sent: ${result.error || "Resend rejected it."}`);
    }
  } else if (wantEmail) {
    notes.push("No email address on this run.");
  }
  if (wantPhone) {
    notes.push("Africa's Talking is not connected. WhatsApp is not connected.");
  }
  return { emailed, sms: false, note: notes.join(" ") || "Nothing to send." };
}
