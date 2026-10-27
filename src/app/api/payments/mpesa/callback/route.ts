import { NextResponse } from "next/server";
import { listPayments, updatePaymentByCheckoutId } from "@/lib/payments";
import { safeEqual } from "@/lib/admin-auth";
import { parseRequestJson } from "@/lib/storage";
import { createReceiptFromPayment } from "@/lib/documents";

export const runtime = "nodejs";

/**
 * POST /api/payments/mpesa/callback
 * Daraja STK callback — set MPESA_CALLBACK_URL to this absolute URL.
 * Body shape: { Body: { stkCallback: { CheckoutRequestID, ResultCode, ... } } }
 * If MPESA_CALLBACK_TOKEN is set, the callback URL must carry ?token=<it>.
 * Only pending payments change, so a replay cannot flip a settled one.
 */
export async function POST(request: Request) {
  const expected = process.env.MPESA_CALLBACK_TOKEN?.trim();
  if (expected && !safeEqual(new URL(request.url).searchParams.get("token") || "", expected)) {
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Rejected" }, { status: 401 });
  }
  try {
    const body = await parseRequestJson(request);
    const stk =
      (body.Body as { stkCallback?: Record<string, unknown> } | undefined)?.stkCallback ??
      (body.stkCallback as Record<string, unknown> | undefined) ??
      body;

    const checkoutRequestID =
      typeof stk.CheckoutRequestID === "string" ? stk.CheckoutRequestID : "";
    const resultCode = stk.ResultCode as string | number | undefined;
    const resultDesc =
      typeof stk.ResultDesc === "string" ? stk.ResultDesc : undefined;

    let receipt: string | undefined;
    const metadata = stk.CallbackMetadata as
      | { Item?: { Name?: string; Value?: string | number }[] }
      | undefined;
    const items = metadata?.Item ?? [];
    for (const item of items) {
      if (item.Name === "MpesaReceiptNumber" && item.Value != null) {
        receipt = String(item.Value);
      }
    }

    const current = checkoutRequestID ? (await listPayments()).find((p) => p.checkoutRequestID === checkoutRequestID) : undefined;
    if (checkoutRequestID && current?.status === "pending") {
      const success = resultCode === 0 || resultCode === "0";
      const payment = await updatePaymentByCheckoutId(checkoutRequestID, {
        status: success ? "success" : "failed",
        resultCode,
        resultDesc,
        receipt,
        raw: stk,
        read: false,
      });
      if (success && payment) {
        await createReceiptFromPayment({ payment });
      }
    }

    // Daraja expects a success ack regardless
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
