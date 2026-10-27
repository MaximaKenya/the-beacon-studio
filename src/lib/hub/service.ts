import { randomUUID } from "crypto";
import { adapterFor, sendingEnabled } from "./adapters";
import type { AppCreds } from "./apps";
import { appendLedger, findPrice, walletSummary } from "./ledger";
import {
  CATEGORIES,
  CHANNELS,
  collectionCapReason,
  collectionWindowOpen,
  kenyanNetwork,
  normalizePhone,
  type Category,
  type Channel,
} from "./policy";
import { signedHeaders } from "./signature";
import type { CallbackJob, HubMessage, HubState, MessageStatus } from "./state";

export type SendInput = {
  app: string;
  channel: Channel;
  to: string;
  templateKey?: string;
  variables?: Record<string, string>;
  body?: string;
  reference: string;
  consentRef?: string;
  category: Category;
  vendorRef?: string;
};

const str = (v: unknown, max: number): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

export function parseSendBody(raw: unknown): { ok: true; input: SendInput } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "Body must be a JSON object" };
  const b = raw as Record<string, unknown>;
  const app = str(b.app, 64);
  if (!app) return { ok: false, error: "app is required" };
  if (!CHANNELS.includes(b.channel as Channel)) return { ok: false, error: "channel must be 'sms' or 'whatsapp'" };
  const channel = b.channel as Channel;
  const to = normalizePhone(b.to);
  if (!to) return { ok: false, error: "to must be an E.164 phone number" };
  const reference = str(b.reference, 128);
  if (!reference) return { ok: false, error: "reference is required" };
  const category = (b.category ?? "utility") as Category;
  if (!CATEGORIES.includes(category)) return { ok: false, error: "category must be utility, marketing, authentication or collection" };
  const templateKey = str(b.templateKey, 128);
  const body = typeof b.body === "string" && b.body.trim() ? b.body.slice(0, 1600) : undefined;
  if (channel === "sms" && !body && !templateKey) return { ok: false, error: "body is required for sms unless templateKey is set" };
  if (channel === "whatsapp" && !body && !templateKey) return { ok: false, error: "templateKey or body is required" };
  let variables: Record<string, string> | undefined;
  if (b.variables !== undefined) {
    if (!b.variables || typeof b.variables !== "object" || Array.isArray(b.variables)) return { ok: false, error: "variables must be an object" };
    variables = {};
    for (const [k, v] of Object.entries(b.variables as Record<string, unknown>).slice(0, 50)) variables[k.slice(0, 64)] = String(v ?? "").slice(0, 500);
  }
  return {
    ok: true,
    input: { app, channel, to, templateKey, variables, body, reference, consentRef: str(b.consentRef, 128), category, vendorRef: str(b.vendorRef, 128) },
  };
}

export function isSuppressed(state: HubState, app: string, to: string, channel: Channel): boolean {
  return state.suppressions.some((s) => s.app === app && s.to === to && s.channel === channel);
}

export type AcceptResult = { id: string; status: "queued" | "rejected"; reason?: string; duplicate?: boolean };

/** Applies every platform rule and records the message. Never sends. */
export function acceptMessage(state: HubState, creds: AppCreds, input: SendInput, now = new Date()): AcceptResult {
  const existing = state.messages.find((m) => m.app === creds.app && m.reference === input.reference);
  if (existing) {
    return { id: existing.id, status: existing.status === "rejected" ? "rejected" : "queued", reason: existing.reason, duplicate: true };
  }
  const network = input.channel === "sms" ? kenyanNetwork(input.to) : "*";
  const price = findPrice(state.prices, input.channel, input.category, network);
  const unitPrice = price ? (creds.pricing === "client" ? price.priceKes : price.transferPriceKes) : 0;
  const iso = now.toISOString();
  const msg: HubMessage = {
    id: `hm_${randomUUID()}`,
    app: creds.app,
    channel: input.channel,
    to: input.to,
    network,
    templateKey: input.templateKey,
    variables: input.variables,
    body: input.body,
    reference: input.reference,
    consentRef: input.consentRef,
    category: input.category,
    vendorRef: input.vendorRef,
    status: "queued",
    priceKes: unitPrice,
    costKes: price?.costKes ?? 0,
    createdAt: iso,
    updatedAt: iso,
    attempts: 0,
  };

  let reason: string | undefined;
  if (isSuppressed(state, creds.app, input.to, input.channel)) reason = "opted_out";
  else if (input.category === "marketing" && !input.consentRef) reason = "marketing_requires_consent";
  else if (input.category === "collection") {
    const win = collectionWindowOpen(now, state.policy);
    if (!win.ok) reason = win.reason;
    else {
      const prior = state.messages
        .filter((m) => m.app === creds.app && m.to === input.to && m.category === "collection" && m.status !== "rejected")
        .map((m) => m.createdAt);
      reason = collectionCapReason(prior, now, state.policy);
    }
  }
  if (!reason && !price) reason = "no_price_configured";
  if (!reason && creds.enforceWallet && walletSummary(state.ledger, creds.app).available < unitPrice) reason = "insufficient_wallet";

  if (reason) {
    msg.status = "rejected";
    msg.reason = reason;
    state.messages.push(msg);
    return { id: msg.id, status: "rejected", reason };
  }
  state.messages.push(msg);
  if (unitPrice > 0) appendLedger(state, creds.app, "reservation", unitPrice, { messageId: msg.id }, now);
  return { id: msg.id, status: "queued" };
}

