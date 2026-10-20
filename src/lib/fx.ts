/** USD → KES rate shared by Paystack checkout display and Daraja STK. */
export function usdToKesRate(): number {
  const raw = process.env.PAYSTACK_USD_KES_RATE || process.env.MPESA_KES_RATE || "130";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 130;
}

export function kesFromUsd(usd: number, rate = usdToKesRate()): number {
  return Math.max(1, Math.round(usd * rate));
}
