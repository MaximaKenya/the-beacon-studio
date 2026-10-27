"use client";

import { useEffect, useMemo, useState, type ComponentType, type FormEvent } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  Lock,
  LogOut,
  MousePointerClick,
  Smile,
  Sparkles,
} from "lucide-react";
import { siteConfig } from "@/data/site";
import type { AnalyticsSummary } from "@/lib/analytics-store";
import {
  AnimatedBarChart,
  AnimatedFunnel,
  AnimatedLineChart,
  AnimatedPieChart,
} from "@/components/admin/AdminCharts";
import { AdminPdfExport } from "@/components/admin/AdminPdfExport";
import { AdminInbox } from "@/components/admin/AdminInbox";
import { AdminLeads } from "@/components/admin/AdminLeads";
import { AdminMailbox } from "@/components/admin/AdminMailbox";
import { AdminMessagingHub } from "@/components/admin/AdminMessagingHub";
import { AdminOpsHub, type AdminOpsData } from "@/components/admin/AdminOpsHub";
import { AdminProjectsPanel } from "@/components/admin/AdminProjectsPanel";
import { AdminAutomations } from "@/components/automations/AdminAutomations";
import { parseResponseJson } from "@/lib/safe-json";

const ADMIN_NAV = [
  { id: "actions", label: "Action Center" },
  { id: "mailbox", label: "Mail" },
  { id: "inbox", label: "Inbox" },
  { id: "leads", label: "Leads" },
  { id: "operations", label: "Operations" },
  { id: "projects", label: "Projects" },
  { id: "messaging", label: "Messaging hub" },
  { id: "analytics", label: "Analytics" },
] as const;
import { formatKes, formatUsd } from "@/lib/fx";
import type { StudioKpis } from "@/lib/lead-kpis";

type StorageHealth = {
  ok?: boolean;
  storage?: "postgres" | "file";
  database?: "up" | "down" | "unconfigured";
};

