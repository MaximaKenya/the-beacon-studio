"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AutomationDesk,
  ChannelStatus,
  type DeskCharge,
  type DeskInstance,
  type DeskLead,
  type DeskLog,
} from "@/components/automations/AutomationDesk";
import { DemoSandbox } from "@/components/automations/DemoSandbox";
import { SANDBOX_BUSINESS } from "@/lib/automations/setup-guides";
import { AdminRevenue } from "@/components/revenue/AdminRevenue";
import type { ChannelReadiness } from "@/lib/automations/channels";
import { formatNairobi } from "@/lib/time";
import { formatKes } from "@/lib/fx";
import { parseResponseJson } from "@/lib/safe-json";

type ActionItem = {
  id: string;
  menu: string;
  title: string;
  what: string;
  why: string;
  todo: string;
  count: number;
  blocking: boolean;
  actionLabel?: string;
  action?: string;
  steps?: string[];
};

type ClientView = {
  email: string;
  name: string;
  businessName: string;
  mrrKes: number;
  trial?: { days: number; ended: boolean } | null;
  instances: DeskInstance[];
  logs: DeskLog[];
  charges: DeskCharge[];
  leads: DeskLead[];
};

type Invoice = { id: string; email?: string; name?: string; amount: number; tierName: string; note?: string };

type AdminView = {
  mrrKes: number;
  active: number;
  pending: number;
  paused: number;
  demos: number;
  clients: ClientView[];
  sandbox?: { instances: DeskInstance[] };
  demoClients?: { email: string; name: string; automations: number }[];
  channels?: ChannelReadiness;
  actions?: ActionItem[];
  ops?: { lastTickAt?: string; lastTickOk?: boolean; lastTickError?: string };
  adminLog?: { id: string; at: string; kind: string; title: string; detail: string }[];
  invoices?: Invoice[];
  paystack?: boolean;
  trialStages?: { stage: string; label: string; clients: { email: string; businessName: string; days: number }[] }[];
  referrals?: { id: string; code: string; referrerEmail: string; referredEmail: string; status: string; createdAt: string; expiresAt?: string; live: boolean }[];
};

const empty: AdminView = { mrrKes: 0, active: 0, pending: 0, paused: 0, demos: 0, clients: [], sandbox: { instances: [] } };

const MENUS = [
  { id: "now", label: "Action Center" },
  { id: "revenue", label: "Requests" },
  { id: "trials", label: "Trials" },
  { id: "invoices", label: "Invoices" },
  { id: "clients", label: "Clients" },
  { id: "referrals", label: "Referrals" },
  { id: "partners", label: "Partners" },
  { id: "channels", label: "Channels" },
  { id: "scheduler", label: "Scheduler" },
  { id: "health", label: "Health" },
  { id: "leads", label: "Automation leads" },
  { id: "later", label: "Later" },
  { id: "test", label: "Demo clients" },
  { id: "log", label: "Activity log" },
] as const;

type RevenueCounts = { list?: { kind: string; status: string }[] };

/** Items waiting on the studio, per menu, outside the action list. */
export function extraBadges(data: AdminView | null, revenue: RevenueCounts | null): Record<string, number> {
  const list = revenue?.list || [];
  const isPartner = (kind: string) => kind === "partner" || kind === "partnership";
  return {
    revenue: list.filter((item) => item.status === "new" && !isPartner(item.kind)).length,
    partners: list.filter((item) => item.status === "new" && isPartner(item.kind)).length,
    referrals: (data?.referrals || []).filter((item) => item.live && item.status === "earned").length,
    invoices: (data?.invoices || []).length,
  };
}

