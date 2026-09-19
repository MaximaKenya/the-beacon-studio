"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import { siteConfig } from "@/data/site";
import { BeaconMark } from "@/components/brand/BeaconMark";
import type { AnalyticsSummary } from "@/lib/analytics-store";
import { parseResponseJson } from "@/lib/safe-json";

export default function AdminReportPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await parseResponseJson<{
          summary?: AnalyticsSummary;
          error?: string;
        }>(res, {});
        if (cancelled) return;
        if (!res.ok || !data.summary) {
          setError(data.error ?? "Sign in at /admin to view this report.");
          setLoading(false);
          return;
        }
        setSummary(data.summary);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Failed to load report data.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!summary || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "1") {
      const t = window.setTimeout(() => window.print(), 450);
      return () => window.clearTimeout(t);
    }
  }, [summary]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 pt-24">
        <p className="text-sm text-muted">Loading report…</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="mx-auto max-w-md px-6 pt-28 pb-16 text-center">
        <p className="text-sm text-muted">{error ?? "No data."}</p>
        <Link href="/admin" className="mt-4 inline-block text-sm text-accent hover:underline">
          ← Back to admin
        </Link>
      </div>
    );
  }

  const reactionRows = Object.entries(summary.reactions.counts);
  const generated = new Date().toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
  });

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 print:max-w-none print:px-0 print:pt-4">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to admin
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

      <header className="flex items-start gap-4 border-b border-border pb-6">
        <BeaconMark size={40} className="shrink-0 text-accent" staticGlow />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {siteConfig.brand.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Analytics report · {generated} · Africa/Nairobi
          </p>
          <p className="mt-1 text-xs text-muted">{siteConfig.brand.lockup}</p>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Impressions", summary.impressions],
          ["Unique visitors", summary.uniqueVisitors],
          ["Product CTR", `${summary.ctr.productClickRate}%`],
          ["Conversions", summary.funnel.convert],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-border bg-surface/50 p-4"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {label}
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-foreground">
              {value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-foreground">Funnel</h2>
        <p className="mt-2 text-sm text-muted">
          Visit {summary.funnel.visit} → Product {summary.funnel.productView} → Intake{" "}
          {summary.funnel.intakeStart} → Convert {summary.funnel.convert}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Impressions (14 days)
        </h2>
        <table className="mt-3 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="py-2 font-medium">Day</th>
              <th className="py-2 font-medium">Count</th>
            </tr>
          </thead>
          <tbody>
            {summary.impressionsByDay.length === 0 && (
              <tr>
                <td colSpan={2} className="py-3 text-muted">
                  No data
                </td>
              </tr>
            )}
            {summary.impressionsByDay.map((d) => (
              <tr key={d.day} className="border-b border-border/60">
                <td className="py-2 font-mono text-xs">{d.day}</td>
                <td className="py-2">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Emoji reactions
        </h2>
        <p className="mt-1 text-xs text-muted">
          Positive {summary.reactions.sentiment.positive} · Neutral{" "}
          {summary.reactions.sentiment.neutral} · Negative{" "}
          {summary.reactions.sentiment.negative}
        </p>
        <table className="mt-3 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="py-2 font-medium">Emoji</th>
              <th className="py-2 font-medium">Count</th>
            </tr>
          </thead>
          <tbody>
            {reactionRows.length === 0 && (
              <tr>
                <td colSpan={2} className="py-3 text-muted">
                  No reactions yet
                </td>
              </tr>
            )}
            {reactionRows.map(([emoji, count]) => (
              <tr key={emoji} className="border-b border-border/60">
                <td className="py-2 text-lg">{emoji}</td>
                <td className="py-2 font-mono text-xs">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Product wing activity
        </h2>
        <table className="mt-3 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="py-2 font-medium">Wing</th>
              <th className="py-2 font-medium">Events</th>
            </tr>
          </thead>
          <tbody>
            {summary.wingActivity.map((w) => (
              <tr key={w.wing} className="border-b border-border/60">
                <td className="py-2 capitalize">{w.wing}</td>
                <td className="py-2 font-mono text-xs">{w.events}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="mt-12 border-t border-border pt-4 text-center text-xs text-muted">
        {siteConfig.brand.name} — {siteConfig.brand.lockup}
        <br />
        Software product studio · Nairobi · Not affiliated with film/media agencies of a
        similar name.
      </footer>
    </div>
  );
}