function StorageBadge({ health }: { health: StorageHealth | null }) {
  if (!health?.storage) return null;
  const backend = health.storage === "postgres" ? "Postgres" : "JSON files";
  const detail =
    health.database === "up"
      ? "connected"
      : health.database === "down"
        ? "unreachable"
        : "local dev";
  return (
    <p className="admin-kicker mt-2">
      Storage · {backend} · {detail}
    </p>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="admin-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="admin-kicker">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-heading">{value}</p>
          {hint && <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState<"loading" | "in" | "out">("loading");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [ops, setOps] = useState<AdminOpsData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [storageHealth, setStorageHealth] = useState<StorageHealth | null>(null);
  const [kpis, setKpis] = useState<StudioKpis | null>(null);
  const [activeSection, setActiveSection] = useState<string>(ADMIN_NAV[0].id);
  const [mailUnread, setMailUnread] = useState(0);
  const [actionCount, setActionCount] = useState(0);

  const wingLabels = useMemo(() => {
    const map = new Map(siteConfig.products.map((p) => [p.id, p.name]));
    return map;
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/auth", { cache: "no-store" });
      const data = await parseResponseJson<{ authenticated?: boolean }>(res, {});
      setAuth(data.authenticated ? "in" : "out");
    } catch {
      setAuth("out");
    }
  }

  async function loadStats() {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.status === 401) {
        setAuth("out");
        return;
      }
      const data = await parseResponseJson<{
        summary?: AnalyticsSummary;
        updatedAt?: string;
        ops?: AdminOpsData;
        kpis?: StudioKpis;
      }>(res, {});
      if (data.summary) setSummary(data.summary);
      if (data.ops) setOps(data.ops);
      if (data.kpis) setKpis(data.kpis);
      setUpdatedAt(data.updatedAt ?? null);
    } finally {
      setLoadingStats(false);
    }
  }

  async function markRead(collection: string, id?: string, markAll?: boolean) {
    await fetch("/api/admin/stats", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection, id, markAll }),
    });
    await loadStats();
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void checkAuth();
      void fetch("/api/health")
        .then((res) => parseResponseJson<StorageHealth>(res, {}))
        .then((data) => setStorageHealth(data))
        .catch(() => setStorageHealth(null));
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    function onUnread(event: Event) {
      const unread = (event as CustomEvent<{ unread?: number }>).detail?.unread;
      if (typeof unread === "number") setMailUnread(unread);
    }
    window.addEventListener("beacon-mail-unread", onUnread);
    return () => window.removeEventListener("beacon-mail-unread", onUnread);
  }, []);

  useEffect(() => {
    if (auth !== "in") return;
    const handle = window.setTimeout(() => {
      void loadStats();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [auth]);

  useEffect(() => {
    if (auth !== "in") return;
    const known = new Set<string>(ADMIN_NAV.map((item) => item.id));
    const applyHash = () => {
      const next = window.location.hash.replace("#", "");
      if (known.has(next)) setActiveSection(next);
    };
    const frame = window.requestAnimationFrame(applyHash);

    const nodes = ADMIN_NAV.map((item) => document.getElementById(item.id)).filter(
      (node): node is HTMLElement => Boolean(node)
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target.id && known.has(hit.target.id)) setActiveSection(hit.target.id);
      },
      { rootMargin: "-28% 0px -52% 0px", threshold: [0.15, 0.35, 0.6] }
    );
    nodes.forEach((node) => observer.observe(node));

    window.addEventListener("hashchange", applyHash);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("hashchange", applyHash);
    };
  }, [auth, ops, summary]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ password }),
    });
    const data = await parseResponseJson<{ error?: string }>(res, {});
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    setPassword("");
    const session = await fetch("/api/admin/auth", { cache: "no-store" });
    const sessionData = await parseResponseJson<{ authenticated?: boolean }>(session, {});
    if (!sessionData.authenticated) {
      setError("Password accepted, but the browser did not keep the session. Open the site over HTTPS and try again.");
      setAuth("out");
      return;
    }
    setAuth("in");
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE", cache: "no-store" });
    setAuth("out");
    setSummary(null);
  }

  if (auth === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 pt-28">
        <p className="text-sm text-muted">Checking session…</p>
      </div>
    );
  }

  if (auth === "out") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 pt-24 pb-16">
        <div className="admin-panel p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/12 text-accent">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <p className="admin-kicker">Studio</p>
              <h1 className="font-display text-2xl font-semibold text-heading">Sign in</h1>
            </div>
          </div>
          <p className="mb-5 text-sm leading-relaxed text-muted">
            Mail, leads, client projects, and site analytics.
          </p>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label htmlFor="admin-pin" className="mb-1.5 block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="admin-pin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-accent-warm" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-accent text-sm font-semibold text-background hover:bg-accent-hover"
            >
              Enter admin
            </button>
          </form>
          <StorageBadge health={storageHealth} />
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Uses the <code className="font-mono text-foreground">ADMIN_PASSWORD</code> environment
            variable.
          </p>
        </div>
      </div>
    );
  }

  const reactionSlices = summary
    ? Object.entries(summary.reactions.counts).map(([label, value], i) => ({
        label,
        value,
        color: ["#0f766e", "#4338ca", "#be123c", "#b45309", "#64748b", "#0ea5e9", "#a855f7"][
          i % 7
        ],
      }))
    : [];

  const sentimentSlices = summary
    ? [
        {
          label: "Positive",
          value: summary.reactions.sentiment.positive,
          color: "#0f766e",
        },
        {
          label: "Neutral",
          value: summary.reactions.sentiment.neutral,
          color: "#64748b",
        },
        {
          label: "Negative",
          value: summary.reactions.sentiment.negative,
          color: "#be123c",
        },
      ]
    : [];

  return (
    <div className="px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="admin-kicker">{siteConfig.brand.name}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-heading">
              Overview
            </h1>
            <StorageBadge health={storageHealth} />
            {updatedAt && (
              <p className="mt-1 text-xs text-muted">
                Updated {new Date(updatedAt).toLocaleString()}
                {loadingStats ? " · refreshing…" : ""}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {summary && <AdminPdfExport summary={summary} />}
            <a href="/api/admin/stats?export=csv" className="admin-btn">
              Export leads CSV
            </a>
            <a href="/api/admin/stats?export=json" className="admin-btn">
              Export JSON
            </a>
            <button type="button" onClick={() => void loadStats()} className="admin-btn">
              <Activity className="h-4 w-4" />
              Refresh
            </button>
            <button type="button" onClick={() => void logout()} className="admin-btn text-muted">
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>

        <nav aria-label="Admin sections" className="admin-tabs sticky top-14 z-40 mb-8">
          {ADMIN_NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={activeSection === item.id ? "page" : undefined}
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
              {item.id === "actions" && actionCount > 0 && (
                <span
                  className={`ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                    activeSection === item.id ? "bg-background text-accent" : "bg-accent text-background"
                  }`}
                >
                  {actionCount}
                </span>
              )}
              {item.id === "mailbox" && mailUnread > 0 && (
                <span
                  className={`ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                    activeSection === item.id ? "bg-background text-accent" : "bg-accent text-background"
                  }`}
                >
                  {mailUnread}
                </span>
              )}
            </a>
          ))}
        </nav>

        {kpis && (
          <section id="pipeline" className="admin-section mb-10" aria-labelledby="pipeline-heading">
            <h2 id="pipeline-heading" className="mb-4 font-display text-xl font-semibold text-heading">
              Pipeline
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="MRR" value={formatKes(kpis.mrrKes)} hint={formatUsd(kpis.mrrUsd)} icon={Sparkles} />
              <StatCard
                label="Automations live"
                value={kpis.activeAutomations}
                hint="Active, excluding demos"
                icon={Activity}
              />
              <StatCard label="Leads" value={kpis.leadCount} hint="Contacts, intakes, bookings, subscribers" icon={MousePointerClick} />
              <StatCard label="Audit bookings" value={kpis.auditBookings} hint="Free 20-minute audits" icon={ArrowUpRight} />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="admin-panel p-5 sm:p-6">
                <h3 className="font-display text-lg font-semibold text-heading">Leads by source</h3>
                <div className="mt-4">
                  <AnimatedBarChart data={kpis.leadsBySource} />
                </div>
              </div>
              <div className="admin-panel p-5 sm:p-6">
                <h3 className="font-display text-lg font-semibold text-heading">Leads by campaign</h3>
                <p className="mt-1 text-xs text-muted">utm_source on the lead</p>
                <div className="mt-4">
                  {kpis.leadsByUtm.length > 0 ? (
                    <AnimatedBarChart data={kpis.leadsByUtm} color="var(--accent-violet)" />
                  ) : (
                    <p className="py-8 text-sm text-muted">No campaign data yet.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 admin-panel p-5 sm:p-6">
              <h3 className="font-display text-lg font-semibold text-heading">Conversion funnel</h3>
              <p className="mt-1 text-xs text-muted">Visitors, leads, audits booked, automations live</p>
              <div className="mt-6">
                <AnimatedFunnel steps={kpis.funnel} />
              </div>
            </div>
          </section>
        )}

        <div className="mb-10 space-y-8">
          <AdminAutomations onAttention={setActionCount} />
          <AdminMailbox />
          <AdminInbox />
          <AdminLeads />
        </div>

        {ops && (
          <div className="mb-10 space-y-8">
            <AdminOpsHub ops={ops} onMarkRead={markRead} onRefresh={() => void loadStats()} />
            <AdminProjectsPanel />
          </div>
        )}

        <div className="mb-10">
          <AdminMessagingHub />
        </div>

        {summary && (
          <div id="analytics" className="admin-section">
            <h2 className="mb-4 font-display text-xl font-semibold text-heading">
              Analytics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Page impressions"
                value={summary.impressions}
                icon={Eye}
                hint={`${summary.uniqueVisitors} unique visitors`}
              />
              <StatCard
                label="Product CTR"
                value={`${summary.ctr.productClickRate}%`}
                icon={MousePointerClick}
                hint={`${summary.productClicks} product clicks`}
              />
              <StatCard
                label="CTA CTR"
                value={`${summary.ctr.ctaClickRate}%`}
                icon={Sparkles}
                hint={`${summary.ctaClicks} CTA events`}
              />
              <StatCard
                label="Conversions"
                value={summary.funnel.convert}
                icon={ArrowUpRight}
                hint={`${summary.intakeSubmits} intakes · ${summary.bookingClicks} book events`}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="admin-panel p-5 sm:p-6">
                <h2 className="font-display text-lg font-semibold text-heading">
                  Impressions over time
                </h2>
                <p className="mt-1 text-xs text-muted">Last 14 days · animated line</p>
                <div className="mt-4">
                  <AnimatedLineChart data={summary.impressionsByDay} />
                </div>
              </div>

              <div className="admin-panel p-5 sm:p-6">
                <h2 className="font-display text-lg font-semibold text-heading">
                  CTR comparison
                </h2>
                <p className="mt-1 text-xs text-muted">Product vs CTA click rates</p>
                <div className="mt-4">
                  <AnimatedBarChart
                    data={[
                      { label: "Product", value: summary.ctr.productClickRate },
                      { label: "CTA", value: summary.ctr.ctaClickRate },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="admin-panel p-5 sm:p-6">
                <h2 className="font-display text-lg font-semibold text-heading">Funnel</h2>
                <p className="mt-1 text-xs text-muted">Visit → product → intake → convert</p>
                <div className="mt-6">
                  <AnimatedFunnel
                    steps={[
                      { label: "Visit", value: summary.funnel.visit },
                      { label: "Product view", value: summary.funnel.productView },
                      { label: "Intake start", value: summary.funnel.intakeStart },
                      { label: "Submit / book", value: summary.funnel.convert },
                    ]}
                  />
                </div>
              </div>

              <div className="admin-panel p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-accent" />
                  <h2 className="font-display text-lg font-semibold text-heading">
                    Reactions pie
                  </h2>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Per-emoji counts ·{" "}
                  {Object.values(summary.reactions.counts).reduce((a, b) => a + b, 0)} total
                </p>
                <div className="mt-4">
                  {reactionSlices.length > 0 ? (
                    <AnimatedPieChart slices={reactionSlices} />
                  ) : (
                    <p className="py-8 text-center text-sm text-muted">
                      No reactions yet — try the vibe check on the homepage.
                    </p>
                  )}
                </div>
                <div className="mt-6">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                    Sentiment
                  </p>
                  <AnimatedPieChart slices={sentimentSlices} size={120} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(summary.reactions.counts).length === 0 && (
                    <p className="text-sm text-muted">No reactions yet — try the vibe check.</p>
                  )}
                  {Object.entries(summary.reactions.counts).map(([emoji, count]) => (
                    <span
                      key={emoji}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm"
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className="font-mono text-xs text-muted">{count}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {(
                    [
                      ["positive", summary.reactions.sentiment.positive, ArrowUpRight],
                      ["neutral", summary.reactions.sentiment.neutral, Activity],
                      ["negative", summary.reactions.sentiment.negative, ArrowDownRight],
                    ] as const
                  ).map(([label, value, Icon]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-border/70 bg-background/40 px-2 py-3"
                    >
                      <Icon className="mx-auto h-3.5 w-3.5 text-muted" />
                      <p className="mt-1 font-display text-lg font-semibold text-heading">
                        {value}
                      </p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-muted">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="admin-panel p-5 sm:p-6">
                <h2 className="font-display text-lg font-semibold text-heading">Top products</h2>
                <ul className="mt-5 space-y-3">
                  {summary.topProducts.length === 0 && (
                    <li className="text-sm text-muted">No product clicks yet.</li>
                  )}
                  {summary.topProducts.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-border/70 bg-background/40 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {wingLabels.get(p.id) ?? p.id}
                      </span>
                      <span className="font-mono text-xs text-muted">{p.clicks}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="admin-panel p-5 sm:p-6">
                <h2 className="font-display text-lg font-semibold text-heading">
                  Activity by wing
                </h2>
                <div className="mt-4">
                  <AnimatedBarChart
                    data={summary.wingActivity.map((w) => ({
                      label: wingLabels.get(w.wing) ?? w.wing,
                      value: w.events,
                    }))}
                    color="var(--accent-violet)"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 admin-panel p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold text-heading">
                Recent activity
              </h2>
              <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                {summary.recent.length === 0 && (
                  <li className="text-sm text-muted">No events yet.</li>
                )}
                {summary.recent.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border/60 bg-background/30 px-3 py-2 text-xs"
                  >
                    <span className="font-mono text-accent">{ev.name}</span>
                    <span className="text-muted">{ev.path}</span>
                    <span className="w-full font-mono text-[10px] text-muted/80">
                      {new Date(ev.ts).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
