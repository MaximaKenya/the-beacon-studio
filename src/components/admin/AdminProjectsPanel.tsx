"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { parseResponseJson } from "@/lib/safe-json";
import type { Milestone, ProjectRecord } from "@/lib/projects";
import { ChatPanel } from "@/components/portal/ChatPanel";

/**
 * Admin project editor — milestones, next payment, updates → live on /portal.
 */
export function AdminProjectsPanel() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selected, setSelected] = useState<ProjectRecord | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [nextPaymentDate, setNextPaymentDate] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/ops");
    const data = await parseResponseJson<{ projects?: ProjectRecord[] }>(res, {});
    if (data.projects) setProjects(data.projects);
  }

  useEffect(() => {
    void load();
  }, []);

  function select(p: ProjectRecord) {
    setSelected(p);
    setMilestones(p.milestones.map((m) => ({ ...m })));
    setNextPaymentDate(p.nextPaymentDate?.slice(0, 10) ?? "");
    setStatus(p.status);
    setUpdateMessage("");
    setMsg(null);
  }

  async function save() {
    if (!selected) return;
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/ops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "project.update",
        id: selected.id,
        milestones,
        nextPaymentDate: nextPaymentDate
          ? new Date(nextPaymentDate + "T12:00:00+03:00").toISOString()
          : undefined,
        status,
        updateMessage: updateMessage.trim() || undefined,
      }),
    });
    const data = await parseResponseJson<{ error?: string; project?: ProjectRecord }>(res, {});
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Save failed");
      return;
    }
    setMsg("Saved — client portal will refresh within a few seconds.");
    if (data.project) {
      setSelected(data.project);
      setMilestones(data.project.milestones.map((m) => ({ ...m })));
    }
    await load();
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface/40 p-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Portal sync
        </p>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Client projects
        </h3>
        <p className="mt-1 text-sm text-muted">
          Edit milestones, payment dates, and updates. Clients see changes on refresh.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">
          No projects yet — convert an intake or wait for a Start a Project submission.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => select(p)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-xs ${
                    selected?.id === p.id
                      ? "border-accent/50 bg-accent/10"
                      : "border-border/60 bg-background/30"
                  }`}
                >
                  <span className="line-clamp-2 font-medium text-foreground">{p.title}</span>
                  <span className="mt-0.5 block font-mono text-[9px] text-muted">
                    {p.status} · {p.progressPercent}%
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <label className="text-xs text-muted">
                  Status
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="ml-2 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                  >
                    {["intake", "quoted", "active", "paused", "completed", "cancelled"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </label>
                <label className="text-xs text-muted">
                  Next payment
                  <input
                    type="date"
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className="ml-2 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                  />
                </label>
              </div>

              <ul className="space-y-2">
                {milestones.map((m, i) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={m.done}
                      onChange={(e) => {
                        const next = [...milestones];
                        next[i] = { ...m, done: e.target.checked };
                        setMilestones(next);
                      }}
                    />
                    <input
                      value={m.title}
                      onChange={(e) => {
                        const next = [...milestones];
                        next[i] = { ...m, title: e.target.value };
                        setMilestones(next);
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      value={m.percent}
                      onChange={(e) => {
                        const next = [...milestones];
                        next[i] = { ...m, percent: Number(e.target.value) };
                        setMilestones(next);
                      }}
                      className="w-16 rounded-lg border border-border bg-background px-2 py-1 font-mono text-sm"
                    />
                  </li>
                ))}
              </ul>

              <textarea
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                rows={2}
                placeholder="Optional timeline update for the client…"
                className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm"
              />

              <button
                type="button"
                disabled={busy}
                onClick={() => void save()}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save to portal
              </button>
              {msg && <p className="text-xs text-muted">{msg}</p>}

              <ChatPanel projectId={selected.id} viewer="admin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
