import { NextResponse } from "next/server";
import { siteConfig } from "@/data/site";
import { parseRequestJson } from "@/lib/storage";
import { computeCheckoutAmount, createPayment, updatePaymentById } from "@/lib/payments";
import { getMpesaConfig, normalizeMpesaPhone, stkPush } from "@/lib/mpesa";

export const runtime = "nodejs";

/**
 * POST /api/payments/mpesa/stk
 * Body: { tierId, mode?: "deposit"|"invoice", phone: string }
 * Triggers Daraja STK Push for the deposit (30%) or invoice amount in KES.
 * Without MPESA_* keys → graceful coming_soon + book/call fallbacks.
 */
export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request);
    const tierId = typeof body.tierId === "string" ? body.tierId : "";
    const mode = body.mode === "invoice" ? "invoice" : "deposit";
    const phoneRaw = typeof body.phone === "string" ? body.phone : "";
    const projectId = typeof body.projectId === "string" ? body.projectId : undefined;

    const computed = computeCheckoutAmount(tierId, mode);
    if (!computed) {
      return NextResponse.json({ error: "Unknown pricing tier." }, { status: 400 });
    }

    const phone = normalizeMpesaPhone(phoneRaw);
    if (!phone) {
      return NextResponse.json(
        {
          error:
            "Enter a valid Kenyan mobile (e.g. 07XXXXXXXX or 2547XXXXXXXX).",
        },
        { status: 400 }
      );
    }

    const config = getMpesaConfig();
    if (!config) {
      return NextResponse.json({
        ok: false,
        status: "coming_soon",
        message: siteConfig.payments.mpesaComingSoonMessage,
        fallbacks: {
          mailto: `mailto:${siteConfig.email}?subject=${encodeURIComponent(
            `M-Pesa deposit — ${computed.tier.name}`
          )}`,
          book: "#book",
          phone: `tel:${siteConfig.phone.replace(/\s+/g, "")}`,
        },
      });
    }

    // USD floor → approximate KES for STK (sandbox often uses small amounts).
    // Prefer MPESA_KES_RATE env; default 130 for rough USD→KES.
    const rate = Number(process.env.MPESA_KES_RATE || "130") || 130;
    const amountKes = Math.max(1, Math.round(computed.amountMajor * rate));

    const payment = await createPayment({
      provider: "mpesa",
      status: "pending",
      mode,
      tierId: computed.tier.id,
      tierName: computed.tier.name,
      amount: amountKes,
      currency: "KES",
      depositPercent: mode === "deposit" ? computed.depositPercent : 100,
      phone,
      ...(projectId ? { projectId } : {}),
    });

    try {
      const result = await stkPush({
        config,
        amountKes,
        phone,
        accountReference: `Beacon${computed.tier.id.slice(0, 6)}`,
        transactionDesc: mode === "deposit" ? "BeaconDeposit" : "BeaconInvoice",
      });

      if (!result.CheckoutRequestID || result.ResponseCode !== "0") {
        await updatePaymentById(payment.id, {
          status: "failed",
          resultCode: result.ResponseCode ?? result.errorCode,
          resultDesc: result.ResponseDescription || result.errorMessage || "STK failed",
          raw: result as unknown as Record<string, unknown>,
        });
        return NextResponse.json(
          {
            ok: false,
            status: "mpesa_error",
            message:
              result.ResponseDescription ||
              result.errorMessage ||
              "M-Pesa STK Push failed. Try again or book a call.",
            fallbacks: {
              mailto: `mailto:${siteConfig.email}`,
              book: "#book",
            },
          },
          { status: 502 }
        );
      }

      await updatePaymentById(payment.id, {
        checkoutRequestID: result.CheckoutRequestID,
        merchantRequestID: result.MerchantRequestID,
        resultDesc: result.CustomerMessage,
        raw: result as unknown as Record<string, unknown>,
      });

      return NextResponse.json({
        ok: true,
        status: "pending",
        message:
          result.CustomerMessage ||
          "Check your phone and enter your M-Pesa PIN to complete payment.",
        paymentId: payment.id,
        checkoutRequestID: result.CheckoutRequestID,
        amountKes,
        depositPercent: mode === "deposit" ? computed.depositPercent : 100,
      });
    } catch (err) {
      await updatePaymentById(payment.id, {
        status: "failed",
        resultDesc: err instanceof Error ? err.message : "STK error",
      });
      return NextResponse.json(
        {
          ok: false,
          status: "mpesa_error",
          message:
            err instanceof Error
              ? err.message
              : "M-Pesa request failed. Book a call or try Stripe.",
          fallbacks: {
            mailto: `mailto:${siteConfig.email}`,
            book: "#book",
          },
        },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json({ error: "M-Pesa STK failed." }, { status: 500 });
  }
}
