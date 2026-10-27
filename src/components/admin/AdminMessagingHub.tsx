"use client";

import { useCallback, useEffect, useState } from "react";
import { parseResponseJson } from "@/lib/safe-json";

type Wallet = { available: number; reserved: number; credits: number; revenue: number; cost: number; margin: number };
type AppRow = { app: string; key: string; configured: boolean; source: string; callbackUrl: string; pricing: string; queued: number; wallet: Wallet };
type Price = { channel: string; category: string; network: string; costKes: number; priceKes: number; transferPriceKes: number };
type HubData = {
  sendingEnabled: boolean;
  adapters: { sms: string | null; whatsapp: string | null };
  queueDepth: number;
  pendingCallbacks: number;
  apps: AppRow[];
  recent: Array<{ id: string; app: string; channel: string; to: string; category: string; status: string; reason?: string; priceKes: number; createdAt: string }>;
  suppressions: Array<{ app: string; to: string; channel: string; at: string; source: string }>;
  prices: Price[];
};

const kes = (n: number) => `KES ${n.toFixed(2)}`;
const eat = (iso: string) => new Date(iso).toLocaleString("en-GB", { timeZone: "Africa/Nairobi" });

export function AdminMessagingHub() {
  const [data, setData] = useState<HubData | null>(null);
  const [error, setError] = useState("");
  const [issued, setIssued] = useState<{ app: string; key: string; secret: string } | null>(null);
  const [prices, setPrices] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/hub", { cache: "no-store" });
    const json = await parseResponseJson<HubData | null>(res, null);
    if (!res.ok || !json) { setError("Could not load the messaging hub."); return; }
    setData(json);
    setPrices(JSON.stringify(json.prices, null, 2));
    setError("");
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(handle);
  }, [load]);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/hub", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await parseResponseJson<Record<string, unknown> | null>(res, null);
    if (!res.ok) { setError(String(json?.error || "Request failed")); return null; }
    return json;
  }

  async function rotate(app: string) {
    if (!window.confirm(`Generate a new key and secret for ${app}? The old ones stop working now.`)) return;
    const json = await post({ action: "rotate", app });
    if (json) { setIssued({ app, key: String(json.key), secret: String(json.secret) }); void load(); }
  }

  async function savePrices() {
    let rows: unknown;
    try { rows = JSON.parse(prices); } catch { setError("Price config is not valid JSON."); return; }
    if (await post({ action: "prices", prices: rows })) void load();
  }

  async function credit(app: string) {
    const amount = window.prompt(`Credit ${app} wallet (KES)`);
    if (!amount) return;
    if (await post({ action: "credit", app, amountKes: Number(amount) })) void load();
  }

  return (
    <section id="messaging" className="admin-section" aria-labelledby="messaging-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="messaging-heading" className="font-display text-xl font-semibold text-heading">Messaging hub</h2>
        <button type="button" className="admin-btn" onClick={() => void load()}>Refresh</button>
      </div>
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      {!data ? <p className="text-sm text-muted">Loading…</p> : (
        <div className="space-y-6">
          <div className="admin-panel p-5 text-sm">
            <p>Sending: <strong>{data.sendingEnabled ? "enabled" : "off (queue only)"}</strong> · SMS adapter: {data.adapters.sms || "none"} · WhatsApp adapter: {data.adapters.whatsapp || "none"}</p>
            <p>Queue depth: <strong>{data.queueDepth}</strong> · Pending callbacks: {data.pendingCallbacks}</p>
          </div>

          {issued && (
            <div className="admin-panel border border-accent p-5 text-sm">
              <p className="font-semibold">New credentials for {issued.app}. Copy them now; they are not shown again.</p>
              <p className="mt-2 break-all font-mono">BEACON_HUB_KEY={issued.key}</p>
              <p className="break-all font-mono">BEACON_HUB_SECRET={issued.secret}</p>
              <button type="button" className="admin-btn mt-3" onClick={() => setIssued(null)}>I have saved them</button>
            </div>
          )}

          <div className="admin-panel overflow-x-auto p-5">
            <h3 className="mb-3 font-semibold">Apps and wallets</h3>
            <table className="w-full text-left text-sm">
              <thead><tr><th>App</th><th>Key</th><th>Callback</th><th>Pricing</th><th>Queued</th><th>Available</th><th>Reserved</th><th>Margin</th><th /></tr></thead>
              <tbody>
                {data.apps.map((a) => (
                  <tr key={a.app} className="border-t border-border">
                    <td>{a.app}</td>
                    <td className="font-mono">{a.key}{a.configured ? ` (${a.source})` : ""}</td>
                    <td>{a.callbackUrl || "—"}</td>
                    <td>{a.pricing}</td>
                    <td>{a.queued}</td>
                    <td>{kes(a.wallet.available)}</td>
                    <td>{kes(a.wallet.reserved)}</td>
                    <td>{kes(a.wallet.margin)}</td>
                    <td className="whitespace-nowrap">
                      <button type="button" className="admin-btn" onClick={() => void rotate(a.app)}>{a.configured ? "Rotate key" : "Generate key"}</button>{" "}
                      <button type="button" className="admin-btn" onClick={() => void credit(a.app)}>Credit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-panel overflow-x-auto p-5">
            <h3 className="mb-3 font-semibold">Recent messages</h3>
            {data.recent.length === 0 ? <p className="text-sm text-muted">No messages yet.</p> : (
              <table className="w-full text-left text-sm">
                <thead><tr><th>When (EAT)</th><th>App</th><th>Channel</th><th>To</th><th>Category</th><th>Status</th><th>Price</th></tr></thead>
                <tbody>
                  {data.recent.map((m) => (
                    <tr key={m.id} className="border-t border-border">
                      <td>{eat(m.createdAt)}</td><td>{m.app}</td><td>{m.channel}</td><td>{m.to}</td><td>{m.category}</td>
                      <td>{m.status}{m.reason ? ` (${m.reason})` : ""}</td><td>{kes(m.priceKes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="admin-panel overflow-x-auto p-5">
            <h3 className="mb-3 font-semibold">Suppression list</h3>
            {data.suppressions.length === 0 ? <p className="text-sm text-muted">No opt-outs.</p> : (
              <table className="w-full text-left text-sm">
                <thead><tr><th>App</th><th>Number</th><th>Channel</th><th>Source</th><th>When (EAT)</th><th /></tr></thead>
                <tbody>
                  {data.suppressions.map((s) => (
                    <tr key={`${s.app}-${s.to}-${s.channel}`} className="border-t border-border">
                      <td>{s.app}</td><td>{s.to}</td><td>{s.channel}</td><td>{s.source}</td><td>{eat(s.at)}</td>
                      <td><button type="button" className="admin-btn" onClick={async () => {
                        if (window.confirm(`Remove opt-out for ${s.to}? Only do this with the person's fresh consent.`) && (await post({ action: "unsuppress", ...s }))) void load();
                      }}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="admin-panel p-5">
            <h3 className="font-semibold">Price config (KES before VAT)</h3>
            <p className="mb-2 text-xs text-muted">PLACEHOLDER values until providers are chosen. costKes = what we pay; priceKes = client price; transferPriceKes = sister-app price. category/network may be &quot;*&quot;.</p>
            <textarea className="h-64 w-full rounded border border-border bg-background p-2 font-mono text-xs" value={prices} onChange={(e) => setPrices(e.target.value)} />
            <button type="button" className="admin-btn mt-2" onClick={() => void savePrices()}>Save prices</button>
          </div>
        </div>
      )}
    </section>
  );
}
