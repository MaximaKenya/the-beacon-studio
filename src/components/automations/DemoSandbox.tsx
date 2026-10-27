"use client";

import { useState } from "react";
import { templateById } from "@/automations/templates/public";
import { SANDBOX_BUSINESS, SANDBOX_OWNER, SETUP_GUIDES } from "@/lib/automations/setup-guides";
import type { SandboxStep } from "@/lib/automations/types";
import { siteConfig } from "@/data/site";
import { isPlaceholderContact } from "@/lib/launch";
import { parseResponseJson } from "@/lib/safe-json";
import type { DeskInstance } from "@/components/automations/AutomationDesk";

const KIND_LABEL: Record<SandboxStep["kind"], string> = {
  trigger: "Trigger",
  data: "Data used",
  ai: "AI output",
  preview: "What they would receive",
  note: "Status",
};

type RunResponse = { ok?: boolean; message?: string; steps?: SandboxStep[] };

export function DemoSandbox({
  instances,
  onChanged,
}: {
  instances: DeskInstance[];
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(instances[0]?.id ?? null);
  const [sendToMe, setSendToMe] = useState<Record<string, boolean>>({});
  const [runs, setRuns] = useState<Record<string, SandboxStep[]>>({});

  async function run(id: string) {
    setBusy(id);
    setNotice(null);
    setOpenId(id);
    const res = await fetch("/api/admin/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "run", sendToMe: Boolean(sendToMe[id]) }),
    });
    const data = await parseResponseJson<RunResponse>(res, {});
    setBusy(null);
    if (!res.ok || data.ok === false) {
      setNotice(data.message || "The run did not finish.");
      return;
    }
    setRuns((current) => ({ ...current, [id]: data.steps || [] }));
    setNotice(data.message || "Preview ready.");
    onChanged();
  }

  async function reset() {
    if (!window.confirm(`Reset ${SANDBOX_BUSINESS}? Sample leads, invoices, and bookings go back to the start.`)) return;
    setBusy("reset");
    setNotice(null);
    const res = await fetch("/api/admin/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-demo" }),
    });
    const data = await parseResponseJson<RunResponse>(res, {});
    setBusy(null);
    setRuns({});
    setNotice(data.message || "Demo reset.");
    onChanged();
  }

  const [demoName, setDemoName] = useState("Demo Clinic (sample data)");
  const [demoTemplates, setDemoTemplates] = useState("appointments, clinic-recall, reviews, faq-bot");
  const [demoLink, setDemoLink] = useState<string | null>(null);

  async function createDemo() {
    setBusy("create");
    setNotice(null);
    const templates = demoTemplates.split(",").map((item) => item.trim()).filter(Boolean);
    const res = await fetch("/api/admin/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-demo", name: demoName, templates }),
    });
    const data = await parseResponseJson<RunResponse & { viewUrl?: string }>(res, {});
    setBusy(null);
    setNotice(data.message || (res.ok ? "Demo client ready." : "Could not create the demo client."));
    setDemoLink(data.viewUrl || null);
    if (res.ok) onChanged();
  }

  const testHint = isPlaceholderContact(siteConfig.email)
    ? "Send to me has no studio email yet. Africa's Talking, WhatsApp, and marketing are not connected."
    : `Send to me delivers only to ${siteConfig.email}. Africa's Talking, WhatsApp, and marketing are not connected.`;

  return (
    <div className="space-y-4">
      <div className="sleek-card flex flex-wrap items-end justify-between gap-4 rounded-3xl p-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Demo client</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-heading">
            {SANDBOX_BUSINESS}
          </h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
            {SANDBOX_OWNER} in Industrial Area, Nairobi. Every automation is on, with sample leads, invoices, and bookings. Run now shows the preview. It does not message customers or take payment.
          </p>
          <p className="mt-2 text-xs text-muted">{testHint}</p>
        </div>
        <button type="button" className="admin-btn" disabled={busy === "reset"} onClick={() => void reset()}>
          {busy === "reset" ? "Resetting…" : "Reset demo"}
        </button>
      </div>
      <form
        className="sleek-card flex flex-wrap items-end gap-3 rounded-3xl p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void createDemo();
        }}
      >
        <div className="w-full">
          <h3 className="font-display text-lg font-semibold text-heading">New demo client</h3>
          <p className="mt-1 text-sm text-muted">Sample data for a sales call. Messages and payments stay blocked.</p>
        </div>
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-muted">
          Name
          <input className="w-full rounded-xl px-3 py-2 text-sm text-foreground" value={demoName} maxLength={80} onChange={(event) => setDemoName(event.target.value)} />
        </label>
        <label className="flex min-w-[16rem] flex-[2] flex-col gap-1 text-xs text-muted">
          Templates (ids, comma separated; empty = all)
          <input className="w-full rounded-xl px-3 py-2 text-sm text-foreground" value={demoTemplates} onChange={(event) => setDemoTemplates(event.target.value)} />
        </label>
        <button type="submit" className="admin-btn" disabled={busy === "create"}>
          {busy === "create" ? "Creating…" : "Create demo"}
        </button>
        {demoLink && (
          <a className="w-full text-sm text-accent underline" href={demoLink} target="_blank" rel="noreferrer">
            Open the read-only portal view
          </a>
        )}
      </form>
      {notice && <p className="text-sm text-muted">{notice}</p>}
      <div className="space-y-3">
        {instances.map((instance) => {
          const template = templateById(instance.templateId);
          const name = template?.name || instance.templateId;
          const open = openId === instance.id;
          const steps = runs[instance.id] || instance.lastRunView?.steps || [];
          return (
            <article key={instance.id} className="sleek-card rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button type="button" className="text-left" onClick={() => setOpenId(open ? null : instance.id)}>
                  <p className="font-display text-lg font-semibold text-heading">{name}</p>
                  <p className="mt-1 text-sm text-muted">{template?.outcome}</p>
                </button>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={Boolean(sendToMe[instance.id])}
                      onChange={(event) => setSendToMe((current) => ({ ...current, [instance.id]: event.target.checked }))}
                    />
                    Send to me
                  </label>
                  <button type="button" className="admin-btn" disabled={busy === instance.id} onClick={() => void run(instance.id)}>
                    {busy === instance.id ? "Running…" : "Run now"}
                  </button>
                </div>
              </div>
              {open && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-relaxed text-muted">
                    <span className="font-medium text-foreground">How to set this up for a client. </span>
                    {SETUP_GUIDES[instance.templateId] || "Collect the fields in setup, then activate after payment."}
                  </p>
                  {steps.length > 0 && (
                    <ol className="space-y-3">
                      {steps.map((step, index) => (
                        <li
                          key={step.id}
                          className="sandbox-step"
                          style={{ animationDelay: `${index * 90}ms` }}
                        >
                          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">{KIND_LABEL[step.kind]}</p>
                          <p className="mt-1 text-sm font-medium text-foreground">{step.title}</p>
                          {step.kind === "preview" ? (
                            <pre className="sleek-card mt-2 whitespace-pre-wrap rounded-2xl p-4 font-sans text-sm leading-relaxed text-foreground">{step.detail}</pre>
                          ) : (
                            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted">{step.detail}</pre>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
