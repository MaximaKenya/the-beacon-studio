"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { carePlans } from "@/data/site";
import type { revenueOverview } from "@/lib/revenue-overview";
import { REQUEST_LABEL } from "@/lib/revenue-requests-rules";
import { parseResponseJson } from "@/lib/safe-json";
import { formatNairobi } from "@/lib/time";

type Overview = Awaited<ReturnType<typeof revenueOverview>>;

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="sleek-card rounded-2xl p-4">
      <p className="font-display text-2xl font-semibold text-heading">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

/** Admin revenue overview and partner view. `view` picks the panel. */
export function AdminRevenue({ view }: { view: "revenue" | "partners" }) {
  const [data, setData] = useState<Overview | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/revenue");
    if (!res.ok) return;
    setData(await parseResponseJson<Overview | null>(res, null));
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(handle);
  }, [load]);

  async function act(action: string, extra: Record<string, unknown>) {
    setNotice(null);
    const res = await fetch("/api/admin/revenue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
    const body = await parseResponseJson<{ message?: string; error?: string }>(res, {});
    setNotice(body.message || body.error || "Saved.");
    await load();
  }

  function formSubmit(action: string) {
    return (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void act(action, Object.fromEntries(new FormData(event.currentTarget).entries()));
    };
  }

  if (!data) return <p className="text-sm text-muted">Loading revenue…</p>;
  const partners = data.list.filter((item) => item.kind === "partner" || item.kind === "partnership");
  const requests = view === "partners" ? partners : data.list;

  return (
    <div className="space-y-5">
      {notice && <p className="text-sm text-muted" role="status">{notice}</p>}
      {view === "revenue" && (
        <>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {data.trials.map((stage) => (
              <Stat key={stage.stage} label={`Trials · ${stage.label}`} value={stage.count} />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Referrals (earned)" value={`${data.referrals.total} (${data.referrals.earned})`} />
            <Stat label="Partner applications" value={data.requests.counts.partner + data.requests.counts.partnership} />
            <Stat label="Add-on requests" value={data.requests.addOns} />
            <Stat label="Open invoices" value={data.openInvoices} />
            <Stat label="Active care plans" value={data.activeCare} />
            <Stat label="Template downloads" value={data.templateDownloads} />
          </div>
          <p className="text-xs text-muted">
            Notify queue (usage placeholder): WhatsApp {data.queue.whatsapp.waiting} waiting · {data.queue.whatsapp.sent} sent · SMS {data.queue.sms.waiting} waiting · {data.queue.sms.sent} sent.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <form onSubmit={formSubmit("care-create")} className="sleek-card space-y-2 rounded-2xl p-4">
              <h3 className="font-display text-base font-semibold text-heading">Start a care plan</h3>
              <input name="email" type="email" required placeholder="client@email" className="w-full rounded-xl px-3 py-2 text-sm" />
              <input name="name" placeholder="Client name" className="w-full rounded-xl px-3 py-2 text-sm" />
              <select name="planId" className="w-full rounded-xl px-3 py-2 text-sm">
                {carePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · ${plan.monthlyUsd}/mo
                  </option>
                ))}
              </select>
              <select name="billing" className="w-full rounded-xl px-3 py-2 text-sm">
                <option value="monthly">Monthly invoice</option>
                <option value="annual">Annual invoice (discounted)</option>
              </select>
              <button type="submit" className="admin-btn">Create and issue first invoice</button>
            </form>
            <form onSubmit={formSubmit("founders-lock")} className="sleek-card space-y-2 rounded-2xl p-4">
              <h3 className="font-display text-base font-semibold text-heading">Founders price lock</h3>
              <input name="email" type="email" required placeholder="client@email" className="w-full rounded-xl px-3 py-2 text-sm" />
              <input name="note" placeholder="Note (optional)" className="w-full rounded-xl px-3 py-2 text-sm" />
              <button type="submit" className="admin-btn">Lock price for 12 months</button>
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {data.foundersLocked.map((client) => (
                  <li key={client.email}>
                    {client.email} · until {formatNairobi(client.until)}{" "}
                    <button type="button" className="text-accent" onClick={() => void act("founders-lock", { email: client.email, on: false })}>
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            </form>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-base font-semibold text-heading">Care plans</h3>
            {data.care.length === 0 && <p className="text-sm text-muted">No care plans yet.</p>}
            {data.care.map((sub) => (
              <article key={sub.id} className="sleek-card rounded-2xl p-4">
                <p className="font-medium text-foreground">
                  {sub.planName} · {sub.email}
                </p>
                <p className="text-xs text-muted">
                  {sub.billing} · {sub.status} · next invoice {formatNairobi(sub.nextInvoiceAt)} · {sub.invoiceIds.length} issued
                </p>
                {sub.status === "active" && (
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="admin-btn" onClick={() => void act("care-invoice", { id: sub.id })}>
                      Issue next invoice
                    </button>
                    <button type="button" className="admin-btn" onClick={() => void act("care-cancel", { id: sub.id })}>
                      Cancel
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      )}

      <div className="space-y-2">
        <h3 className="font-display text-base font-semibold text-heading">{view === "partners" ? "Partner applications" : "Requests"}</h3>
        {requests.length === 0 && <p className="text-sm text-muted">Nothing yet.</p>}
        {requests.map((item) => (
          <article key={item.id} className="sleek-card rounded-2xl p-4">
            <p className="font-medium text-foreground">
              {REQUEST_LABEL[item.kind]}
              {item.itemLabel ? ` · ${item.itemLabel}` : ""} — {item.company || item.name}
            </p>
            <p className="text-xs text-muted">
              {item.email}
              {item.phone ? ` · ${item.phone}` : ""} · {formatNairobi(item.createdAt)} · {item.status}
            </p>
            {item.message && <p className="mt-1 text-sm text-muted">{item.message}</p>}
            <div className="mt-2 flex gap-2">
              {item.status !== "contacted" && (
                <button type="button" className="admin-btn" onClick={() => void act("request-status", { id: item.id, status: "contacted" })}>
                  Contacted
                </button>
              )}
              {item.status !== "done" && (
                <button type="button" className="admin-btn" onClick={() => void act("request-status", { id: item.id, status: "done" })}>
                  Done
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
