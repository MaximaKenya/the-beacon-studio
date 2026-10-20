/**
 * Resend send helper. Without RESEND_API_KEY, callers keep the local workflow
 * and skip email. The admin mailbox treats the integration as configured only
 * when both RESEND_API_KEY and RESEND_FROM_EMAIL are set.
 */
import { Resend } from "resend";
import { siteConfig } from "@/data/site";

export type ResendAttachment = {
  filename: string;
  content: string | Buffer;
  contentType?: string;
};

export type ResendResult = { sent: boolean; id?: string; error?: string };

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Mailbox send + inbound fetch need a real from-address, not the Resend sandbox. */
export function isMailboxConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim());
}

export function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim() || "";
  const match = raw.match(/<([^>]+)>/);
  return (match ? match[1] : raw).trim().toLowerCase();
}

export function fromHeader(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim() || "";
  if (!raw) return `${siteConfig.brand.name} <onboarding@resend.dev>`;
  if (raw.includes("<")) return raw;
  return `${siteConfig.brand.name} <${raw}>`;
}

export function replyToAddress(override?: string): string | undefined {
  const value = override?.trim() || process.env.RESEND_REPLY_TO?.trim() || fromAddress();
  return value || undefined;
}

export async function sendResendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  attachments?: ResendAttachment[];
  headers?: Record<string, string>;
  idempotencyKey?: string;
}): Promise<ResendResult> {
  const resend = resendClient();
  if (!resend) return { sent: false, error: "RESEND_API_KEY unset" };

  const to = (Array.isArray(opts.to) ? opts.to : [opts.to]).map((v) => v.trim()).filter(Boolean);
  if (!to.length) return { sent: false, error: "No recipient" };

  const cc = opts.cc
    ? (Array.isArray(opts.cc) ? opts.cc : [opts.cc]).map((v) => v.trim()).filter(Boolean)
    : undefined;
  const replyTo = replyToAddress(opts.replyTo);

  const { data, error } = await resend.emails.send(
    {
      from: fromHeader(),
      to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.text ? { text: opts.text } : {}),
      ...(cc && cc.length ? { cc } : {}),
      ...(replyTo ? { replyTo } : {}),
      ...(opts.headers ? { headers: opts.headers } : {}),
      ...(opts.attachments?.length
        ? {
            attachments: opts.attachments.map((file) => ({
              filename: file.filename,
              content: file.content,
              ...(file.contentType ? { contentType: file.contentType } : {}),
            })),
          }
        : {}),
    },
    opts.idempotencyKey ? { idempotencyKey: opts.idempotencyKey.slice(0, 256) } : undefined
  );

  if (error) return { sent: false, error: error.message };
  return { sent: true, id: data?.id };
}
