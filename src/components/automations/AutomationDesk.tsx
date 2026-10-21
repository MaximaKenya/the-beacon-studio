"use client";

import { useState } from "react";
import Link from "next/link";
import { templateById } from "@/automations/templates/public";
import type { SandboxRunView } from "@/lib/automations/types";
import type { ChannelReadiness } from "@/lib/automations/channels";
import { formatKes, formatUsd } from "@/lib/fx";
import { formatNairobi } from "@/lib/time";
import { parseResponseJson } from "@/lib/safe-json";

export type DeskInstance = {
  id: string;
  templateId: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  businessName: string;
  status: "pending_payment" | "active" | "paused";
  config: Record<string, unknown>;
  monthlyKes: number;
  monthlyUsd: number;
  billing: "monthly" | "annual";
  periodEnd?: string;
  demo?: boolean;
  lastRunView?: SandboxRunView;
  stats: {
    runs: number;
    leads: number;
    messages: number;
    payments: number;
    reminders: number;
  };
  notes: { id: string; at: string; author: string; text: string }[];
  nextRun: string | null;
  hook: string;
  page: "book" | "review" | "rsvp" | "request" | null;
};

export type DeskLog = {
  id: string;
  instanceId: string;
  at: string;
  level: "info" | "error";
  message: string;
};

export type DeskCharge = {
  id: string;
  instanceId: string;
  name: string;
  amountKes: number;
  status: "unpaid" | "paid";
  dueDate?: string;
};

export type DeskLead = {
  id: string;
  instanceId: string;
  at: string;
  name: string;
  email?: string;
  phone?: string;
  summary?: string;
};

type ActionResult = { ok?: boolean; message?: string; error?: string };

export function AutomationDesk({
  instances,
  logs,
  charges,
  leads,
  endpoint,
  canActivate,
  channels,
  onChanged,
}: {
  instances: DeskInstance[];
  logs: DeskLog[];
  charges: DeskCharge[];
  leads: DeskLead[];
  endpoint: string;
  canActivate?: boolean;
  channels?: ChannelReadiness;
  onChanged: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(instances[0]?.id ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function act(id: string, action: string, extra?: Record<string, unknown>) {
    setBusy(id);
    setNotice(null);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, ...extra }),
    });
    const data = await parseResponseJson<ActionResult>(res, {});
    setBusy(null);
    if (!res.ok || data.ok === false) {
      setNotice(data.message || data.error || "That did not save.");
      return;
    }
    setNotice(data.message || "Saved.");
    onChanged();
  }

  if (instances.length === 0) {
    return (
      <div className="sleek-card rounded-2xl p-6">
        <p className="text-sm text-muted">No automations on this account yet.</p>
        <Link href="/automations" className="mt-3 inline-block text-sm text-accent hover:underline">
          Browse the buffet
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {channels && <p className="text-sm leading-relaxed text-muted">{channels.summary}</p>}
      {notice && <p className="text-sm text-muted">{notice}</p>}
      {instances.map((instance) => {
        const open = openId === instance.id;
        const name = templateById(instance.templateId)?.name || instance.templateId;
        const collected = charges
          .filter((charge) => charge.instanceId === instance.id && charge.status === "paid")
          .reduce((sum, charge) => sum + charge.amountKes, 0);
        return (
          <article key={instance.id} className="sleek-card rounded-2xl p-5 sm:p-6">
            <button
              type="button"
              className="flex w-full flex-wrap items-start justify-between gap-3 text-left"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : instance.id)}
            >
              <div>
                <p className="font-display text-lg font-semibold text-foreground">{name}</p>
                <p className="mt-1 text-sm text-muted">
                  {instance.businessName || instance.ownerName} · {instance.billing}
                  {instance.demo ? " · demo" : ""}
                </p>
              </div>
              <StatusPill status={instance.status} />
            </button>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Stat label="Monthly" value={formatKes(instance.monthlyKes)} hint={formatUsd(instance.monthlyUsd)} />
              <Stat label="Next run" value={instance.nextRun ? formatNairobi(instance.nextRun) : "—"} />
              <Stat label="Messages" value={String(instance.stats.messages)} />
              <Stat label="Collected" value={formatKes(collected)} hint={`${instance.stats.leads} leads`} />
            </dl>
            {open && (
              <InstanceDetail
                instance={instance}
                logs={logs.filter((log) => log.instanceId === instance.id)}
                charges={charges.filter((charge) => charge.instanceId === instance.id)}
                leads={leads.filter((lead) => lead.instanceId === instance.id)}
                busy={busy === instance.id}
                canActivate={Boolean(canActivate)}
                onAct={(action, extra) => void act(instance.id, action, extra)}
              />
            )}
          </article>
        );
      })}
    </div>
  );
}

