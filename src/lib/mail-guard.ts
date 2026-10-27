/**
 * Checks for the admin mailbox send endpoint: same-origin, explicit confirmation,
 * size limits, and a per-session send rate. Pure so it can be unit tested.
 */
import { rateLimit } from "@/lib/rate-limit";

export const MAIL_SEND_MAX_BODY_BYTES = 6_000_000;
export const MAIL_SEND_MAX_TEXT = 50_000;
export const MAIL_SEND_MAX_SUBJECT = 300;
export const MAIL_SEND_MAX_RECIPIENTS = 20;
export const MAIL_SEND_LIMIT = 20;
export const MAIL_SEND_WINDOW_MS = 10 * 60_000;

export type SendGuardInput = {
  origin: string | null;
  referer: string | null;
  host: string | null;
  contentLength: number | null;
  confirm: unknown;
  to: string;
  cc?: string;
  subject: string;
  text: string;
};

function hostOf(value: string): string {
  return new URL(value).host.toLowerCase().replace(/^www\./, "");
}

/** A send must say where it came from, and that must be this site. */
export function sameOrigin(origin: string | null, referer: string | null, host: string | null): boolean {
  if (!host) return false;
  const h = host.split(",")[0].trim().toLowerCase().replace(/^www\./, "");
  const source = origin || referer;
  if (!source) return false;
  try {
    return hostOf(source) === h;
  } catch {
    return false;
  }
}

export function checkSend(input: SendGuardInput): string | null {
  if (!sameOrigin(input.origin, input.referer, input.host)) return "Send must come from the admin page.";
  if (input.contentLength !== null && input.contentLength > MAIL_SEND_MAX_BODY_BYTES) return "The message is too large.";
  if (input.confirm !== true) return "Confirm the send first.";
  const recipients = [input.to, input.cc || ""].join(",").split(/[,;]/).map((v) => v.trim()).filter(Boolean);
  if (!recipients.length) return "Add a recipient.";
  if (recipients.length > MAIL_SEND_MAX_RECIPIENTS) return `At most ${MAIL_SEND_MAX_RECIPIENTS} recipients.`;
  if (input.subject.length > MAIL_SEND_MAX_SUBJECT) return `Subject is longer than ${MAIL_SEND_MAX_SUBJECT} characters.`;
  if (input.text.length > MAIL_SEND_MAX_TEXT) return `Message is longer than ${MAIL_SEND_MAX_TEXT} characters.`;
  return null;
}

export function sendRateLimit(sessionKey: string, now = Date.now()): { ok: boolean; retryAfter: number } {
  return rateLimit(`mail-send:${sessionKey}`, MAIL_SEND_LIMIT, MAIL_SEND_WINDOW_MS, now);
}
