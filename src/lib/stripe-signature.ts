import { createHmac, timingSafeEqual } from "node:crypto";

/** Verify a Stripe-Signature header (t=…,v1=…) over the raw body. Tolerance in seconds. */
export function verifyStripeSignature(raw: string, header: string | null, secret: string, now = Date.now(), tolerance = 300): boolean {
  if (!header || !secret) return false;
  const parts = header.split(",").map((part) => part.trim().split("="));
  const t = parts.find(([key]) => key === "t")?.[1] || "";
  const sigs = parts.filter(([key]) => key === "v1").map(([, value]) => value || "");
  const ts = Number(t);
  if (!Number.isFinite(ts) || Math.abs(now / 1000 - ts) > tolerance || sigs.length === 0) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex"));
  return sigs.some((sig) => {
    const given = Buffer.from(sig);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}
