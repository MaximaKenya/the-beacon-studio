"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { parseResponseJson } from "@/lib/safe-json";
import type { Milestone, ProjectRecord, ProjectStatus } from "@/lib/projects";
import { ChatPanel } from "@/components/portal/ChatPanel";
import { formatNairobi } from "@/lib/time";

type ClientRow = { id: string; name: string; email: string; company?: string };

const STATUSES: ProjectStatus[] = ["intake", "quoted", "active", "paused", "completed", "cancelled"];

function blankMilestones(): Milestone[] {
  return [
    { id: crypto.randomUUID(), title: "Discovery & scope", percent: 15, done: false },
    { id: crypto.randomUUID(), title: "Design & architecture", percent: 25, done: false },
    { id: crypto.randomUUID(), title: "Build & weekly demos", percent: 40, done: false },
    { id: crypto.randomUUID(), title: "Launch & handoff", percent: 20, done: false },
  ];
}

function milestoneTotal(milestones: Milestone[]): number {
  return Math.min(100, Math.round(milestones.filter((item) => item.done).reduce((sum, item) => sum + item.percent, 0)));
}

function isOpen(project: ProjectRecord): boolean {
  return project.status !== "completed" && project.status !== "cancelled";
}

/**
 * Admin project desk — create and update client work, then show every open project.
 * Saved through /api/admin/ops into projects.json (Postgres app_documents when DATABASE_URL is set).
 */