function InstanceDetail({
  instance,
  logs,
  charges,
  leads,
  busy,
  canActivate,
  onAct,
}: {
  instance: DeskInstance;
  logs: DeskLog[];
  charges: DeskCharge[];
  leads: DeskLead[];
  busy: boolean;
  canActivate: boolean;
  onAct: (action: string, extra?: Record<string, unknown>) => void;
}) {
  const [configText, setConfigText] = useState(() => JSON.stringify(instance.config, null, 2));
  const [note, setNote] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);
  const publicPath = instance.page ? `/a/${instance.slug}/${instance.page}` : null;

  function saveConfig() {
    try {
      const config = JSON.parse(configText) as unknown;
      setConfigError(null);
      onAct("config", { config });
    } catch {
      setConfigError("Setup must be valid JSON.");
    }
  }

  return (
    <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
      <div className="flex flex-wrap gap-2">
        {instance.status === "active" && (
          <button type="button" disabled={busy} className="admin-btn" onClick={() => onAct("pause")}>
            Pause
          </button>
        )}
        {instance.status === "paused" && (
          <button type="button" disabled={busy} className="admin-btn" onClick={() => onAct("resume")}>
            Resume
          </button>
        )}
        {canActivate && instance.status === "pending_payment" && (
          <button type="button" disabled={busy} className="admin-btn" onClick={() => onAct("activate")}>
            Activate
          </button>
        )}
        <Link href="/automations" className="admin-btn">
          Add more
        </Link>
        {publicPath && (
          <Link href={publicPath} className="admin-btn">
            Public page
          </Link>
        )}
        {templateById(instance.templateId)?.behavior === "sequence" && (
          <button type="button" disabled={busy} className="admin-btn" onClick={() => onAct("stop")}>
            Stop follow-ups
          </button>
        )}
      </div>
      <p className="text-sm text-muted">
        Billing {instance.billing}
        {instance.periodEnd ? ` · renews ${formatNairobi(instance.periodEnd)}` : ""}
        {instance.hook !== "none" ? ` · hook /api/automations/hooks/${instance.hook}/${instance.slug}` : ""}
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <MiniList
          title="Run history"
          empty="No runs yet."
          rows={logs.slice(0, 8).map((log) => ({
            id: log.id,
            title: log.message,
            meta: `${log.level} · ${formatNairobi(log.at)}`,
          }))}
        />
        <MiniList
          title="Payments"
          empty="No payment links yet."
          rows={charges.slice(0, 8).map((charge) => ({
            id: charge.id,
            title: `${charge.name} · ${formatKes(charge.amountKes)} · ${charge.status}`,
            meta: charge.dueDate ? `Due ${charge.dueDate}` : "",
          }))}
        />
        <MiniList
          title="Leads"
          empty="No leads yet."
          rows={leads.slice(0, 8).map((lead) => ({
            id: lead.id,
            title: lead.name,
            meta: [lead.email, lead.phone, lead.summary].filter(Boolean).join(" · "),
          }))}
        />
        <div>
          <h3 className="text-sm font-medium text-foreground">Notes</h3>
          <ul className="mt-2 space-y-2">
            {instance.notes.length === 0 && <li className="text-sm text-muted">No notes.</li>}
            {instance.notes.slice(-6).map((item) => (
              <li key={item.id} className="text-sm text-foreground">
                {item.text}
                <span className="mt-0.5 block font-mono text-[10px] text-muted">
                  {item.author} · {formatNairobi(item.at)}
                </span>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!note.trim()) return;
              onAct("note", { text: note.trim() });
              setNote("");
            }}
          >
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a note"
              className="min-w-0 flex-1 rounded-xl bg-background/60 px-3 py-2 text-sm text-foreground"
            />
            <button type="submit" className="admin-btn" disabled={busy}>
              Save
            </button>
          </form>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-foreground">Setup</h3>
        <textarea
          value={configText}
          onChange={(event) => setConfigText(event.target.value)}
          rows={8}
          spellCheck={false}
          className="mt-2 w-full rounded-xl bg-background/60 px-3 py-2 font-mono text-xs text-foreground"
        />
        {configError && <p className="mt-2 text-sm text-muted">{configError}</p>}
        <button type="button" className="admin-btn mt-2" disabled={busy} onClick={saveConfig}>
          Save setup
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: DeskInstance["status"] }) {
  const label = status === "pending_payment" ? "Awaiting payment" : status === "active" ? "Active" : "Paused";
  return <span className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">{label}</span>;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
      {hint && <dd className="text-xs text-muted">{hint}</dd>}
    </div>
  );
}

function MiniList({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: { id: string; title: string; meta: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <ul className="mt-2 space-y-2">
        {rows.length === 0 && <li className="text-sm text-muted">{empty}</li>}
        {rows.map((row) => (
          <li key={row.id} className="text-sm text-foreground">
            {row.title}
            {row.meta && <span className="mt-0.5 block text-xs text-muted">{row.meta}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
