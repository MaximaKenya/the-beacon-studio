/** Fallback when PAYSTACK_USD_KES_RATE is unset. */
export const DEFAULT_USD_KES_RATE = 130;

/** USD → KES rate shared by Paystack checkout display. */
export function usdToKesRate(): number {
  const raw = process.env.PAYSTACK_USD_KES_RATE || String(DEFAULT_USD_KES_RATE);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_USD_KES_RATE;
}

export function kesFromUsd(usd: number, rate = usdToKesRate()): number {
  return Math.max(1, Math.round(usd * rate));
}

/** Whole shillings for a USD charge. KES-priced tiers scale `kesFloor` so KES 25,000 stays KES 25,000. */
export function kesForCharge(input: {
  usdFloor: number;
  usdCharge: number;
  kesFloor?: number;
  rate?: number;
}): number {
  const { usdFloor, usdCharge, kesFloor } = input;
  if (kesFloor && kesFloor > 0 && usdFloor > 0) {
    return Math.max(1, Math.round((kesFloor * usdCharge) / usdFloor));
  }
  return kesFromUsd(usdCharge, input.rate);
}

export function formatUsd(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
}

export function formatKes(amount: number): string {
  return `KES ${Math.round(amount).toLocaleString("en-KE")}`;
}

/** Both currencies for a published tier. KES-priced tiers lead with shillings. */
export function describeTierMoney(
  tier: { fromPrice: string; fromAmount: number; kesAmount?: number },
  rate = usdToKesRate()
): string {
  if (tier.fromAmount <= 0) return tier.fromPrice;
  const kes = tier.kesAmount && tier.kesAmount > 0 ? tier.kesAmount : Math.round(tier.fromAmount * rate);
  if (tier.kesAmount) return `${formatKes(kes)} (about ${formatUsd(tier.fromAmount)})`;
  return `${formatUsd(tier.fromAmount)} (about ${formatKes(kes)})`;
}