export function AdminProjectsPanel() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [selected, setSelected] = useState<ProjectRecord | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [nextPaymentDate, setNextPaymentDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [progress, setProgress] = useState(0);
  const [progressTouched, setProgressTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const clientName = useMemo(() => {
    const map = new Map(clients.map((client) => [client.id, client.name]));
    return (id: string) => map.get(id) ?? "Client";
  }, [clients]);

  const visible = projects.filter((project) => showClosed || isOpen(project));
  const active = projects.filter(isOpen);

  async function load() {
    const res = await fetch("/api/admin/ops");
    const data = await parseResponseJson<{ projects?: ProjectRecord[]; clients?: ClientRow[] }>(res, {});
    if (data.projects) setProjects(data.projects);
    if (data.clients) setClients(data.clients);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  function applyMilestones(next: Milestone[], keepPercent = progressTouched) {
    setMilestones(next);
    if (!keepPercent) setProgress(milestoneTotal(next));
  }

  function select(project: ProjectRecord) {
    setCreating(false);
    setSelected(project);
    setTitle(project.title);
    setBrief(project.brief);
    setMilestones(project.milestones.map((item) => ({ ...item })));
    setNextPaymentDate(project.nextPaymentDate?.slice(0, 10) ?? "");
    setStartDate(project.startDate?.slice(0, 10) ?? "");
    setTargetDate(project.targetDate?.slice(0, 10) ?? "");
    setStatus(project.status);
    setProgress(project.progressPercent);
    setProgressTouched(false);
    setAdminNotes(project.adminNotes ?? "");
    setUpdateMessage("");
    setMsg(null);
  }

  function startCreate() {
    const seed = blankMilestones();
    setCreating(true);
    setSelected(null);
    setClientId("");
    setName("");
    setEmail("");
    setCompany("");
    setTitle("");
    setBrief("");
    setMilestones(seed);
    setStartDate("");
    setTargetDate("");
    setNextPaymentDate("");
    setStatus("active");
    setProgress(0);
    setProgressTouched(false);
    setAdminNotes("");
    setUpdateMessage("");
    setMsg(null);
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    const payload = creating
      ? {
          action: "project.create",
          clientId: clientId || undefined,
          name,
          email,
          company,
          title,
          brief,
          status,
          milestones,
          progressPercent: progress,
          adminNotes,
          startDate,
          targetDate,
          updateMessage,
        }
      : {
          action: "project.update",
          id: selected?.id,
          title,
          brief,
          milestones,
          nextPaymentDate: nextPaymentDate
            ? new Date(nextPaymentDate + "T12:00:00+03:00").toISOString()
            : undefined,
          startDate,
          targetDate,
          status,
          progressPercent: progress,
          adminNotes,
          updateMessage: updateMessage.trim() || undefined,
        };
    const res = await fetch("/api/admin/ops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await parseResponseJson<{ error?: string; project?: ProjectRecord }>(res, {});
    setBusy(false);
    if (!res.ok || !data.project) {
      setMsg(data.error || "Save failed");
      return;
    }
    setMsg(creating ? "Project created. The client can see it in the portal." : "Saved. The client portal refreshes on its own.");
    setCreating(false);
    setUpdateMessage("");
    select(data.project);
    await load();
  }

  return (
    <div id="projects" className="admin-panel admin-section space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="admin-kicker">Portal sync</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-heading">Client projects</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {active.length} active. Status, stages, percent complete, notes, and dates are stored with the project.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowClosed((value) => !value)} className="admin-btn">
            {showClosed ? "Hide closed" : "Show closed"}
          </button>
          <button type="button" onClick={startCreate} className="admin-btn">
            <Plus className="h-4 w-4" />
            New project
          </button>
        </div>
      </div>

      {active.length === 0 ? (
        <p className="text-sm text-muted">No active projects yet.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {active.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => select(project)}
                className={`sleek-card w-full rounded-2xl p-4 text-left ${selected?.id === project.id ? "choice-selected" : ""}`}
              >
                <span className="block font-medium text-foreground">{project.title}</span>
                <span className="mt-1 block text-xs text-muted">
                  {clientName(project.clientId)} · {project.status}
                </span>
                <span className="mt-3 block h-2 overflow-hidden rounded-full bg-background/70">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${project.progressPercent}%` }} />
                </span>
                <span className="mt-2 block text-xs text-muted">
                  {project.progressPercent}% complete
                  {project.targetDate ? ` · target ${project.targetDate.slice(0, 10)}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {(creating || selected) && (
        <div className="space-y-4 rounded-2xl bg-background/35 p-4 shadow-[0_12px_28px_rgba(8,4,20,0.16)]">
          <h4 className="font-display text-lg font-semibold text-heading">
            {creating ? "New project" : "Update project"}
          </h4>

          {creating && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                Existing client
                <select value={clientId} onChange={(event) => setClientId(event.target.value)} className="field mt-1 h-10 px-3 text-sm">
                  <option value="">New client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} · {client.email}
                    </option>
                  ))}
                </select>
              </label>
              {!clientId && (
                <>
                  <label className="block text-xs text-muted">
                    Client name
                    <input value={name} onChange={(event) => setName(event.target.value)} className="field mt-1 h-10 px-3 text-sm" />
                  </label>
                  <label className="block text-xs text-muted">
                    Email
                    <input value={email} type="email" onChange={(event) => setEmail(event.target.value)} className="field mt-1 h-10 px-3 text-sm" />
                  </label>
                  <label className="block text-xs text-muted">
                    Company
                    <input value={company} onChange={(event) => setCompany(event.target.value)} className="field mt-1 h-10 px-3 text-sm" />
                  </label>
                </>
              )}
            </div>
          )}

          <label className="block text-xs text-muted">
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="field mt-1 h-10 px-3 text-sm" />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs text-muted">
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as ProjectStatus)}
                className="field mt-1 h-10 px-3 text-sm"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-muted">
              Percent complete
              <input
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(event) => {
                  setProgressTouched(true);
                  setProgress(Number(event.target.value));
                }}
                className="field mt-1 h-10 px-3 text-sm"
              />
            </label>
            <label className="block text-xs text-muted">
              Start
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="field mt-1 h-10 px-3 text-sm" />
            </label>
            <label className="block text-xs text-muted">
              Target
              <input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} className="field mt-1 h-10 px-3 text-sm" />
            </label>
          </div>

          {!creating && (
            <label className="block text-xs text-muted">
              Next payment
              <input
                type="date"
                value={nextPaymentDate}
                onChange={(event) => setNextPaymentDate(event.target.value)}
                className="field mt-1 h-10 max-w-xs px-3 text-sm"
              />
            </label>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Stages</p>
            <button
              type="button"
              className="text-xs font-semibold text-accent"
              onClick={() => {
                setProgressTouched(false);
                setProgress(milestoneTotal(milestones));
              }}
            >
              Use milestone total
            </button>
          </div>
          <ul className="space-y-2">
            {milestones.map((item, index) => (
              <li key={item.id} className="grid gap-2 rounded-2xl bg-background/50 p-3 sm:grid-cols-[auto_1fr_5rem_8rem_auto]">
                <input
                  type="checkbox"
                  checked={item.done}
                  aria-label={`${item.title} done`}
                  onChange={(event) => {
                    const next = milestones.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, done: event.target.checked } : row
                    );
                    applyMilestones(next);
                  }}
                />
                <input
                  value={item.title}
                  aria-label="Stage title"
                  onChange={(event) => {
                    const next = milestones.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, title: event.target.value } : row
                    );
                    applyMilestones(next, true);
                  }}
                  className="field h-10 px-3 text-sm"
                />
                <input
                  type="number"
                  value={item.percent}
                  aria-label="Stage percent"
                  onChange={(event) => {
                    const next = milestones.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, percent: Number(event.target.value) } : row
                    );
                    applyMilestones(next);
                  }}
                  className="field h-10 px-3 text-sm"
                />
                <input
                  type="date"
                  value={item.dueDate?.slice(0, 10) ?? ""}
                  aria-label="Stage date"
                  onChange={(event) => {
                    const next = milestones.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, dueDate: event.target.value } : row
                    );
                    applyMilestones(next, true);
                  }}
                  className="field h-10 px-3 text-sm"
                />
                <button
                  type="button"
                  className="text-xs font-semibold text-muted"
                  onClick={() => applyMilestones(milestones.filter((_, rowIndex) => rowIndex !== index))}
                >
                  Remove
                </button>
                <input
                  value={item.note ?? ""}
                  placeholder="Stage note"
                  onChange={(event) => {
                    const next = milestones.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, note: event.target.value } : row
                    );
                    applyMilestones(next, true);
                  }}
                  className="field h-10 px-3 text-sm sm:col-span-4"
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="text-sm font-semibold text-accent"
            onClick={() =>
              applyMilestones([
                ...milestones,
                { id: crypto.randomUUID(), title: "New stage", percent: 0, done: false },
              ], true)
            }
          >
            Add a stage
          </button>

          <label className="block text-xs text-muted">
            Notes
            <textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} rows={3} className="field mt-1 px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs text-muted">
            Brief
            <textarea value={brief} onChange={(event) => setBrief(event.target.value)} rows={3} className="field mt-1 px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs text-muted">
            Update for the client timeline
            <textarea
              value={updateMessage}
              onChange={(event) => setUpdateMessage(event.target.value)}
              rows={2}
              placeholder="What changed since the last update?"
              className="field mt-1 px-3 py-2 text-sm"
            />
          </label>

          {selected && selected.updates.length > 0 && (
            <ol className="space-y-2">
              {selected.updates.map((update) => (
                <li key={update.id} className="text-sm text-foreground">
                  {update.message}
                  <span className="mt-0.5 block text-xs text-muted">
                    {formatNairobi(update.at)} · {update.by}
                  </span>
                </li>
              ))}
            </ol>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {creating ? "Create project" : "Save to portal"}
          </button>
          {msg && <p className="text-xs text-muted">{msg}</p>}

          {selected && <ChatPanel projectId={selected.id} viewer="admin" />}
        </div>
      )}

      {visible.length > active.length && showClosed && (
        <ul className="space-y-2">
          {visible
            .filter((project) => !isOpen(project))
            .map((project) => (
              <li key={project.id}>
                <button type="button" onClick={() => select(project)} className="text-left text-sm text-muted">
                  {project.title} · {project.status} · {project.progressPercent}%
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
