import { beaconPaystackMetadata, beaconPaystackReference, paystackSecret } from "@/lib/paystack";
import { createPayment, updatePaymentById } from "@/lib/payments";

/** One-off Paystack link for an invoice, rent, or fee. Returns the checkout URL. */
export async function createChargeLink(input: {
  email: string;
  amountKes: number;
  chargeId: string;
  instanceId: string;
  label: string;
  callbackUrl: string;
}): Promise<{ url?: string; reference?: string }> {
  const secret = paystackSecret();
  const amount = Math.round(input.amountKes);
  if (!secret || amount < 1 || !input.email) return {};
  const payment = await createPayment({
    provider: "paystack",
    status: "pending",
    mode: "invoice",
    tierId: "automation-charge",
    tierName: input.label,
    amount,
    currency: "KES",
    depositPercent: 100,
    payerEmail: input.email,
    automationChargeId: input.chargeId,
  });
  const reference = beaconPaystackReference(payment.id);
  await updatePaymentById(payment.id, { checkoutRequestID: reference });
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: amount * 100,
      currency: "KES",
      reference,
      callback_url: input.callbackUrl,
      channels: ["card", "mobile_money"],
      metadata: beaconPaystackMetadata({
        paymentId: payment.id,
        automationChargeId: input.chargeId,
        instanceId: input.instanceId,
        kind: "automation-charge",
      }),
    }),
  });
  const body = (await response.json().catch(() => ({}))) as {
    status?: boolean;
    data?: { authorization_url?: string; reference?: string };
  };
  if (!response.ok || !body.data?.authorization_url) return { reference };
  return { url: body.data.authorization_url, reference: body.data.reference || reference };
}
