import { NextResponse } from "next/server";
import { siteConfig } from "@/data/site";
import { usdToKesRate } from "@/lib/fx";
import { getMpesaConfig } from "@/lib/mpesa";
import { isPaystackConfigured, isStripeConfigured } from "@/lib/paystack";

export const runtime = "nodejs";

/** Which checkout methods are live. No secrets. */
export async function GET() {
  const depositPercent = siteConfig.payments.depositPercent ?? siteConfig.payments.defaultDepositPercent ?? 30;
  return NextResponse.json({
    paystack: isPaystackConfigured(),
    stripe: isStripeConfigured(),
    mpesa: Boolean(getMpesaConfig()),
    bankTransfer: true,
    usdKesRate: usdToKesRate(),
    depositPercent,
    currency: siteConfig.payments.currency,
  });
}
