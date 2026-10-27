"use client";

import { useState } from "react";
import Link from "next/link";
import { templateById, type EntryColumn } from "@/automations/templates/public";
import type { SandboxRunView } from "@/lib/automations/types";
import type { ChannelReadiness } from "@/lib/automations/channels";
import { automationChecklist, checklistProgress } from "@/lib/automations/checklist";
import { forwardingAddress } from "@/lib/automations/forwarding";
import type { InputRow } from "@/lib/automations/inputs";
import { TRIAL_DAYS, trialDaysRemaining } from "@/lib/automations/trial";
import { formatKes, formatUsd } from "@/lib/fx";
import { formatNairobi } from "@/lib/time";
import { parseResponseJson } from "@/lib/safe-json";
import { HowItWorksCard } from "@/components/automations/HowItWorksCard";
import { InputsEditor } from "@/components/automations/InputsEditor";
import { ProgressRing } from "@/components/automations/Charts";

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
  trial?: { start: string; endsAt: string; endedAt?: string; paidUntil?: string; remindersSent: number[] };
  inputsUpdatedAt?: string;
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

export function ChannelStatus({ channels }: { channels: ChannelReadiness }) {
  const items = [
    ["Email", channels.email === "ready" ? "ready" : "not configured"],
    ["Africa's Talking", channels.sms],
    ["WhatsApp", channels.whatsapp],
    ["Marketing", channels.marketing],
    ["Groq", channels.groq === "ready" ? "ready" : "not configured"],
  ] as const;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(([label, state]) => (
        <li key={label} className="sleek-card rounded-full px-3 py-1 text-xs text-muted">
          {label} · {state}
        </li>
      ))}
    </ul>
  );
}

