import { carePlans, foundersLock, partnerTiers, proAddons, siteConfig, whatsappAddon, type CarePlan } from "@/data/site";

export type MessageKind = "marketing" | "utility";

export function annualDiscountPercent(): number {
  return siteConfig.automationCatalog.annualDiscountPercent;
}

/** Monthly price when paid annually, and the yearly saving. Rounded to whole units. */
export function annualPrice(monthly: number, percent = annualDiscountPercent()) {
  const perMonth = Math.round(monthly * (1 - percent / 100));
  return { perMonth, perYear: perMonth * 12, savingPerYear: Math.max(0, (monthly - perMonth) * 12), percent };
}

export function carePlanById(id: unknown): CarePlan | undefined {
  return typeof id === "string" ? carePlans.find((plan) => plan.id === id) : undefined;
}

export function proAddonById(id: unknown) {
  return typeof id === "string" ? proAddons.find((item) => item.id === id) : undefined;
}

export function whatsappTierById(id: unknown) {
  return typeof id === "string" ? whatsappAddon.tiers.find((tier) => tier.id === id) : undefined;
}

/** Price per extra message: Meta cost basis plus markup, rounded to 2 decimals. */
export function whatsappUnitKes(kind: MessageKind, markupPercent = whatsappAddon.markupPercent): number {
  const cost = whatsappAddon.costBasisKes[kind];
  return Math.round(cost * (1 + markupPercent / 100) * 100) / 100;
}

/** Monthly bill for a tier given message counts. Overage is charged per message above the allowance. */
export function whatsappBill(tierId: string, used: { marketing: number; utility: number }, markupPercent = whatsappAddon.markupPercent) {
  const tier = whatsappTierById(tierId);
  if (!tier) return null;
  const extraMarketing = Math.max(0, Math.floor(used.marketing) - tier.marketingIncluded);
  const extraUtility = Math.max(0, Math.floor(used.utility) - tier.utilityIncluded);
  const overageKes = Math.round((extraMarketing * whatsappUnitKes("marketing", markupPercent) + extraUtility * whatsappUnitKes("utility", markupPercent)) * 100) / 100;
  return { tier, extraMarketing, extraUtility, overageKes, totalKes: Math.round((tier.monthlyKes + overageKes) * 100) / 100 };
}

/** Partner tier a reseller qualifies for by active client count. */
export function partnerTierFor(clients: number) {
  return [...partnerTiers].sort((a, b) => b.minClients - a.minClients).find((tier) => clients >= tier.minClients) ?? null;
}

export function wholesalePrice(listPrice: number, discountPercent: number): number {
  return Math.round(listPrice * (1 - Math.min(100, Math.max(0, discountPercent)) / 100));
}

export type FoundersLock = { lockedAt: string; until: string; note?: string };

export function makeFoundersLock(now = new Date(), months = foundersLock.months, note?: string): FoundersLock {
  const until = new Date(now);
  until.setUTCMonth(until.getUTCMonth() + months);
  return { lockedAt: now.toISOString(), until: until.toISOString(), ...(note ? { note: note.slice(0, 200) } : {}) };
}

export function foundersLockActive(lock: FoundersLock | null | undefined, now = new Date()): boolean {
  return Boolean(lock && new Date(lock.until).getTime() > now.getTime());
}
