import { siteConfig } from "@/data/site";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { randomUUID } from "crypto";

export type PaymentProvider = "stripe" | "mpesa";
export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";

export type PaymentRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  mode: "deposit" | "invoice";
  tierId: string;
  tierName: string;
  /** Amount in minor units (cents / cents-of-KES) */
  amount: number;
  currency: string;
  /** Deposit percent applied (always 30 for deposits) */
  depositPercent: number;
  /** Linked project (portal / intake payments) */
  projectId?: string;
  phone?: string;
  /** Stripe session id or M-Pesa CheckoutRequestID */
  checkoutRequestID?: string;
  merchantRequestID?: string;
  receipt?: string;
  resultCode?: string | number;
  resultDesc?: string;
  raw?: Record<string, unknown>;
  read?: boolean;
};

const FILE = "payments.json";

export function getDepositPercent(): number {
  return (
    siteConfig.payments.depositPercent ??
    siteConfig.payments.defaultDepositPercent ??
    30
  );
}

/** Deposit = tier.fromAmount × depositPercent; invoice = full floor. */
export function computeCheckoutAmount(
  tierId: string,
  mode: "deposit" | "invoice"
): {
  tier: (typeof siteConfig.pricingTiers)[number];
  amountMajor: number;
  amountMinor: number;
  depositPercent: number;
  currency: string;
} | null {
  const tier = siteConfig.pricingTiers.find((t) => t.id === tierId);
  if (!tier) return null;
  const depositPercent = getDepositPercent();
  const amountMajor =
    mode === "deposit"
      ? Math.round(tier.fromAmount * (depositPercent / 100) * 100) / 100
      : tier.fromAmount;
  const amountMinor = Math.round(amountMajor * 100);
  return {
    tier,
    amountMajor,
    amountMinor,
    depositPercent,
    currency: siteConfig.payments.currency,
  };
}

export async function listPayments(): Promise<PaymentRecord[]> {
  return readJsonFile<PaymentRecord[]>(FILE, []);
}

export async function savePayment(record: PaymentRecord): Promise<PaymentRecord> {
  const all = await listPayments();
  const idx = all.findIndex((p) => p.id === record.id);
  if (idx >= 0) all[idx] = record;
  else all.unshift(record);
  await writeJsonFile(FILE, all);
  return record;
}

export async function createPayment(
  partial: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt" | "read">
): Promise<PaymentRecord> {
  const now = new Date().toISOString();
  const record: PaymentRecord = {
    ...partial,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    read: false,
  };
  await savePayment(record);
  return record;
}

export async function updatePaymentByCheckoutId(
  checkoutRequestID: string,
  patch: Partial<PaymentRecord>
): Promise<PaymentRecord | null> {
  const all = await listPayments();
  const idx = all.findIndex((p) => p.checkoutRequestID === checkoutRequestID);
  if (idx < 0) return null;
  const next: PaymentRecord = {
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = next;
  await writeJsonFile(FILE, all);
  return next;
}

export async function updatePaymentById(
  id: string,
  patch: Partial<PaymentRecord>
): Promise<PaymentRecord | null> {
  const all = await listPayments();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const next: PaymentRecord = {
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = next;
  await writeJsonFile(FILE, all);
  return next;
}
