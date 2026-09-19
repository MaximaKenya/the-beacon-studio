"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function AnimatedLineChart({
  data,
  height = 160,
}: {
  data: { day: string; count: number }[];
  height?: number;
}) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...data.map((d) => d.count));
  const w = 320;
  const h = height;
  const pad = 12;

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">No data yet.</p>
    );
  }

  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2);
    const y = h - pad - (d.count / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  const path = `M ${points.join(" L ")}`;
  const area = `${path} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" role="img" aria-label="Line chart">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill="url(#lineFill)"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
    </svg>
  );
}

export function AnimatedBarChart({
  data,
  color = "var(--accent)",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">No data yet.</p>
    );
  }

  return (
    <div className="flex h-44 items-end gap-2">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end">
              <motion.div
                className="w-full rounded-t-md"
                style={{ background: color }}
                initial={reduced ? false : { height: 0 }}
                animate={{ height: `${Math.max(d.value ? 4 : 0, pct)}%` }}
                transition={{ delay: i * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
            <span className="max-w-full truncate font-mono text-[8px] text-muted">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AnimatedPieChart({
  slices,
  size = 160,
}: {
  slices: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const reduced = useReducedMotion();
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  let angle = -90;

  const arcs = slices.map((s) => {
    const sweep = (s.value / total) * 360;
    const start = angle;
    angle += sweep;
    return { ...s, start, sweep };
  });

  function polar(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(start: number, sweep: number) {
    if (sweep >= 359.9) {
      return `M ${size / 2} ${size / 2 - size * 0.32} A ${size * 0.32} ${size * 0.32} 0 1 1 ${
        size / 2 - 0.01
      } ${size / 2 - size * 0.32} Z`;
    }
    const r = size * 0.32;
    const cx = size / 2;
    const cy = size / 2;
    const a0 = polar(cx, cy, r, start);
    const a1 = polar(cx, cy, r, start + sweep);
    const large = sweep > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${a0.x} ${a0.y} A ${r} ${r} 0 ${large} 1 ${a1.x} ${a1.y} Z`;
  }

  if (slices.every((s) => s.value === 0)) {
    return (
      <p className="py-10 text-center text-sm text-muted">No reactions yet.</p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Pie chart">
        {arcs.map((a, i) => (
          <motion.path
            key={a.label}
            d={arcPath(a.start, Math.max(a.sweep, 0.01))}
            fill={a.color}
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            style={{ transformOrigin: "50% 50%" }}
          />
        ))}
        <circle cx={size / 2} cy={size / 2} r={size * 0.16} className="fill-surface" />
      </svg>
      <ul className="space-y-1.5 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: s.color }}
              aria-hidden
            />
            <span className="text-foreground">{s.label}</span>
            <span className="font-mono text-xs text-muted">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AnimatedFunnel({
  steps,
}: {
  steps: { label: string; value: number }[];
}) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...steps.map((s) => s.value));

  return (
    <ul className="space-y-3">
      {steps.map((s, i) => (
        <li key={s.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-foreground">
              {i + 1}. {s.label}
            </span>
            <span className="font-mono text-muted">{s.value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-border/50">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-violet"
              initial={reduced ? false : { width: 0 }}
              animate={{ width: `${(s.value / max) * 100}%` }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
