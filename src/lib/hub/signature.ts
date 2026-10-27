import { createHmac, timingSafeEqual } from "crypto";

/** Max allowed clock skew between app and hub, in seconds. */
export const MAX_SKEW_SECONDS = 300;

/** hex HMAC-SHA256 of `${timestamp}.${rawBody}` with the app secret. */
export function signPayload(secret: string, timestamp: string | number, rawBody: string): string {
  return `sha256=${createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex")}`;
}

export function signedHeaders(secret: string, rawBody: string, nowMs = Date.now()): Record<string, string> {
  const ts = String(Math.floor(nowMs / 1000));
  return { "X-Beacon-Timestamp": ts, "X-Beacon-Signature": signPayload(secret, ts, rawBody) };
}

function eq(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export type VerifyResult = { ok: true } | { ok: false; reason: string };

export function verifySignature(
  secret: string,
  timestamp: string | null,
  signature: string | null,
  rawBody: string,
  nowMs = Date.now()
): VerifyResult {
  if (!timestamp || !/^\d{9,11}$/.test(timestamp)) return { ok: false, reason: "missing_or_bad_timestamp" };
  if (!signature) return { ok: false, reason: "missing_signature" };
  const skew = Math.abs(Math.floor(nowMs / 1000) - Number(timestamp));
  if (skew > MAX_SKEW_SECONDS) return { ok: false, reason: "timestamp_skew" };
  if (!eq(signature.trim().toLowerCase(), signPayload(secret, timestamp, rawBody))) return { ok: false, reason: "bad_signature" };
  return { ok: true };
}

/** Rejects an exact replay of a signature seen inside the skew window (per process). */
export class ReplayGuard {
  private seen = new Map<string, number>();
  check(signature: string, nowMs = Date.now()): boolean {
    for (const [k, exp] of this.seen) if (exp <= nowMs) this.seen.delete(k);
    if (this.seen.has(signature)) return false;
    this.seen.set(signature, nowMs + MAX_SKEW_SECONDS * 1000 * 2);
    return true;
  }
}
