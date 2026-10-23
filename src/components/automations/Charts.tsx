"use client";

import type { DayBucket, NamedValue } from "@/lib/automations/analytics";

const COLORS = ["#45baab", "#8b6fd4", "#e0a15a", "#d46f8b", "#6f8bd4", "#7dba6a"];

export function AreaChart({ days, series }: { days: DayBucket[]; series: "runs" | "messages" }) {
  if (days.length === 0 || days.every((day) => day[series] === 0)) {
    return <p className="py-8 text-sm text-muted">Nothing in this range yet.</p>;
  }
  const width = 320;
  const height = 120;
  const max = Math.max(...days.map((day) => day[series]), 1);
  const step = width / Math.max(days.length - 1, 1);
  const points = days.map((day, index) => {
    const x = index * step;
    const y = height - (day[series] / max) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const area = `0,${height} ${points.join(" ")} ${width},${height}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full" role="img" aria-label={`${series} over time`}>
      <polygon points={area} className="fill-accent/25" />
      <polyline points={points.join(" ")} fill="none" className="stroke-accent" strokeWidth="2" />
    </svg>
  );
}

export function Donut({ slices, label }: { slices: NamedValue[]; label: string }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total === 0) return <p className="py-8 text-sm text-muted">No messages in this range yet.</p>;
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const arcs = slices.reduce<{ label: string; length: number; offset: number; color: string }[]>((list, slice, index) => {
    const used = list.reduce((sum, item) => sum + item.length, 0);
    list.push({
      label: slice.label,
      length: (slice.value / total) * circ,
      offset: used,
      color: COLORS[index % COLORS.length] || "#45baab",
    });
    return list;
  }, []);
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <svg viewBox="0 0 120 120" className="h-32 w-32" role="img" aria-label={label}>
        <circle cx="60" cy="60" r={radius} fill="none" className="stroke-foreground/10" strokeWidth="14" />
        {arcs.map((slice) => (
          <circle
            key={slice.label}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth="14"
            strokeDasharray={`${slice.length} ${circ - slice.length}`}
            strokeDashoffset={-slice.offset}
            transform="rotate(-90 60 60)"
          />
        ))}
        <text x="60" y="64" textAnchor="middle" className="fill-foreground text-[14px] font-semibold">
          {total}
        </text>
      </svg>
      <ul className="space-y-1 text-xs text-muted">
        {slices.map((slice, index) => (
          <li key={slice.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
            {slice.label} · {slice.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Bars({ slices }: { slices: NamedValue[] }) {
  const max = Math.max(...slices.map((slice) => slice.value), 1);
  if (slices.every((slice) => slice.value === 0)) return <p className="py-8 text-sm text-muted">No activity in this range yet.</p>;
  return (
    <ul className="space-y-2">
      {slices.map((slice) => (
        <li key={slice.label}>
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>{slice.label}</span>
            <span>{slice.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(4, (slice.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NpsGauge({ score }: { score: number | null }) {
  if (score === null) return <p className="py-8 text-sm text-muted">No scores yet.</p>;
  const clamped = Math.max(-100, Math.min(100, score));
  const turn = ((clamped + 100) / 200) * 180;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="h-24 w-40" role="img" aria-label={`NPS ${score}`}>
        <path d="M10 60 A 50 50 0 0 1 110 60" fill="none" className="stroke-foreground/15" strokeWidth="10" strokeLinecap="round" />
        <path d="M10 60 A 50 50 0 0 1 110 60" fill="none" className="stroke-accent" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(turn / 180) * 157} 157`} />
      </svg>
      <p className="font-display text-3xl font-semibold text-foreground">{score}</p>
      <p className="text-xs text-muted">NPS</p>
    </div>
  );
}

export function ProgressRing({ progress }: { progress: number }) {
  const radius = 18;
  const circ = 2 * Math.PI * radius;
  const done = Math.max(0, Math.min(1, progress));
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" role="img" aria-label={`${Math.round(done * 100)} percent ready`}>
      <circle cx="24" cy="24" r={radius} fill="none" className="stroke-foreground/15" strokeWidth="4" />
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        className="stroke-accent"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${done * circ} ${circ}`}
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="28" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
        {Math.round(done * 100)}
      </text>
    </svg>
  );
}