export function publicStatus(m: HubMessage) {
  return {
    id: m.id,
    app: m.app,
    reference: m.reference,
    channel: m.channel,
    to: m.to,
    category: m.category,
    status: m.status,
    reason: m.reason,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

export function enqueueCallback(
  state: HubState,
  creds: AppCreds | undefined,
  type: "status" | "opt_out",
  data: { id: string; reference: string; channel: Channel; to: string; status: Exclude<MessageStatus, "rejected">; reason?: string },
  now = new Date()
): CallbackJob | null {
  if (!creds?.callbackUrl) return null;
  const payload = JSON.stringify({ type, ...data, at: now.toISOString() });
  const job: CallbackJob = { id: `cb_${randomUUID()}`, app: creds.app, messageId: data.id, payload, attempts: [], nextAt: now.toISOString(), done: false };
  state.callbacks.push(job);
  return job;
}

export function addSuppression(
  state: HubState,
  creds: AppCreds,
  to: string,
  channel: Channel,
  source: string,
  now = new Date()
): { added: boolean } {
  if (isSuppressed(state, creds.app, to, channel)) return { added: false };
  state.suppressions.push({ app: creds.app, to, channel, at: now.toISOString(), source });
  if (source !== "api") {
    enqueueCallback(state, creds, "opt_out", { id: `opt_${randomUUID()}`, reference: "", channel, to, status: "delivered" }, now);
  }
  return { added: true };
}

function settle(state: HubState, m: HubMessage, outcome: "sent" | "failed", now: Date) {
  const reserved = state.ledger.some((e) => e.messageId === m.id && e.type === "reservation");
  if (reserved) appendLedger(state, m.app, "refund", m.priceKes, { messageId: m.id, note: "release reservation" }, now);
  if (outcome === "sent" && m.priceKes > 0) appendLedger(state, m.app, "debit", m.priceKes, { messageId: m.id, costKes: m.costKes }, now);
}

/** Moves queued messages to providers only when HUB_SENDING_ENABLED=true and an adapter is configured. */
export async function dispatchQueued(
  state: HubState,
  apps: AppCreds[],
  env: NodeJS.ProcessEnv = process.env,
  now = new Date(),
  limit = 50
): Promise<{ sent: number; failed: number; held: number }> {
  const queued = state.messages.filter((m) => m.status === "queued");
  if (!sendingEnabled(env)) return { sent: 0, failed: 0, held: queued.length };
  let sent = 0, failed = 0, held = 0;
  for (const m of queued.slice(0, limit)) {
    const adapter = adapterFor(m.channel, env);
    if (!adapter) { held += 1; continue; }
    m.attempts += 1;
    const out = await adapter.send(m);
    const creds = apps.find((a) => a.app === m.app);
    m.updatedAt = now.toISOString();
    m.provider = adapter.name;
    if (out.ok) {
      m.status = "sent";
      m.providerId = out.providerId;
      settle(state, m, "sent", now);
      sent += 1;
    } else if (out.retryable && m.attempts < 3) {
      held += 1;
      continue;
    } else {
      m.status = "failed";
      m.reason = out.error.slice(0, 200);
      settle(state, m, "failed", now);
      failed += 1;
    }
    enqueueCallback(state, creds, "status", { id: m.id, reference: m.reference, channel: m.channel, to: m.to, status: m.status as "sent" | "failed", reason: m.reason }, now);
  }
  return { sent, failed, held };
}

/** Backoff after attempt n (1-based): 1m, 5m, 30m, 2h, 12h; then give up. */
export const CALLBACK_BACKOFF_MS = [60_000, 300_000, 1_800_000, 7_200_000, 43_200_000];

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

export async function deliverCallbacks(
  state: HubState,
  apps: AppCreds[],
  fetcher: Fetcher = fetch,
  now = new Date()
): Promise<{ delivered: number; failed: number }> {
  let delivered = 0, failed = 0;
  for (const job of state.callbacks) {
    if (job.done || new Date(job.nextAt).getTime() > now.getTime()) continue;
    const creds = apps.find((a) => a.app === job.app);
    if (!creds?.callbackUrl || !creds.secret) continue;
    let status: number | null = null;
    let error: string | undefined;
    try {
      const res = await fetcher(creds.callbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...signedHeaders(creds.secret, job.payload, now.getTime()) },
        body: job.payload,
        signal: AbortSignal.timeout(10_000),
      });
      status = res.status;
    } catch (e) {
      error = e instanceof Error ? e.message.slice(0, 200) : "fetch failed";
    }
    job.attempts.push({ at: now.toISOString(), status, error });
    if (status !== null && status >= 200 && status < 300) {
      job.done = true;
      delivered += 1;
    } else {
      failed += 1;
      const wait = CALLBACK_BACKOFF_MS[job.attempts.length - 1];
      if (wait === undefined) { job.done = true; job.gaveUp = true; }
      else job.nextAt = new Date(now.getTime() + wait).toISOString();
    }
  }
  return { delivered, failed };
}
