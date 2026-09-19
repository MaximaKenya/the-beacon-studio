"use client";

type Slice = { label: string; value: number; color: string };

export function ProgressPie({
  percent,
  size = 160,
}: {
  percent: number;
  size?: number;
}) {
  const p = Math.max(0, Math.min(100, percent));
  const remaining = 100 - p;
  const slices: Slice[] = [
    { label: "Done", value: p, color: "#0d9488" },
    { label: "Remaining", value: remaining, color: "#e2e8f0" },
  ];

  const r = 14;
  const cx = 16;
  const cy = 16;
  let angle = -90;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 32 32" className="rotate-0">
          {slices.map((seg, idx) => {
            if (seg.value <= 0) return null;
            const sweep = (seg.value / 100) * 360;
            const a1 = (angle * Math.PI) / 180;
            const a2 = ((angle + sweep) * Math.PI) / 180;
            const x1 = cx + r * Math.cos(a1);
            const y1 = cy + r * Math.sin(a1);
            const x2 = cx + r * Math.cos(a2);
            const y2 = cy + r * Math.sin(a2);
            const large = sweep > 180 ? 1 : 0;
            angle += sweep;
            if (seg.value >= 100) {
              return <circle key={idx} cx={cx} cy={cy} r={r} fill={seg.color} />;
            }
            return (
              <path
                key={idx}
                d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
                fill={seg.color}
              />
            );
          })}
          <circle cx={cx} cy={cy} r={8} fill="var(--background, #f8fafc)" />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-display text-2xl font-bold text-foreground">{p}%</span>
        </div>
      </div>
      <p className="text-xs text-muted">Project progress</p>
    </div>
  );
}
