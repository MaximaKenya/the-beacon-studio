"use client";

import { Hammer, Zap } from "lucide-react";
import { siteConfig } from "@/data/site";

const statusColors = {
  available: "bg-emerald-500",
  busy: "bg-amber-500",
  building: "bg-accent",
} as const;

export function CurrentlyStrip() {
  const { currently } = siteConfig;
  const dotColor = statusColors[currently.statusType];

  return (
    <section
      aria-label="Current status"
      className="border-b border-border bg-surface/20 py-6"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="glass-panel flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-warm/30 bg-accent-warm/10">
              <Hammer className="h-4 w-4 text-accent-warm" aria-hidden />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Currently building
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground sm:text-base">
                {currently.building}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 ${dotColor}`}
                />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
              </span>
              <span className="font-mono text-xs text-foreground">{currently.status}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {currently.focus.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 font-mono text-[10px] text-muted"
                >
                  <Zap className="h-2.5 w-2.5 text-accent-warm" aria-hidden />
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
