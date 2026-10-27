/**
 * Resend send helper. Without RESEND_API_KEY, callers keep the local workflow
 * and skip email. Every send uses EMAIL_FROM, or the verified studio address.
 */
import { Resend } from "resend";
import { siteConfig } from "@/data/site";
import { senderFor, type MailPurpose } from "@/lib/mail-addresses";

export const DEFAULT_FROM = "The Beacon Studio <hello@thebeaconstudio.co.ke>";

export type ResendAttachment = {
  filename: string;
  content: string | Buffer;
  contentType?: string;
};

export type ResendResult = { sent: boolean; id?: string; error?: string };

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Sending needs the API key. The from-address has a default on the verified domain. */
export function isMailboxConfigured(): boolean {
  return isResendConfigured();
}

export function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

function configuredFrom(): string {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
}

export function fromAddress(): string {
  const raw = configuredFrom();
  const match = raw.match(/<([^>]+)>/);
  return (match ? match[1] : raw).trim().toLowerCase();
}

export function fromHeader(): string {
  const raw = configuredFrom();
  if (raw.includes("<")) return raw;
  return `${siteConfig.brand.name} <${raw}>`;
}

export function replyToAddress(override?: string): string | undefined {
  const value = override?.trim() || process.env.RESEND_REPLY_TO?.trim() || fromAddress();
  return value || undefined;
}

export async function sendResendEmail(opts: {
  /** Full From header on the verified domain, e.g. "The Beacon Studio <support@…>". */
  from?: string;
  /** What the email is for. Picks the From and Reply-To mailbox from mail-addresses. */
  purpose?: MailPurpose;
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
  const sender = opts.purpose && !opts.from ? senderFor(opts.purpose) : null;
  const replyTo = sender ? opts.replyTo?.trim() || sender.replyTo : replyToAddress(opts.replyTo);

  const { data, error } = await resend.emails.send(
    {
      from: opts.from || sender?.header || fromHeader(),
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
