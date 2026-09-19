"use client";

import { useEffect, useMemo, useState, type ComponentType, type FormEvent } from "react";
import Link from "next/link";
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
import { AdminOpsHub, type AdminOpsData } from "@/components/admin/AdminOpsHub";
import { AdminProjectsPanel } from "@/components/admin/AdminProjectsPanel";
import { parseResponseJson } from "@/lib/safe-json";

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
    <div className="rounded-2xl border border-border bg-gradient-to-br from-surface/80 to-background/40 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/60 text-accent">
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

  const wingLabels = useMemo(() => {
    const map = new Map(siteConfig.products.map((p) => [p.id, p.name]));
    return map;
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await parseResponseJson<{ authenticated?: boolean }>(res, {});
      setAuth(data.authenticated ? "in" : "out");
    } catch {
      setAuth("out");
    }
  }

  async function loadStats() {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        setAuth("out");
        return;
      }
      const data = await parseResponseJson<{
        summary?: AnalyticsSummary;
        updatedAt?: string;
        ops?: AdminOpsData;
      }>(res, {});
      if (data.summary) setSummary(data.summary);
      if (data.ops) setOps(data.ops);
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
    void checkAuth();
  }, []);

  useEffect(() => {
    if (auth === "in") void loadStats();
  }, [auth]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await parseResponseJson<{ error?: string }>(res, {});
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    setPassword("");
    setAuth("in");
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
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
        <div className="rounded-2xl border border-border bg-surface/60 p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-accent">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">Admin</h1>
              <p className="text-xs text-muted">Beacon analytics · pin protected</p>
            </div>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label htmlFor="admin-pin" className="mb-1.5 block text-xs text-muted">
                Password / PIN
              </label>
              <input
                id="admin-pin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground focus:border-accent/50 focus:outline-none"
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
          <p className="mt-4 text-xs text-muted">
            Set <code className="font-mono text-foreground">ADMIN_PASSWORD</code> in{" "}
            <code className="font-mono text-foreground">.env.local</code>.
          </p>
          <Link href="/" className="mt-6 inline-flex items-center gap-1 text-sm text-accent hover:underline">
            ← Back to site
          </Link>
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
    <div className="px-6 pb-24 pt-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {siteConfig.brand.name}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
              Ops & analytics
            </h1>
            <Link
              href="/"
              className="mt-2 inline-flex text-sm text-accent hover:underline lg:hidden"
            >
              ← Back to site
            </Link>
            {updatedAt && (
              <p className="mt-1 text-xs text-muted">
                Updated {new Date(updatedAt).toLocaleString()}
                {loadingStats ? " · refreshing…" : ""}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {summary && <AdminPdfExport summary={summary} />}
            <a
              href="/api/admin/stats?export=json"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-accent/40"
            >
              Export JSON
            </a>
            <button
              type="button"
              onClick={() => void loadStats()}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-accent/40"
            >
              <Activity className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>

        {ops && (
          <div className="mb-12 space-y-8">
            <AdminOpsHub ops={ops} onMarkRead={markRead} onRefresh={() => void loadStats()} />
            <AdminProjectsPanel />
          </div>
        )}

        {summary && (
          <>
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
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
              <div className="rounded-2xl border border-border bg-surface/40 p-5">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Impressions over time
                </h2>
                <p className="mt-1 text-xs text-muted">Last 14 days · animated line</p>
                <div className="mt-4">
                  <AnimatedLineChart data={summary.impressionsByDay} />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface/40 p-5">
                <h2 className="font-display text-lg font-semibold text-foreground">
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
              <div className="rounded-2xl border border-border bg-surface/40 p-5">
                <h2 className="font-display text-lg font-semibold text-foreground">Funnel</h2>
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

              <div className="rounded-2xl border border-border bg-surface/40 p-5">
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-accent" />
                  <h2 className="font-display text-lg font-semibold text-foreground">
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
                      <p className="mt-1 font-display text-lg font-semibold text-foreground">
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
              <div className="rounded-2xl border border-border bg-surface/40 p-5">
                <h2 className="font-display text-lg font-semibold text-foreground">Top products</h2>
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

              <div className="rounded-2xl border border-border bg-surface/40 p-5">
                <h2 className="font-display text-lg font-semibold text-foreground">
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

            <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-5">
              <h2 className="font-display text-lg font-semibold text-foreground">
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
          </>
        )}
      </div>
    </div>
  );
}
