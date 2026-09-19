import { NextResponse } from "next/server";
import { siteConfig } from "@/data/site";
import { parseRequestJson } from "@/lib/storage";
import { computeCheckoutAmount, createPayment, updatePaymentById } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * Stripe Checkout — deposit amount only when mode=deposit (30% of tier floor).
 * When STRIPE_SECRET_KEY unset → coming_soon + mailto / book fallbacks.
 */
export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request);
    const tierId = typeof body.tierId === "string" ? body.tierId : "";
    const mode = body.mode === "invoice" ? "invoice" : "deposit";
    const projectId = typeof body.projectId === "string" ? body.projectId : undefined;
    const computed = computeCheckoutAmount(tierId, mode);

    if (!computed) {
      return NextResponse.json({ error: "Unknown pricing tier." }, { status: 400 });
    }

    const { tier, amountMinor, depositPercent } = computed;

    const origin = new URL(request.url).origin;
    const successUrl =
      typeof body.successUrl === "string" && body.successUrl.startsWith("http")
        ? body.successUrl
        : `${origin}/#pricing?paid=1`;
    const cancelUrl =
      typeof body.cancelUrl === "string" && body.cancelUrl.startsWith("http")
        ? body.cancelUrl
        : `${origin}/#pricing?canceled=1`;

    const secret = process.env.STRIPE_SECRET_KEY?.trim();
    const priceEnvKey = tier.stripePriceEnv ?? "";
    const priceId = priceEnvKey ? process.env[priceEnvKey]?.trim() : undefined;

    if (!secret) {
      return NextResponse.json({
        ok: false,
        status: "coming_soon",
        message: siteConfig.payments.comingSoonMessage,
        currency: siteConfig.payments.currency,
        currencyNote: siteConfig.payments.currencyNote,
        depositPercent: mode === "deposit" ? depositPercent : 100,
        amountPreview: computed.amountMajor,
        fallbacks: {
          mailto: `mailto:${siteConfig.email}?subject=${encodeURIComponent(
            `${mode === "deposit" ? "Deposit" : "Invoice"} — ${tier.name}`
          )}&body=${encodeURIComponent(
            `Hi Beacon,\n\nI'd like to ${mode === "deposit" ? "pay a deposit" : "pay an invoice"} for the ${tier.name} tier (${tier.fromPrice}${mode === "deposit" ? ` · ${depositPercent}% deposit` : ""}).\n\nThanks!`
          )}`,
          book: "#book",
          phone: `tel:${siteConfig.phone.replace(/\s+/g, "")}`,
        },
      });
    }

    const payment = await createPayment({
      provider: "stripe",
      status: "pending",
      mode,
      tierId: tier.id,
      tierName: tier.name,
      amount: amountMinor,
      currency: "USD",
      depositPercent: mode === "deposit" ? depositPercent : 100,
      ...(projectId ? { projectId } : {}),
    });

    const label =
      mode === "deposit"
        ? `${siteConfig.brand.name} — ${tier.name} deposit (${depositPercent}%)`
        : `${siteConfig.brand.name} — ${tier.name} invoice`;

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", successUrl);
    params.set("cancel_url", cancelUrl);
    params.set("client_reference_id", payment.id);
    params.set("metadata[tierId]", tier.id);
    params.set("metadata[mode]", mode);
    params.set("metadata[paymentId]", payment.id);
    params.set("metadata[depositPercent]", String(depositPercent));
    params.set("metadata[studio]", siteConfig.brand.name);
    if (projectId) params.set("metadata[projectId]", projectId);

    // Always charge deposit/invoice amount from our calculator.
    // Configured Price IDs should match depositPercent × floor in Stripe Dashboard.
    if (priceId && mode === "deposit") {
      params.set("line_items[0][price]", priceId);
      params.set("line_items[0][quantity]", "1");
    } else {
      params.set("line_items[0][price_data][currency]", "usd");
      params.set("line_items[0][price_data][unit_amount]", String(amountMinor));
      params.set("line_items[0][price_data][product_data][name]", label);
      params.set(
        "line_items[0][price_data][product_data][description]",
        siteConfig.payments.currencyNote
      );
      params.set("line_items[0][quantity]", "1");
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = (await stripeRes.json()) as {
      id?: string;
      url?: string;
      error?: { message?: string };
    };

    if (!stripeRes.ok || !session.url) {
      await updatePaymentById(payment.id, {
        status: "failed",
        resultDesc: session.error?.message ?? "Stripe Checkout failed.",
      });
      return NextResponse.json(
        {
          ok: false,
          status: "stripe_error",
          message: session.error?.message ?? "Stripe Checkout failed.",
          fallbacks: {
            mailto: `mailto:${siteConfig.email}`,
            book: "#book",
          },
        },
        { status: 502 }
      );
    }

    await updatePaymentById(payment.id, {
      checkoutRequestID: session.id,
      raw: { sessionId: session.id },
    });

    return NextResponse.json({
      ok: true,
      status: "ready",
      url: session.url,
      sessionId: session.id,
      paymentId: payment.id,
      depositPercent: mode === "deposit" ? depositPercent : 100,
      amount: computed.amountMajor,
    });
  } catch {
    return NextResponse.json({ error: "Checkout failed." }, { status: 500 });
  }
}
