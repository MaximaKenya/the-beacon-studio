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
  channels?: ChannelReadiness;
  actions?: ActionItem[];
  ops?: { lastTickAt?: string; lastTickOk?: boolean; lastTickError?: string };
  adminLog?: { id: string; at: string; kind: string; title: string; detail: string }[];
  invoices?: Invoice[];
  paystack?: boolean;
};

const empty: AdminView = { mrrKes: 0, active: 0, pending: 0, paused: 0, demos: 0, clients: [], sandbox: { instances: [] } };

const MENUS = [
  { id: "now", label: "Action Center" },
  { id: "trials", label: "Trials" },
  { id: "invoices", label: "Invoices" },
  { id: "clients", label: "Clients" },
  { id: "channels", label: "Channels" },
  { id: "scheduler", label: "Scheduler" },
  { id: "health", label: "Health" },
  { id: "leads", label: "Leads" },
  { id: "later", label: "Later" },
  { id: "test", label: "Test" },
  { id: "log", label: "Done" },
] as const;

export function AdminAutomations() {
  const [data, setData] = useState<AdminView | null>(null);
  const [email, setEmail] = useState("");
  const [menu, setMenu] = useState<(typeof MENUS)[number]["id"]>("now");
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/automations");
    if (!res.ok) return;
    const next = await parseResponseJson<AdminView>(res, empty);
    setData(next);
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
  const badge = (id: string) =>
    actions.filter((item) => item.blocking && item.count > 0 && (id === "now" ? true : item.menu === id)).reduce((sum, item) => sum + item.count, 0);
  const total = actions.filter((item) => item.blocking && item.count > 0).reduce((sum, item) => sum + item.count, 0);
  const visible = menu === "now" ? actions.filter((item) => item.blocking && item.count > 0) : actions.filter((item) => item.menu === menu);
  const selected = data?.clients.find((client) => client.email === email) || null;
  const tickOld = actions.some((item) => item.id === "tick");

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
        <p className="text-sm text-muted">Loading the action center…</p>
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
                      Open clients to extend
                    </button>
                  )}
                  {item.action === "open-invoices" && (
                    <button type="button" className="admin-btn mt-3" onClick={() => setMenu("invoices")}>
                      Review invoices
                    </button>
                  )}
                </article>
              ))}
            {menu === "now" && visible.length === 0 && <p className="text-sm text-muted">Nothing is waiting. The hourly tick keeps going.</p>}
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
                {data.sandbox && data.sandbox.instances.length > 0 && <DemoSandbox instances={data.sandbox.instances} onChanged={() => void load()} />}
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

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="sleek-card rounded-2xl p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-lg text-foreground">{value}</p>
    </div>
  );
}
