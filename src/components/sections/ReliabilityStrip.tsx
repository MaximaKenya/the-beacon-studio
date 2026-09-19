"use client";

import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Clock, Cloud, Shield, Zap } from "lucide-react";

const ICONS = [Clock, Shield, Cloud, Zap] as const;

export function ReliabilityStrip() {
  const { title, description, items } = siteConfig.reliability;

  return (
    <section
      id="reliability"
      className="border-y border-border bg-surface/60 py-16 lg:py-20"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading label="Operate" title={title} description={description} />
        </ScrollReveal>

        <ScrollReveal stagger className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <StaggerChild key={item.id}>
                <div className="rounded-xl border border-border bg-background/70 p-5">
                  <Icon className="h-5 w-5 text-accent" aria-hidden />
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              </StaggerChild>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
