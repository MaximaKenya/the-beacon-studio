import { NextResponse } from "next/server";
import { fulfillAutomationPayment } from "@/lib/automations/runtime";
import { verifyPaystackReference } from "@/lib/paystack";

export const runtime = "nodejs";

/** Paystack redirects here after checkout. The transaction is verified before we show paid. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") || url.searchParams.get("trxref") || "";
  let paid = false;
  if (reference) {
    try {
      const payment = await verifyPaystackReference(reference);
      paid = payment?.status === "success";
      if (payment?.automationInstanceIds?.length) {
        if (paid) await fulfillAutomationPayment(payment, url.origin);
        const email = payment.payerEmail ? `&email=${encodeURIComponent(payment.payerEmail)}` : "";
        return NextResponse.redirect(`${url.origin}/automations/started?${paid ? "paid=1" : "canceled=1"}${email}`);
      }
    } catch (error) {
      console.error("[paystack/callback]", error instanceof Error ? error.message : "verify failed");
    }
  }
  return NextResponse.redirect(`${url.origin}/?${paid ? "paid=1" : "canceled=1"}#pricing`);
}
