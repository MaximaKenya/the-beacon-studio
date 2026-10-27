import { randomUUID } from "crypto";
import { mutateJsonFile, readJsonFile } from "@/lib/storage";
import { publicSiteUrl } from "@/lib/brand-email";
import {
  creditIsLive,
  emptyReferralDoc,
  makeReferralCode,
  normalizeReferralCode,
  REFERRAL_BONUS_TRIAL_DAYS,
  referralEligibility,
  referralSummary,
  settleReferral,
  type ReferralDoc,
} from "@/lib/referral-rules";

const FILE = "referrals.json";

function normalize(doc: Partial<ReferralDoc> | null | undefined): ReferralDoc {
  return { codes: Array.isArray(doc?.codes) ? doc!.codes : [], referrals: Array.isArray(doc?.referrals) ? doc!.referrals : [] };
}

export async function loadReferrals(): Promise<ReferralDoc> {
  return normalize(await readJsonFile<ReferralDoc>(FILE, emptyReferralDoc()));
}

export function referralLink(code: string) {
  return `${publicSiteUrl()}/automations?ref=${code}`;
}

export async function referralCodeFor(email: string): Promise<string> {
  const target = email.trim().toLowerCase();
  let code = "";
  await mutateJsonFile<ReferralDoc>(FILE, emptyReferralDoc(), (raw) => {
    const doc = normalize(raw);
    const existing = doc.codes.find((item) => item.email === target);
    if (existing) {
      code = existing.code;
      return doc;
    }
    do code = makeReferralCode();
    while (doc.codes.some((item) => item.code === code));
    doc.codes.push({ email: target, code, createdAt: new Date().toISOString() });
    return doc;
  });
  return code;
}

/** Records a pending referral. Returns the bonus trial days for the new client, or 0. */
export async function recordReferralSignup(input: { code: unknown; email: string; isNewClient: boolean }): Promise<number> {
  const code = normalizeReferralCode(input.code);
  if (!code) return 0;
  const email = input.email.trim().toLowerCase();
  let bonus = 0;
  await mutateJsonFile<ReferralDoc>(FILE, emptyReferralDoc(), (raw) => {
    const doc = normalize(raw);
    const check = referralEligibility({ doc, code, referredEmail: email, referredIsNewClient: input.isNewClient });
    if (!check.ok) return doc;
    doc.referrals.push({ id: randomUUID(), code, referrerEmail: check.referrerEmail, referredEmail: email, createdAt: new Date().toISOString(), status: "pending" });
    bonus = REFERRAL_BONUS_TRIAL_DAYS;
    return doc;
  });
  return bonus;
}

/** Call after a referred client's first paid month is confirmed. Idempotent. */
export async function settleReferralsForPayment(email: string, now = new Date()) {
  const target = email.trim().toLowerCase();
  let earned = 0;
  await mutateJsonFile<ReferralDoc>(FILE, emptyReferralDoc(), (raw) => {
    const doc = normalize(raw);
    doc.referrals = doc.referrals.map((item) => {
      if (item.referredEmail !== target || item.status !== "pending") return item;
      earned += 1;
      return settleReferral(item, now);
    });
    return doc;
  });
  return earned;
}

export async function markReferralRedeemed(id: string) {
  let ok = false;
  await mutateJsonFile<ReferralDoc>(FILE, emptyReferralDoc(), (raw) => {
    const doc = normalize(raw);
    const item = doc.referrals.find((entry) => entry.id === id);
    if (item && creditIsLive(item, new Date())) {
      item.status = "redeemed";
      item.redeemedAt = new Date().toISOString();
      ok = true;
    }
    return doc;
  });
  return ok ? { ok: true, message: "Credit marked as used." } : { ok: false, message: "No live credit to use." };
}

export async function portalReferral(email: string) {
  const code = await referralCodeFor(email);
  const doc = await loadReferrals();
  return { code, link: referralLink(code), ...referralSummary(doc, email.trim().toLowerCase(), new Date()) };
}

export async function adminReferrals() {
  const doc = await loadReferrals();
  const now = new Date();
  return doc.referrals
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 100)
    .map((item) => ({ ...item, live: creditIsLive(item, now) }));
}
