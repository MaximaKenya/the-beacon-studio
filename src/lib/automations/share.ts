import { createHmac, timingSafeEqual } from "crypto";

function secret(): string {
  return process.env.PORTAL_SECRET || process.env.ADMIN_PASSWORD || "beacon-dev-secret";
}

export function shareToken(kind: string, id: string): string {
  return createHmac("sha256", secret()).update(`${kind}:${id}`).digest("hex").slice(0, 32);
}

export function shareTokenMatches(kind: string, id: string, token: string): boolean {
  const expected = shareToken(kind, id);
  const given = token.trim();
  if (!given || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}