export function AdminAutomations({ onAttention }: { onAttention?: (count: number) => void } = {}) {
  const [data, setData] = useState<AdminView | null>(null);
  const [revenue, setRevenue] = useState<RevenueCounts | null>(null);
  const [email, setEmail] = useState("");
  const [menu, setMenu] = useState<(typeof MENUS)[number]["id"]>("now");
  const [notice, setNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/automations", { cache: "no-store" });
    if (!res.ok) {
      setLoadError(
        res.status === 401
          ? "Your admin session expired. Log out and sign in again."
          : `The action center could not load (HTTP ${res.status}).`
      );
      return;
    }
    setLoadError(null);
    const next = await parseResponseJson<AdminView>(res, empty);
    setData(next);
    const rev = await fetch("/api/admin/revenue");
    if (rev.ok) setRevenue(await parseResponseJson<RevenueCounts | null>(rev, null));
    setEmail((current) => current || next.clients[0]?.email || "");
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [load]);

  async function act(action: string, extra?: Record<string, unknown>) {
    setNotice(null);
    const res = await fetch("/api/admin/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const body = await parseResponseJson<{ message?: string; error?: string }>(res, {});
    setNotice(body.message || body.error || "Saved.");
    await load();
  }

  const actions = data?.actions || [];
  const extra = extraBadges(data, revenue);
  const badge = (id: string) =>
    Math.max(
      actions.filter((item) => item.blocking && item.count > 0 && item.menu === id).reduce((sum, item) => sum + item.count, 0),
      extra[id] || 0
    );
  const total =
    actions.filter((item) => item.blocking && item.count > 0 && item.menu !== "invoices").reduce((sum, item) => sum + item.count, 0) +
    extra.revenue + extra.partners + extra.referrals + extra.invoices;
  const visible = menu === "now" ? actions.filter((item) => item.blocking && item.count > 0) : actions.filter((item) => item.menu === menu);
  const selected = data?.clients.find((client) => client.email === email) || null;
  const tickOld = actions.some((item) => item.id === "tick");

  useEffect(() => {
    if (data) onAttention?.(total);
  }, [data, total, onAttention]);

  return (
    <section id="actions" className="admin-section">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-heading">Action Center</h2>
          <p className="mt-1 text-sm text-muted">What needs you, and what the system already did.</p>
        </div>
        {total > 0 && <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-background">{total} open</span>}
      </div>
      {!data ? (
        <p className="text-sm text-muted" role={loadError ? "alert" : undefined}>
          {loadError || "Loading the action center…"}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label="Automation admin" className="flex gap-2 overflow-auto lg:flex-col">
            {MENUS.map((item) => {
              const count = item.id === "now" ? total : badge(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={menu === item.id ? "page" : undefined}
                  onClick={() => setMenu(item.id)}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2 text-left text-sm ${menu === item.id ? "bg-accent text-background" : "sleek-card text-foreground"}`}
                >
                  <span>{item.label}</span>
                  {count > 0 && item.id !== "later" && (
                    <span className={`ml-2 rounded-full px-2 text-[10px] font-semibold ${menu === item.id ? "bg-background text-accent" : "bg-accent text-background"}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="min-w-0 space-y-4">
            {notice && <p className="text-sm text-muted">{notice}</p>}
            {menu === "now" && (
              <div className={`sleek-card rounded-2xl p-4 ${tickOld ? "ring-2 ring-accent" : ""}`} data-testid="tick-health">
                <p className="text-sm font-medium text-foreground">
                  Tick health: {tickOld ? (data.ops?.lastTickAt ? "late" : "no successful tick yet") : "healthy"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {data.ops?.lastTickAt ? `Last success ${formatNairobi(data.ops.lastTickAt)}.` : "The hourly tick has not succeeded yet."}
                  {tickOld ? " See “Scheduler needs a look” below." : ""}
                </p>
              </div>
            )}
            {menu === "now" && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Summary label="Active" value={String(data.active)} />
                <Summary label="Paused" value={String(data.paused)} />
                <Summary label="MRR" value={formatKes(data.mrrKes)} />
                <Summary label="Last tick" value={data.ops?.lastTickAt ? formatNairobi(data.ops.lastTickAt) : "Never"} />
              </div>
            )}
            {menu === "scheduler" && (
              <div className={`sleek-card rounded-2xl p-4 ${tickOld ? "ring-2 ring-accent" : ""}`}>
                <p className="text-sm font-medium text-foreground">{tickOld ? "Tick is late" : "Tick is healthy"}</p>
                <p className="mt-1 text-sm text-muted">
                  {data.ops?.lastTickAt ? `Last success ${formatNairobi(data.ops.lastTickAt)}.` : "No successful tick yet."}
                  {tickOld ? " Warning: more than 2 hours old." : ""}
                </p>
              </div>
            )}
            {(menu === "now" || menu === "trials" || menu === "channels" || menu === "scheduler" || menu === "health" || menu === "leads" || menu === "later") &&
              visible.map((item) => (
                <article key={item.id} className="sleek-card rounded-2xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    {item.count > 0 && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">{item.count}</span>}
                  </div>
                  <p className="mt-2 text-sm text-foreground">{item.what}</p>
                  <p className="mt-1 text-sm text-muted">Why it matters: {item.why}</p>
                  <p className="mt-1 text-sm text-muted">What to do: {item.todo}</p>
                  {item.steps && (
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
                      {item.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  )}
                  {item.action === "retry-failed" && (
                    <button type="button" className="admin-btn mt-3" onClick={() => void act("retry-failed")}>
                      {item.actionLabel || "Retry"}
                    </button>
                  )}
                  {item.action === "open-clients" && (
                    <button type="button" className="admin-btn mt-3" onClick={() => setMenu("clients")}>
                      {item.actionLabel || "Open clients"}
                    </button>
                  )}
                  {item.action === "open-trials" && (
                    <button type="button" className="admin-btn mt-3" onClick={() => setMenu("clients")}>
                      Open the client to extend
                    </button>
                  )}
                  {item.action === "open-invoices" && (
                    <button type="button" className="admin-btn mt-3" onClick={() => setMenu("invoices")}>
                      Review invoices
                    </button>
                  )}
                </article>
              ))}
            {menu === "trials" && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {(data.trialStages || []).map((column) => (
                  <div key={column.stage} className="sleek-card rounded-2xl p-4">
                    <p className="text-xs text-muted">{column.label}</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-heading">{column.clients.length}</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted">
                      {column.clients.slice(0, 8).map((client) => (
                        <li key={client.email} className="truncate">
                          {client.businessName || client.email}
                          {column.stage !== "ended" && column.stage !== "paid" ? ` · ${client.days}d` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {(menu === "revenue" || menu === "partners") && <AdminRevenue view={menu} />}
            {menu === "referrals" && (
              <div className="space-y-3">
                <p className="text-sm text-muted">Credit is earned after the referred client&apos;s first paid month. Apply it to the referrer&apos;s next invoice, then mark it used.</p>
                {(data.referrals || []).length === 0 && <p className="text-sm text-muted">No referrals yet.</p>}
                {data.referrals?.map((item) => (
                  <article key={item.id} className="sleek-card rounded-2xl p-4">
                    <p className="font-medium text-foreground">
                      {item.referrerEmail} → {item.referredEmail}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {item.code} · {item.status === "earned" && !item.live ? "expired" : item.status} · {formatNairobi(item.createdAt)}
                      {item.expiresAt && item.live ? ` · expires ${formatNairobi(item.expiresAt)}` : ""}
                    </p>
                    {item.live && (
                      <button type="button" className="admin-btn mt-3" onClick={() => void act("redeem-referral", { referralId: item.id })}>
                        Mark credit used
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
            {menu === "now" && visible.length === 0 && <p className="text-sm text-muted">Nothing is waiting. The hourly tick keeps going.</p>}
            {menu === "now" && (
              <DemoClients data={data} compact onShowAll={() => setMenu("test")} onChanged={() => void load()} />
            )}
            {menu === "invoices" && (
              <div className="space-y-3">
                {(data.invoices || []).length === 0 && <p className="text-sm text-muted">No invoices are waiting.</p>}
                {data.invoices?.map((invoice) => (
                  <article key={invoice.id} className="sleek-card rounded-2xl p-4">
                    <p className="font-medium text-foreground">{invoice.tierName}</p>
                    <p className="mt-1 text-sm text-muted">
                      {invoice.email} · {formatKes(invoice.amount)}
                    </p>
                    {invoice.note && <p className="mt-1 text-sm text-muted">{invoice.note}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a className="admin-btn" href={`/api/automations/invoice/${invoice.id}`}>
                        Open invoice
                      </a>
                      <button type="button" className="admin-btn" onClick={() => void act("mark-invoice", { paymentId: invoice.id })}>
                        Mark paid
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {menu === "clients" && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.clients.length === 0 && <p className="text-sm text-muted">No client automations yet.</p>}
                  {data.clients.map((client) => (
                    <button
                      key={client.email}
                      type="button"
                      aria-pressed={client.email === email}
                      onClick={() => setEmail(client.email)}
                      className={`sleek-card rounded-2xl p-4 text-left ${client.email === email ? "choice-selected" : ""}`}
                    >
                      <p className="font-medium text-foreground">{client.businessName || client.name}</p>
                      <p className="mt-1 text-xs text-muted">{client.email}</p>
                      <p className="mt-2 text-sm text-foreground">
                        {formatKes(client.mrrKes)} · {client.trial ? (client.trial.ended ? "Trial ended" : `${client.trial.days} days left`) : "No trial"}
                      </p>
                    </button>
                  ))}
                </div>
                {selected && (
                  <AutomationDesk
                    instances={selected.instances}
                    logs={selected.logs}
                    charges={selected.charges}
                    leads={selected.leads}
                    endpoint="/api/admin/automations"
                    canActivate
                    onChanged={() => void load()}
                  />
                )}
              </div>
            )}
            {menu === "channels" && data.channels && <ChannelStatus channels={data.channels} />}
            {menu === "test" && (
              <div className="space-y-3">
                <p className="text-sm text-muted">
                  Sandbox tools send only to you when you choose “send to me”. Reset demo restores the sample business. It does not message real customers.
                </p>
                <DemoClients data={data} onChanged={() => void load()} />
              </div>
            )}
            {menu === "log" && (
              <ul className="space-y-2">
                {(data.adminLog || []).length === 0 && <li className="text-sm text-muted">Nothing logged yet.</li>}
                {data.adminLog?.map((entry) => (
                  <li key={entry.id} className="sleek-card rounded-2xl p-3">
                    <p className="text-sm text-foreground">
                      {entry.kind === "automated" ? "Automated" : "Done"} · {entry.title}
                    </p>
                    <p className="mt-1 text-xs text-muted">{entry.detail}</p>
                    <p className="mt-1 text-xs text-muted">{formatNairobi(entry.at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function DemoClients({
  data,
  compact,
  onShowAll,
  onChanged,
}: {
  data: AdminView;
  compact?: boolean;
  onShowAll?: () => void;
  onChanged: () => void;
}) {
  const instances = data.sandbox?.instances || [];
  const named = data.demoClients || [];
  return (
    <section id="demo-clients" aria-labelledby="demo-clients-title" className="space-y-3 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="demo-clients-title" className="font-display text-lg font-semibold text-heading">
            Demo clients
          </h3>
          <p className="text-sm text-muted">
            {SANDBOX_BUSINESS} ({instances.length} automations)
            {named.length > 0 ? ` · ${named.map((item) => `${item.name} (${item.automations})`).join(" · ")}` : ""}. Sample data only.
          </p>
        </div>
        {compact && onShowAll && instances.length > 3 && (
          <button type="button" className="admin-btn" onClick={onShowAll}>
            All {instances.length} demo automations
          </button>
        )}
      </div>
      {instances.length === 0 && (
        <p className="text-sm text-muted">{SANDBOX_BUSINESS} has no automations yet. Reset demo seeds it again.</p>
      )}
      <DemoSandbox instances={compact ? instances.slice(0, 3) : instances} onChanged={onChanged} />
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="sleek-card rounded-2xl p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-lg text-foreground">{value}</p>
    </div>
  );
}
