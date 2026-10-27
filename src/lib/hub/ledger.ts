import { randomUUID } from "crypto";
import type { HubState, LedgerEntry, LedgerType, PriceRow } from "./state";
import type { Category, Channel } from "./policy";

const round = (n: number) => Math.round(n * 100) / 100;

export function findPrice(prices: PriceRow[], channel: Channel, category: Category, network: string): PriceRow | undefined {
  const score = (p: PriceRow) => (p.category === category ? 2 : 0) + (p.network === network ? 1 : 0);
  return prices
    .filter((p) => p.channel === channel && (p.category === "*" || p.category === category) && (p.network === "*" || p.network === network))
    .sort((a, b) => score(b) - score(a))[0];
}

export function appendLedger(
  state: HubState,
  app: string,
  type: LedgerType,
  amountKes: number,
  extra: Partial<LedgerEntry> = {},
  now = new Date()
): LedgerEntry {
  if (!Number.isFinite(amountKes) || amountKes < 0) throw new Error("Ledger amount must be a non-negative number");
  const entry: LedgerEntry = { id: randomUUID(), app, type, amountKes: round(amountKes), at: now.toISOString(), ...extra };
  state.ledger.push(entry);
  return entry;
}

export type WalletSummary = {
  app: string;
  credits: number;
  debits: number;
  reserved: number;
  /** credits - debits - outstanding reservations */
  available: number;
  revenue: number;
  cost: number;
  margin: number;
};

/**
 * Append-only math. A reservation holds funds when a message is queued.
 * A refund releases a reservation (message sent, failed or rejected).
 * A debit charges the final price when sent.
 */
export function walletSummary(entries: LedgerEntry[], app: string): WalletSummary {
  let credits = 0, debits = 0, reservations = 0, refunds = 0, cost = 0;
  for (const e of entries) {
    if (e.app !== app) continue;
    if (e.type === "credit") credits += e.amountKes;
    else if (e.type === "debit") { debits += e.amountKes; cost += e.costKes || 0; }
    else if (e.type === "reservation") reservations += e.amountKes;
    else if (e.type === "refund") refunds += e.amountKes;
  }
  const reserved = round(reservations - refunds);
  return {
    app,
    credits: round(credits),
    debits: round(debits),
    reserved,
    available: round(credits - debits - reserved),
    revenue: round(debits),
    cost: round(cost),
    margin: round(debits - cost),
  };
}
