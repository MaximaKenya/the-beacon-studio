import { siteConfig } from "@/data/site";
import { mutateJsonFile } from "@/lib/storage";
import { formatKes, formatUsd, kesForCharge, usdToKesRate } from "@/lib/fx";
import { computeCheckoutAmount, getDepositPercent } from "@/lib/payments";
import { beaconPaystackMetadata, beaconPaystackReference, isPaystackConfigured } from "@/lib/paystack";

export const BOOKING_DEPOSIT_TIER = "automation-pilot";

export function bookingDepositEnabled(): boolean {
  return isPaystackConfigured();
}

export type BookingDepositOffer = {
  enabled: true;
  tierId: string;
  tierName: string;
  percent: number;
  usd: number;
  kes: number;
  app: "beacon";
  summary: string;
};

/** Public copy for the optional step. Null unless PAYSTACK_SECRET_KEY is set. */
export function bookingDepositOffer(): BookingDepositOffer | null {
  if (!bookingDepositEnabled()) return null;
  const computed = computeCheckoutAmount(BOOKING_DEPOSIT_TIER, "deposit");
  if (!computed) return null;
  const percent = getDepositPercent();
  const kes = kesForCharge({
    usdFloor: computed.tier.fromAmount,
    usdCharge: computed.amountMajor,
    kesFloor: computed.tier.kesAmount,
    rate: usdToKesRate(),
  });
  return {
    enabled: true,
    tierId: computed.tier.id,
    tierName: computed.tier.name,
    percent,
    usd: computed.amountMajor,
    kes,
    app: "beacon",
    summary: `The audit stays free. A ${percent}% ${computed.tier.name} deposit is ${formatUsd(computed.amountMajor)} (about ${formatKes(kes)}). Paystack takes M-Pesa or card. Skip this if you only want the call.`,
  };
}

export function bookingDepositMetadata(bookingId: string, paymentId: string): Record<string, unknown> {
  return beaconPaystackMetadata(
    {
      paymentId,
      bookingId,
      mode: "deposit",
      tierId: BOOKING_DEPOSIT_TIER,
      studio: siteConfig.brand.name,
    },
    "beacon"
  );
}

export function bookingDepositReference(paymentId: string): string {
  return beaconPaystackReference(paymentId);
}

export async function markBookingDeposit(bookingId: string, reference: string): Promise<void> {
  await mutateJsonFile<Array<Record<string, unknown>>>("bookings.json", [], (rows) => {
    const row = rows.find((item) => item.id === bookingId);
    if (!row) return rows;
    row.depositStatus = "paid";
    row.depositReference = reference;
    row.depositPaidAt = new Date().toISOString();
    return rows;
  });
}