export function AutomationDesk({
  instances,
  logs,
  charges,
  leads,
  endpoint,
  canActivate,
  onChanged,
}: {
  instances: DeskInstance[];
  logs: DeskLog[];
  charges: DeskCharge[];
  leads: DeskLead[];
  endpoint: string;
  canActivate?: boolean;
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
              <div className="text-right">
                <StatusPill status={instance.status} />
                <p className="mt-1 text-xs text-muted">{instance.nextRun ? `Next ${formatNairobi(instance.nextRun)}` : "No run queued"}</p>
              </div>
            </button>
            <p className="mt-3 text-sm text-muted">
              Last result: {logs.find((log) => log.instanceId === instance.id)?.message || "No run yet."}
            </p>
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
        {canActivate && instance.trial && (
          <>
            <button type="button" disabled={busy} className="admin-btn" onClick={() => onAct("extend-trial", { days: 14 })}>
              Extend trial 14 days
            </button>
            <button type="button" disabled={busy} className="admin-btn" onClick={() => onAct("end-trial")}>
              End trial
            </button>
          </>
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
      <TrialLine instance={instance} onAct={onAct} />
      <HowItWorksCard templateId={instance.templateId} />
      <Checklist instance={instance} onAct={onAct} />
      <ShareLinks instance={instance} onAct={onAct} />
      <CaptureTools instance={instance} busy={busy} onAct={onAct} />
      <p className="text-sm text-muted">
        Billing {instance.billing}
        {instance.periodEnd ? ` · through ${formatNairobi(instance.periodEnd)}` : ""}
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
        <div>
          <h3 className="text-sm font-medium text-foreground">Payments</h3>
          <ul className="mt-2 space-y-2">
            {charges.length === 0 && <li className="text-sm text-muted">No ledger rows yet.</li>}
            {charges.slice(0, 12).map((charge) => (
              <li key={charge.id} className="flex flex-wrap items-center justify-between gap-2 text-sm text-foreground">
                <span>
                  {charge.name} · {formatKes(charge.amountKes)} · {charge.status}
                  {charge.dueDate ? <span className="mt-0.5 block text-xs text-muted">Due {charge.dueDate}</span> : null}
                </span>
                <span className="flex gap-2">
                  <a className="text-xs text-accent" href={`/api/automations/receipt/${charge.id}`}>
                    Invoice
                  </a>
                  {charge.status === "unpaid" && (
                    <button type="button" className="text-xs text-accent" disabled={busy} onClick={() => onAct("mark-paid", { chargeId: charge.id })}>
                      Mark paid
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
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
      <LedgerInputs instance={instance} busy={busy} onAct={onAct} />
      <div>
        <h3 className="text-sm font-medium text-foreground">Setup JSON</h3>
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

function TrialLine({ instance, onAct }: { instance: DeskInstance; onAct: (action: string, extra?: Record<string, unknown>) => void }) {
  if (!instance.trial) return null;
  const days = trialDaysRemaining(instance.trial.endsAt);
  if (instance.trial.endedAt && instance.status === "paused") {
    return (
      <div className="sleek-card rounded-2xl p-4">
        <p className="text-sm font-medium text-foreground">Trial ended</p>
        <p className="mt-1 text-sm text-muted">Choose a plan or request an invoice. Nothing was deleted.</p>
        <button type="button" className="admin-btn mt-3" onClick={() => onAct("request-invoice")}>
          Request invoice
        </button>
      </div>
    );
  }
  return (
    <p className="text-sm text-foreground">
      {days} day{days === 1 ? "" : "s"} remaining · {TRIAL_DAYS}-day free trial
      {instance.trial.paidUntil ? ` · paid through ${formatNairobi(instance.trial.paidUntil)}` : ""}
    </p>
  );
}

function Checklist({ instance, onAct }: { instance: DeskInstance; onAct: (action: string, extra?: Record<string, unknown>) => void }) {
  const items = automationChecklist(instance);
  return (
    <div className="flex gap-4">
      <ProgressRing progress={checklistProgress(items)} />
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id} className="text-foreground">
            <span className={item.done ? "text-muted" : ""}>{item.done ? "Done · " : "Next · "}{item.label}</span>
            {!item.done && item.id.startsWith("share") && (
              <button type="button" className="ml-2 text-xs text-accent" onClick={() => onAct("shared", { key: item.id.replace("share-", "") })}>
                I shared it
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShareLinks({ instance, onAct }: { instance: DeskInstance; onAct: (action: string, extra?: Record<string, unknown>) => void }) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const template = templateById(instance.templateId);
  const page = template?.hook === "lead" ? "lead" : instance.page;
  const links: { label: string; value: string; key: string }[] = [];
  if (page) {
    links.push({ label: "Hosted form", value: `${origin}/a/${instance.slug}/${page}`, key: page === "book" ? "book" : page === "review" ? "review" : "lead" });
    links.push({
      label: "Embed",
      value: `<iframe title="${instance.businessName}" src="${origin}/a/${instance.slug}/${page}" style="width:100%;max-width:480px;height:640px;border:0;border-radius:24px"></iframe>`,
      key: "embed",
    });
    links.push({ label: "Script", value: `<script src="${origin}/api/automations/embed/${instance.slug}"></script>`, key: "script" });
  }
  if (instance.hook !== "none") {
    links.push({ label: "Webhook", value: `${origin}/api/automations/hooks/${instance.hook}/${instance.slug}`, key: "hook" });
  }
  if (template?.behavior === "inbox-triage") links.push({ label: "Forward mail", value: forwardingAddress(instance.slug, "inbox"), key: "inbox" });
  if (template?.behavior === "meeting-notes") links.push({ label: "Forward notes", value: forwardingAddress(instance.slug, "notes"), key: "notes" });
  if (links.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Share</h3>
      {links.map((link) => (
        <div key={link.label} className="flex flex-col gap-1 sm:flex-row sm:items-center">
          <span className="w-28 shrink-0 text-xs text-muted">{link.label}</span>
          <code className="min-w-0 flex-1 truncate text-xs text-foreground">{link.value}</code>
          <button
            type="button"
            className="admin-btn"
            onClick={() => {
              void navigator.clipboard.writeText(link.value);
              onAct("shared", { key: link.key });
            }}
          >
            Copy
          </button>
        </div>
      ))}
    </div>
  );
}

function CaptureTools({
  instance,
  busy,
  onAct,
}: {
  instance: DeskInstance;
  busy: boolean;
  onAct: (action: string, extra?: Record<string, unknown>) => void;
}) {
  const template = templateById(instance.templateId);
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  if (template?.behavior !== "inbox-triage" && template?.behavior !== "meeting-notes") return null;
  const notes = template.behavior === "meeting-notes";
  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        onAct(notes ? "notes" : "inbox", notes ? { notes: text, text } : { from: "pasted", subject, body: text, message: text });
        setText("");
      }}
    >
      <h3 className="text-sm font-medium text-foreground">{notes ? "Paste meeting notes" : "Paste an email"}</h3>
      {!notes && (
        <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" className="field h-10 w-full px-3 text-sm" />
      )}
      <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder={notes ? "Notes" : "Email body"} className="field w-full px-3 py-2 text-sm" />
      <button type="submit" className="admin-btn" disabled={busy || !text.trim()}>
        {notes ? "Summarize" : "Draft a reply"}
      </button>
    </form>
  );
}

function LedgerInputs({
  instance,
  busy,
  onAct,
}: {
  instance: DeskInstance;
  busy: boolean;
  onAct: (action: string, extra?: Record<string, unknown>) => void;
}) {
  const field = templateById(instance.templateId)?.fields.find((item) => item.type === "entries");
  if (!field?.columns) return null;
  const rows = Array.isArray(instance.config.entries) ? (instance.config.entries as InputRow[]) : [];
  return (
    <InputsEditor
      columns={field.columns as EntryColumn[]}
      rows={rows}
      updatedAt={instance.inputsUpdatedAt ? formatNairobi(instance.inputsUpdatedAt) : undefined}
      busy={busy}
      onSave={(next) => onAct("config", { config: { ...instance.config, entries: next, csv: "" } })}
    />
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
