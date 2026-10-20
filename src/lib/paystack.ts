import { createHmac, timingSafeEqual } from "crypto";
import { siteConfig } from "@/data/site";
import { kesFromUsd, usdToKesRate } from "@/lib/fx";
import {
  computeCheckoutAmount,
  createPayment,
  updatePaymentByCheckoutId,
  updatePaymentById,
  type PaymentRecord,
} from "@/lib/payments";

export type PaystackCurrency = "KES" | "USD";

export function paystackSecret(): string {
  return process.env.PAYSTACK_SECRET_KEY?.trim() || "";
}

export function isPaystackConfigured(): boolean {
  return Boolean(paystackSecret());
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

type InitializeResult =
  | { ok: true; authorizationUrl: string; reference: string; paymentId: string; amountMajor: number; currency: PaystackCurrency; kes: number; usd: number }
  | { ok: false; status: number; message: string };

export async function initializePaystackCheckout(input: {
  tierId: string;
  mode: "deposit" | "invoice";
  currency: PaystackCurrency;
  email: string;
  name?: string;
  projectId?: string;
  callbackUrl: string;
}): Promise<InitializeResult> {
  const secret = paystackSecret();
  if (!secret) {
    return {
      ok: false,
      status: 200,
      message: "Paystack is not configured yet. Use bank transfer, or ask us to send an invoice.",
    };
  }

  const computed = computeCheckoutAmount(input.tierId, input.mode);
  if (!computed) {
    return { ok: false, status: 400, message: "This tier does not have an online price." };
  }

  const rate = usdToKesRate();
  const kes = kesFromUsd(computed.amountMajor, rate);
  const currency = input.currency === "USD" ? "USD" : "KES";
  const amountMinor = currency === "USD" ? computed.amountMinor : kes * 100;
  const amountMajor = currency === "USD" ? computed.amountMajor : kes;

  const payment = await createPayment({
    provider: "paystack",
    status: "pending",
    mode: input.mode,
    tierId: computed.tier.id,
    tierName: computed.tier.name,
    amount: amountMajor,
    currency,
    depositPercent: input.mode === "deposit" ? computed.depositPercent : 100,
    ...(input.projectId ? { projectId: input.projectId } : {}),
    ...(input.name ? { payerName: input.name } : {}),
    payerEmail: input.email,
    raw: { usd: computed.amountMajor, kes, rate, amountMinor },
  });

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: amountMinor,
      currency,
      reference: payment.id,
      callback_url: input.callbackUrl,
      channels: currency === "KES" ? ["card", "mobile_money"] : ["card"],
      metadata: {
        paymentId: payment.id,
        tierId: computed.tier.id,
        mode: input.mode,
        usd: computed.amountMajor,
        kes,
        ...(input.name ? { payerName: input.name } : {}),
        ...(input.projectId ? { projectId: input.projectId } : {}),
        studio: siteConfig.brand.name,
      },
    }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; reference?: string; access_code?: string };
  };

  if (!response.ok || !body.status || !body.data?.authorization_url) {
    await updatePaymentById(payment.id, {
      status: "failed",
      resultDesc: body.message || "Paystack could not start checkout.",
    });
    return {
      ok: false,
      status: response.ok ? 502 : response.status,
      message: body.message || "Paystack could not start checkout. Try KES, or request an invoice.",
    };
  }

  await updatePaymentById(payment.id, {
    checkoutRequestID: body.data.reference || payment.id,
    raw: {
      usd: computed.amountMajor,
      kes,
      rate,
      amountMinor,
      accessCode: body.data.access_code,
    },
  });

  return {
    ok: true,
    authorizationUrl: body.data.authorization_url,
    reference: body.data.reference || payment.id,
    paymentId: payment.id,
    amountMajor,
    currency,
    kes,
    usd: computed.amountMajor,
  };
}

type VerifyData = {
  status?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  channel?: string;
  gateway_response?: string;
  id?: number;
  customer?: { email?: string };
  metadata?: { paymentId?: string };
};

export function verifyPaystackSignature(raw: string, signature: string | null): boolean {
  const secret = paystackSecret();
  if (!secret || !signature) return false;
  const hash = createHmac("sha512", secret).update(raw).digest("hex");
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function verifyPaystackReference(reference: string): Promise<PaymentRecord | null> {
  const secret = paystackSecret();
  if (!secret || !reference) return null;
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { status?: boolean; data?: VerifyData };
  if (!response.ok || !body.data) return null;
  return applyPaystackData(body.data);
}

export async function applyPaystackData(data: VerifyData): Promise<PaymentRecord | null> {
  const reference = data.reference || "";
  const paymentId = data.metadata?.paymentId || reference;
  const success = data.status === "success";
  const patch = {
    status: success ? "success" : data.status === "failed" ? "failed" : "pending",
    resultDesc: data.gateway_response,
    receipt: data.id ? String(data.id) : undefined,
    resultCode: data.status,
    ...(data.customer?.email ? { payerEmail: data.customer.email } : {}),
    raw: {
      channel: data.channel,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
    },
  } as const;

  const byCheckout = reference ? await updatePaymentByCheckoutId(reference, patch) : null;
  if (byCheckout) return byCheckout;
  if (paymentId) return updatePaymentById(paymentId, patch);
  return null;
}
