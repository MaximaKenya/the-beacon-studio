/** Pure referral rules. Storage lives in src/lib/referrals.ts. */

export const REFERRAL_BONUS_TRIAL_DAYS = 30;
export const REFERRAL_CREDIT_MONTHS = 1;
export const REFERRAL_CREDIT_EXPIRY_DAYS = 365;
export const REFERRAL_COOKIE = "bs_ref";
export const REFERRAL_COOKIE_DAYS = 60;

export type ReferralStatus = "pending" | "earned" | "redeemed" | "void";

export type Referral = {
  id: string;
  code: string;
  referrerEmail: string;
  referredEmail: string;
  createdAt: string;
  status: ReferralStatus;
  earnedAt?: string;
  expiresAt?: string;
  redeemedAt?: string;
  note?: string;
};

export type ReferralCode = { email: string; code: string; createdAt: string };

export type ReferralDoc = { codes: ReferralCode[]; referrals: Referral[] };

export function emptyReferralDoc(): ReferralDoc {
  return { codes: [], referrals: [] };
}

const CODE_PATTERN = /^[A-Z0-9]{6,12}$/;

export function normalizeReferralCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return CODE_PATTERN.test(code) ? code : null;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeReferralCode(random: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < 8; i += 1) out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return out;
}

/**
 * A referral counts only for a brand-new client who is not the referrer
 * and has not been referred before.
 */
export function referralEligibility(input: {
  doc: ReferralDoc;
  code: string;
  referredEmail: string;
  referredIsNewClient: boolean;
}): { ok: true; referrerEmail: string } | { ok: false; reason: string } {
  const owner = input.doc.codes.find((item) => item.code === input.code);
  if (!owner) return { ok: false, reason: "Unknown code." };
  const referred = input.referredEmail.trim().toLowerCase();
  if (owner.email === referred) return { ok: false, reason: "Self-referral." };
  if (sameDomainSelf(owner.email, referred)) return { ok: false, reason: "Self-referral." };
  if (!input.referredIsNewClient) return { ok: false, reason: "Already a client." };
  if (input.doc.referrals.some((item) => item.referredEmail === referred)) return { ok: false, reason: "Already referred." };
  return { ok: true, referrerEmail: owner.email };
}

/** Same private business domain counts as self-referral; public mail domains do not. */
function sameDomainSelf(a: string, b: string) {
  const da = a.split("@")[1] || "";
  const db = b.split("@")[1] || "";
  const publicDomains = new Set(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "live.com", "proton.me", "protonmail.com", "ymail.com"]);
  return Boolean(da) && da === db && !publicDomains.has(da);
}

/** Pending becomes earned only after the referred client's first paid month. */
export function settleReferral(referral: Referral, now: Date): Referral {
  if (referral.status !== "pending") return referral;
  const expires = new Date(now.getTime() + REFERRAL_CREDIT_EXPIRY_DAYS * 86_400_000);
  return { ...referral, status: "earned", earnedAt: now.toISOString(), expiresAt: expires.toISOString() };
}

export function creditIsLive(referral: Referral, now: Date) {
  return referral.status === "earned" && (!referral.expiresAt || Date.parse(referral.expiresAt) > now.getTime());
}

export function referralSummary(doc: ReferralDoc, email: string, now: Date) {
  const mine = doc.referrals.filter((item) => item.referrerEmail === email);
  return {
    pending: mine.filter((item) => item.status === "pending").length,
    earned: mine.filter((item) => creditIsLive(item, now)).length,
    redeemed: mine.filter((item) => item.status === "redeemed").length,
    expired: mine.filter((item) => item.status === "earned" && !creditIsLive(item, now)).length,
  };
}
