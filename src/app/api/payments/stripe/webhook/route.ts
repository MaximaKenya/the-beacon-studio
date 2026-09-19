import { NextResponse } from "next/server";
import { updatePaymentById, updatePaymentByCheckoutId, listPayments } from "@/lib/payments";
import { createReceiptFromPayment } from "@/lib/documents";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * Stripe webhook (checkout.session.completed) OR manual confirm:
 * POST { sessionId } | { paymentId } | raw Stripe event body
 */
export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request);

    // Stripe event shape
    const type = typeof body.type === "string" ? body.type : "";
    const session =
      (body.data as { object?: Record<string, unknown> } | undefined)?.object ?? body;

    const sessionId =
      (typeof session.id === "string" ? session.id : "") ||
      (typeof body.sessionId === "string" ? body.sessionId : "");
    const paymentIdMeta =
      typeof (session.metadata as { paymentId?: string } | undefined)?.paymentId === "string"
        ? (session.metadata as { paymentId: string }).paymentId
        : typeof body.paymentId === "string"
          ? body.paymentId
          : "";

    if (type && type !== "checkout.session.completed" && !body.paymentId && !body.sessionId) {
      return NextResponse.json({ received: true, ignored: type });
    }

    let payment = null;
    if (paymentIdMeta) {
      payment = await updatePaymentById(paymentIdMeta, {
        status: "success",
        receipt: sessionId || paymentIdMeta.slice(0, 8).toUpperCase(),
        checkoutRequestID: sessionId || undefined,
        read: false,
      });
    } else if (sessionId) {
      payment = await updatePaymentByCheckoutId(sessionId, {
        status: "success",
        receipt: sessionId.slice(-12).toUpperCase(),
        read: false,
      });
    }

    if (!payment && paymentIdMeta) {
      const all = await listPayments();
      payment = all.find((p) => p.id === paymentIdMeta) ?? null;
    }

    if (payment && payment.status === "success") {
      const receipt = await createReceiptFromPayment({ payment });
      return NextResponse.json({ ok: true, payment, receipt });
    }

    return NextResponse.json({
      ok: false,
      message: "Payment not found or not marked success.",
    }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}
