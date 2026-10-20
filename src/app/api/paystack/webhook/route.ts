import { NextResponse } from "next/server";
import { applyPaystackData, paystackSecret, verifyPaystackReference, verifyPaystackSignature } from "@/lib/paystack";

export const runtime = "nodejs";

/**
 * Paystack signs the raw body with HMAC SHA512 using PAYSTACK_SECRET_KEY.
 * Header: x-paystack-signature.
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

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(raw) as { event?: string; data?: { reference?: string; status?: string } };
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      const verified = await verifyPaystackReference(event.data.reference);
      if (!verified && event.data.status === "success") {
        await applyPaystackData(event.data);
      }
    } catch (error) {
      console.error("[paystack/webhook]", error instanceof Error ? error.message : "apply failed");
      return NextResponse.json({ error: "Could not record payment" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
