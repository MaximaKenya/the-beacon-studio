"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SuiteLine } from "@/components/brand/SuiteLine";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { siteConfig } from "@/data/site";
import { parseResponseJson } from "@/lib/safe-json";

type PublicPulseData = {
  visitorsThisWeek: number;
  reactionTotal: number;
  reactionMosaic: Record<string, number>;
  productsExplored: { name: string; count: number }[];
  suiteSize: number;
};

/** Deterministic decorative sparkline from a seed (public, non-sensitive). */
function sparkPoints(seed: number, n = 12): number[] {
  const pts: number[] = [];
  let x = seed || 7;
  for (let i = 0; i < n; i++) {
    x = (x * 17 + 23) % 97;
    pts.push(18 + (x % 62));
  }
  return pts;
}

function Sparkline({
  values,
  reduced,
  accent = "var(--accent)",
}: {
  values: number[];
  reduced: boolean;
  accent?: string;
}) {
  const max = Math.max(...values, 1);
  const w = 160;
  const h = 48;
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - (v / max) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-12 w-full" aria-hidden>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${d} L${w},${h} L0,${h} Z`}
        fill="url(#sparkFill)"
        initial={reduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

function BarChart({
  items,
  reduced,
}: {
  items: { name: string; count: number }[];
  reduced: boolean;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="mt-4 space-y-3">
      {items.map((p, i) => (
        <li key={p.name}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-foreground">{p.name}</span>
            <span className="font-mono text-xs text-muted">{p.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border/40">
            <motion.div
              className="h-full rounded-full bg-accent/80"
              initial={reduced ? false : { width: 0 }}
              whileInView={{ width: `${Math.max(6, (p.count / max) * 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PublicAnalyticsPulse() {
  const reduced = useReducedMotion();
  const [data, setData] = useState<PublicPulseData | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/analytics/public")
      .then((r) => parseResponseJson<PublicPulseData | null>(r, null))
      .then((json) => {
        if (!cancelled && json) setData(json);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mosaic = data
    ? Object.entries(data.reactionMosaic).sort((a, b) => b[1] - a[1])
    : [];

  const visitorSpark = useMemo(
    () => sparkPoints(data?.visitorsThisWeek ?? 12),
    [data?.visitorsThisWeek]
  );

  const products = data?.productsExplored.length
    ? data.productsExplored
    : siteConfig.products.map((p) => ({ name: p.name, count: 0 }));

  return (
    <section id="pulse" className="relative border-y border-border/40 bg-surface/40 py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 soft-panel-wash" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="Studio pulse"
            title="This week at a glance"
            description="Public, privacy-safe signals — no emails, revenue, or personal data."
          />
        </ScrollReveal>

        <div className="mt-6">
          <SuiteLine size="sm" align="left" linkProducts />
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <motion.div
            className="soft-panel rounded-3xl border border-border/70 bg-background/70 p-6"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Visitors · 7 days
            </p>
            <p className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">
              {data ? data.visitorsThisWeek : "—"}
            </p>
            <Sparkline values={visitorSpark} reduced={reduced} />
          </motion.div>

          <motion.div
            className="soft-panel rounded-3xl border border-border/70 bg-background/70 p-6"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Vibe mosaic
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {mosaic.length === 0 && (
                <p className="text-sm text-muted">Be the first vibe check ↓</p>
              )}
              {mosaic.map(([emoji, count], i) => (
                <motion.span
                  key={emoji}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-3 py-2 text-sm"
                  initial={reduced ? false : { scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="font-mono text-xs text-muted">{count}</span>
                </motion.span>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">
              {data ? data.reactionTotal : 0} reactions · {data?.suiteSize ?? siteConfig.products.length} apps
            </p>
          </motion.div>

          <motion.div
            className="soft-panel rounded-3xl border border-border/70 bg-background/70 p-6"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Products explored
            </p>
            <BarChart items={products.slice(0, 4)} reduced={reduced} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
