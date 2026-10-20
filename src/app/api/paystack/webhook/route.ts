import { after, NextResponse } from "next/server";
import { fulfillAutomationPayment } from "@/lib/automations/runtime";
import { applyPaystackData, paystackSecret, verifyPaystackReference, verifyPaystackSignature } from "@/lib/paystack";
import { forwardPaystackEvent, routePaystackEvent } from "@/lib/paystack-router";

export const runtime = "nodejs";

/**
 * Company Paystack router.
 * Verifies x-paystack-signature (HMAC SHA512 of the raw body with PAYSTACK_SECRET_KEY),
 * then keeps BS- / app=beacon-studio here and forwards every other product.
 */
export async function POST(request: Request) {
  if (!paystackSecret()) {
    return NextResponse.json({ error: "Paystack not configured" }, { status: 503 });
  }
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string; metadata?: unknown } };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const decision = routePaystackEvent(event);
  const origin = new URL(request.url).origin;

  if (!decision) {
    console.warn("[paystack/router] unrouted", { reference: event.data?.reference || "", event: event.event });
    return NextResponse.json({ ok: true, routed: "unrouted" });
  }

  console.log("[paystack/router] received", {
    event: event.event,
    reference: decision.reference,
    app: decision.route.app,
    local: decision.route.local,
    legacy: decision.legacy,
  });

  if (!decision.route.local) {
    const signatureHeader = signature || "";
    const route = decision.route;
    const reference = decision.reference;
    after(() => {
      void forwardPaystackEvent(raw, signatureHeader, route, reference);
    });
    return NextResponse.json({ ok: true, routed: decision.route.app });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      const verified = await verifyPaystackReference(event.data.reference);
      const payment = verified || (event.data.status === "success" ? await applyPaystackData(event.data) : null);
      if (payment) await fulfillAutomationPayment(payment, origin);
    } catch (error) {
      console.error("[paystack/router] local apply failed", error instanceof Error ? error.message : "apply failed");
      return NextResponse.json({ error: "Could not record payment" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, routed: "beacon-studio" });
}
