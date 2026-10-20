import { siteConfig, type CatalogTemplate } from "@/data/site";

export type BillingInterval = "monthly" | "annual";

export type QuoteLine = {
  id: string;
  name: string;
  monthlyKes: number;
  monthlyUsd: number;
  setupKes: number;
  setupUsd: number;
};

export type BundleQuote = {
  items: QuoteLine[];
  count: number;
  listMonthlyKes: number;
  listMonthlyUsd: number;
  setupKes: number;
  setupUsd: number;
  bundlePercent: number;
  bundleLabel: string | null;
  annualPercent: number;
  billing: BillingInterval;
  recurringMonthlyKes: number;
  recurringMonthlyUsd: number;
  dueKes: number;
  dueUsd: number;
  included: string[];
};

function catalogItem(id: string): CatalogTemplate | undefined {
  return siteConfig.automationCatalog.templates.find((item) => item.id === id);
}

/** Highest bundle tier the selection qualifies for. */
export function bundleTier(count: number): { percent: number; label: string } | null {
  const tiers = [...siteConfig.automationCatalog.bundleDiscounts].sort((a, b) => b.minItems - a.minItems);
  return tiers.find((tier) => count >= tier.minItems) ?? null;
}

function applyPercent(amount: number, percent: number): number {
  return Math.max(0, Math.round(amount * (1 - percent / 100)));
}

/** Server and the buffet use this so the charged total matches the calculator. */
export function quoteBundle(
  ids: string[],
  options: { billing: BillingInterval; includeSetup: boolean }
): BundleQuote | null {
  const unique = [...new Set(ids)];
  const items: QuoteLine[] = [];
  for (const id of unique) {
    const item = catalogItem(id);
    if (!item) return null;
    items.push({
      id: item.id,
      name: item.name,
      monthlyKes: item.priceKes,
      monthlyUsd: item.priceUsd,
      setupKes: options.includeSetup ? item.setupFeeKes : 0,
      setupUsd: options.includeSetup ? item.setupFeeUsd : 0,
    });
  }

  const listMonthlyKes = items.reduce((sum, item) => sum + item.monthlyKes, 0);
  const listMonthlyUsd = items.reduce((sum, item) => sum + item.monthlyUsd, 0);
  const setupKes = items.reduce((sum, item) => sum + item.setupKes, 0);
  const setupUsd = items.reduce((sum, item) => sum + item.setupUsd, 0);
  const tier = bundleTier(items.length);
  const bundlePercent = tier?.percent ?? 0;
  const annualPercent = options.billing === "annual" ? siteConfig.automationCatalog.annualDiscountPercent : 0;
  const afterBundleKes = applyPercent(listMonthlyKes, bundlePercent);
  const afterBundleUsd = applyPercent(listMonthlyUsd, bundlePercent);
  const recurringMonthlyKes = applyPercent(afterBundleKes, annualPercent);
  const recurringMonthlyUsd = applyPercent(afterBundleUsd, annualPercent);
  const months = options.billing === "annual" ? 12 : 1;
  const dueKes = recurringMonthlyKes * months + setupKes;
  const dueUsd = recurringMonthlyUsd * months + setupUsd;

  return {
    items,
    count: items.length,
    listMonthlyKes,
    listMonthlyUsd,
    setupKes,
    setupUsd,
    bundlePercent,
    bundleLabel: tier?.label ?? null,
    annualPercent,
    billing: options.billing,
    recurringMonthlyKes,
    recurringMonthlyUsd,
    dueKes,
    dueUsd,
    included: items.map((item) => item.name),
  };
}

/** Split a discounted monthly total across lines so the shares add up. */
export function allocateMonthly(weights: number[], total: number): number[] {
  const sum = weights.reduce((acc, value) => acc + value, 0);
  if (sum <= 0 || weights.length === 0) return weights.map(() => 0);
  const raw = weights.map((weight) => Math.floor((total * weight) / sum));
  let drift = total - raw.reduce((acc, value) => acc + value, 0);
  for (let index = 0; index < raw.length && drift > 0; index += 1) {
    raw[index] += 1;
    drift -= 1;
  }
  return raw;
}
