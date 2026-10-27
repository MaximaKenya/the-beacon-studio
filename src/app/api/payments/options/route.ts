import { NextResponse } from "next/server";
import { siteConfig } from "@/data/site";
import { usdToKesRate } from "@/lib/fx";
import { bookingDepositOffer } from "@/lib/booking-deposit";
import { isPaystackConfigured } from "@/lib/paystack";

export const runtime = "nodejs";

/** Which checkout methods are live. No secrets. */
export async function GET() {
  const depositPercent = siteConfig.payments.depositPercent ?? siteConfig.payments.defaultDepositPercent ?? 30;
  return NextResponse.json({
    paystack: isPaystackConfigured(),
    bankTransfer: true,
    usdKesRate: usdToKesRate(),
    depositPercent,
    currency: siteConfig.payments.currency,
    bookingDeposit: bookingDepositOffer(),
  });
}
