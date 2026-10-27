import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendingEnabled, adapterFor } from "@/lib/hub/adapters";
import { HUB_APPS, generateCredentials, maskKey, resolveApps } from "@/lib/hub/apps";
import { appendLedger, walletSummary } from "@/lib/hub/ledger";
import { CATEGORIES, CHANNELS, normalizePhone, type Channel } from "@/lib/hub/policy";
import { loadHub, mutateHub } from "@/lib/hub/store";
import type { PriceRow } from "@/lib/hub/state";

export const runtime = "nodejs";

function originOf(url: string): string {
  try {
    return url ? new URL(url).origin : "";
  } catch {
    return "invalid";
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = await loadHub();
  const apps = resolveApps(s).map((a) => ({
    app: a.app,
    key: maskKey(a.key),
    configured: Boolean(a.key && a.secret),
    source: a.source,
    callbackUrl: originOf(a.callbackUrl),
    pricing: a.pricing,
    queued: s.messages.filter((m) => m.app === a.app && m.status === "queued").length,
    wallet: walletSummary(s.ledger, a.app),
  }));
  return NextResponse.json({
    sendingEnabled: sendingEnabled(),
    adapters: { sms: adapterFor("sms")?.name || null, whatsapp: adapterFor("whatsapp")?.name || null },
    queueDepth: s.messages.filter((m) => m.status === "queued").length,
    pendingCallbacks: s.callbacks.filter((c) => !c.done).length,
    apps,
    recent: s.messages.slice(-50).reverse().map((m) => ({ id: m.id, app: m.app, channel: m.channel, to: m.to, category: m.category, status: m.status, reason: m.reason, priceKes: m.priceKes, costKes: m.costKes, createdAt: m.createdAt })),
    suppressions: s.suppressions.slice(-200).reverse(),
    prices: s.prices,
    policy: s.policy,
  });
}

function validPrices(rows: unknown): PriceRow[] | null {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 200) return null;
  const out: PriceRow[] = [];
  for (const r of rows as Record<string, unknown>[]) {
    const nums = [r.costKes, r.priceKes, r.transferPriceKes].map(Number);
    if (!CHANNELS.includes(r.channel as Channel)) return null;
    if (r.category !== "*" && !CATEGORIES.includes(r.category as never)) return null;
    if (!["safaricom", "airtel", "other", "*"].includes(String(r.network))) return null;
    if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
    out.push({ channel: r.channel as Channel, category: r.category as PriceRow["category"], network: r.network as PriceRow["network"], costKes: nums[0], priceKes: nums[1], transferPriceKes: nums[2] });
  }
  return out;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = body.action;
  if (action === "rotate") {
    const app = String(body.app || "").toLowerCase();
    if (!/^[a-z0-9-]{2,40}$/.test(app)) return NextResponse.json({ error: "bad app" }, { status: 400 });
    const creds = generateCredentials(app);
    await mutateHub((s) => {
      const prev = s.apps[app];
      s.apps[app] = {
        ...creds,
        callbackUrl: typeof body.callbackUrl === "string" && /^https:\/\//.test(body.callbackUrl) ? body.callbackUrl : prev?.callbackUrl,
        rotatedAt: new Date().toISOString(),
        pricing: prev?.pricing || ((HUB_APPS as readonly string[]).includes(app) ? "transfer" : "client"),
        enforceWallet: prev?.enforceWallet,
      };
    });
    // Shown once; never returned again.
    return NextResponse.json({ ok: true, app, key: creds.key, secret: creds.secret });
  }
  if (action === "prices") {
    const rows = validPrices(body.prices);
    if (!rows) return NextResponse.json({ error: "invalid price rows" }, { status: 400 });
    await mutateHub((s) => { s.prices = rows; });
    return NextResponse.json({ ok: true });
  }
  if (action === "credit") {
    const app = String(body.app || "");
    const amount = Number(body.amountKes);
    if (!app || !Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "bad credit" }, { status: 400 });
    await mutateHub((s) => { appendLedger(s, app, "credit", amount, { note: String(body.note || "admin credit").slice(0, 200) }); });
    return NextResponse.json({ ok: true });
  }
  if (action === "unsuppress") {
    const to = normalizePhone(body.to);
    await mutateHub((s) => {
      s.suppressions = s.suppressions.filter((x) => !(x.app === body.app && x.to === to && x.channel === body.channel));
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
