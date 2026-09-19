"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ACCENT_COLORS = ["var(--accent)", "var(--accent-warm)", "var(--accent-amber)", "var(--accent-violet)"];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function radarPath(values: number[], cx: number, cy: number, maxR: number): string {
  const step = 360 / values.length;
  const points = values.map((v, i) => {
    const r = (v / 100) * maxR;
    return polarToCartesian(cx, cy, r, i * step);
  });
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
}

export function SkillRadar() {
  const reducedMotion = useReducedMotion();
  const skills = siteConfig.skillRadar;
  const cx = 120;
  const cy = 120;
  const maxR = 90;
  const levels = skills.map((s) => s.level);
  const step = 360 / skills.length;
  const pathD = radarPath(levels, cx, cy, maxR);

  return (
    <section className="relative py-16">
      <ScrollReveal variant="scale-in">
        <div className="gradient-border mx-auto max-w-md rounded-2xl border border-border bg-surface/60 p-6 backdrop-blur-sm">
          <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-widest text-accent">
            Skill proficiency
          </p>
          <svg viewBox="0 0 240 240" className="mx-auto h-auto w-full max-w-[280px]" role="img" aria-label="Skill radar chart">
            {[0.25, 0.5, 0.75, 1].map((scale) => (
              <polygon
                key={scale}
                points={skills
                  .map((_, i) => {
                    const p = polarToCartesian(cx, cy, maxR * scale, i * step);
                    return `${p.x},${p.y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                opacity="0.6"
              />
            ))}
            {skills.map((skill, i) => {
              const outer = polarToCartesian(cx, cy, maxR, i * step);
              return (
                <line
                  key={skill.name}
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              );
            })}
            {reducedMotion ? (
              <path
                d={pathD}
                fill="color-mix(in srgb, var(--accent) 30%, transparent)"
                stroke="var(--accent)"
                strokeWidth="2.5"
              />
            ) : (
              <motion.path
                d={pathD}
                fill="color-mix(in srgb, var(--accent) 30%, transparent)"
                stroke="var(--accent)"
                strokeWidth="2.5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] as const }}
              />
            )}
            {skills.map((skill, i) => {
              const labelR = maxR + 22;
              const p = polarToCartesian(cx, cy, labelR, i * step);
              return (
                <text
                  key={skill.name}
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-[9px] font-medium"
                >
                  {skill.name}
                </text>
              );
            })}
          </svg>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {skills.map((skill, i) => (
              <li key={skill.name} className="flex items-center gap-2 text-xs text-muted">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
                />
                {skill.name} · {skill.level}%
              </li>
            ))}
          </ul>
        </div>
      </ScrollReveal>
    </section>
  );
}
