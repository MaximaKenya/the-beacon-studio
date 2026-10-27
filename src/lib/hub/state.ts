import type { Category, Channel, PolicyConfig } from "./policy";
import { DEFAULT_POLICY } from "./policy";

export type MessageStatus = "queued" | "sent" | "delivered" | "failed" | "rejected";

export type HubMessage = {
  id: string;
  app: string;
  channel: Channel;
  to: string;
  network: string;
  templateKey?: string;
  variables?: Record<string, string>;
  body?: string;
  reference: string;
  consentRef?: string;
  category: Category;
  vendorRef?: string;
  status: MessageStatus;
  reason?: string;
  providerId?: string;
  provider?: string;
  /** KES charged to the app (price) and paid to provider (cost). */
  priceKes: number;
  costKes: number;
  createdAt: string;
  updatedAt: string;
  attempts: number;
};

export type Suppression = { app: string; to: string; channel: Channel; at: string; source: string };

export type LedgerType = "credit" | "debit" | "reservation" | "refund";
export type LedgerEntry = {
  id: string;
  app: string;
  type: LedgerType;
  amountKes: number;
  /** Provider cost for debits, so margin = price - cost. */
  costKes?: number;
  messageId?: string;
  note?: string;
  at: string;
};

export type PriceRow = {
  channel: Channel;
  category: Category | "*";
  network: "safaricom" | "airtel" | "other" | "*";
  costKes: number;
  /** Client price (external clients). */
  priceKes: number;
  /** Sister-app transfer price. */
  transferPriceKes: number;
};

export type CallbackJob = {
  id: string;
  app: string;
  messageId: string;
  payload: string;
  attempts: Array<{ at: string; status: number | null; error?: string }>;
  nextAt: string;
  done: boolean;
  gaveUp?: boolean;
};

export type StoredAppKey = {
  key: string;
  secret: string;
  callbackUrl?: string;
  rotatedAt: string;
  /** "transfer" for sister apps (default), "client" for external clients. */
  pricing?: "transfer" | "client";
  enforceWallet?: boolean;
};

export type HubState = {
  version: 1;
  messages: HubMessage[];
  suppressions: Suppression[];
  ledger: LedgerEntry[];
  prices: PriceRow[];
  callbacks: CallbackJob[];
  apps: Record<string, StoredAppKey>;
  policy: PolicyConfig;
};

/**
 * PLACEHOLDER prices (KES, before VAT). Providers are not chosen yet;
 * every number here must be replaced from real quotes in Admin > Messaging hub.
 */
export const PLACEHOLDER_PRICES: PriceRow[] = [
  { channel: "sms", category: "*", network: "safaricom", costKes: 0.5, priceKes: 0.8, transferPriceKes: 0.6 },
  { channel: "sms", category: "*", network: "airtel", costKes: 0.8, priceKes: 1.2, transferPriceKes: 0.9 },
  { channel: "sms", category: "*", network: "*", costKes: 1, priceKes: 1.5, transferPriceKes: 1.1 },
  { channel: "whatsapp", category: "marketing", network: "*", costKes: 2.5, priceKes: 4, transferPriceKes: 3 },
  { channel: "whatsapp", category: "utility", network: "*", costKes: 0.6, priceKes: 0.9, transferPriceKes: 0.7 },
  { channel: "whatsapp", category: "authentication", network: "*", costKes: 0.6, priceKes: 0.9, transferPriceKes: 0.7 },
  { channel: "whatsapp", category: "collection", network: "*", costKes: 0.6, priceKes: 0.9, transferPriceKes: 0.7 },
];

export function emptyState(): HubState {
  return {
    version: 1,
    messages: [],
    suppressions: [],
    ledger: [],
    prices: PLACEHOLDER_PRICES.map((p) => ({ ...p })),
    callbacks: [],
    apps: {},
    policy: { ...DEFAULT_POLICY },
  };
}

export function withDefaults(s: Partial<HubState> | null | undefined): HubState {
  const base = emptyState();
  if (!s || typeof s !== "object") return base;
  return {
    version: 1,
    messages: Array.isArray(s.messages) ? s.messages : [],
    suppressions: Array.isArray(s.suppressions) ? s.suppressions : [],
    ledger: Array.isArray(s.ledger) ? s.ledger : [],
    prices: Array.isArray(s.prices) && s.prices.length ? s.prices : base.prices,
    callbacks: Array.isArray(s.callbacks) ? s.callbacks : [],
    apps: s.apps && typeof s.apps === "object" ? s.apps : {},
    policy: { ...base.policy, ...(s.policy || {}) },
  };
}
