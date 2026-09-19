"use client";

import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";

/**
 * Trust metrics from real siteConfig.stats — no fake logos.
 */
export function TrustMetricsStrip() {
  return (
    <section
      aria-label="Studio metrics"
      className="relative border-y border-border/60 bg-gradient-to-r from-accent/[0.06] via-surface/40 to-accent-violet/[0.06] py-10"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal stagger className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {siteConfig.stats.map((stat) => (
            <StaggerChild key={stat.label}>
              <div className="text-center md:text-left">
                <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {stat.value}
                  {stat.suffix ? (
                    <span className="text-accent">{stat.suffix}</span>
                  ) : null}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                  {stat.label}
                </p>
              </div>
            </StaggerChild>
          ))}
        </ScrollReveal>
        <p className="mt-6 text-center text-xs text-muted md:text-left">
          Nairobi product studio · clear scope · weekly demos · {siteConfig.payments.depositPercent ?? 30}% deposits
        </p>
      </div>
    </section>
  );
}
