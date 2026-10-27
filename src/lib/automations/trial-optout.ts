import { createHmac, timingSafeEqual } from "crypto";
import { publicSiteUrl } from "@/lib/brand-email";

function secret(): string {
  return process.env.PORTAL_SECRET || process.env.ADMIN_PASSWORD || "beacon-dev-secret";
}

export function trialOptOutToken(email: string) {
  return createHmac("sha256", secret()).update(`trial-optout:${email.toLowerCase()}`).digest("base64url").slice(0, 32);
}

export function verifyTrialOptOut(email: string, token: string) {
  const expected = Buffer.from(trialOptOutToken(email));
  const given = Buffer.from(token || "");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function trialOptOutUrl(email: string) {
  const params = new URLSearchParams({ e: email, t: trialOptOutToken(email) });
  return `${publicSiteUrl()}/api/automations/trial-optout?${params.toString()}`;
}
