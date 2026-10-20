import { NextResponse } from "next/server";
import { initializePaystackCheckout, type PaystackCurrency } from "@/lib/paystack";
import { parseRequestJson } from "@/lib/storage";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request);
    const tierId = typeof body.tierId === "string" ? body.tierId : "";
    const mode = body.mode === "invoice" ? "invoice" : "deposit";
    const currency: PaystackCurrency = body.currency === "USD" ? "USD" : "KES";
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const projectId = typeof body.projectId === "string" ? body.projectId : undefined;

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, message: "Enter the email address for the receipt." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const result = await initializePaystackCheckout({
      tierId,
      mode,
      currency,
      email,
      ...(name ? { name } : {}),
      ...(projectId ? { projectId } : {}),
      callbackUrl: `${origin}/api/paystack/callback`,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: result.status === 200 ? 200 : result.status });
    }

    return NextResponse.json({
      ok: true,
      url: result.authorizationUrl,
      reference: result.reference,
      paymentId: result.paymentId,
      amount: result.amountMajor,
      currency: result.currency,
      kes: result.kes,
      usd: result.usd,
    });
  } catch (error) {
    console.error("[paystack/initialize]", error instanceof Error ? error.message : "failed");
    return NextResponse.json({ ok: false, message: "Checkout failed." }, { status: 500 });
  }
}
