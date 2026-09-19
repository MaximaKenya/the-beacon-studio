"use client";

import { siteConfig } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFeatures } from "@/providers/FeatureProvider";
import { ArrowRight } from "lucide-react";

export function Comparison() {
  const { openIntake } = useFeatures();
  const { title, description, rows } = siteConfig.comparison;

  return (
    <section id="compare" className="relative overflow-hidden py-24 lg:py-32">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading label="Compare" title={title} description={description} />
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-border bg-surface/80">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/60">
                  <th className="px-4 py-3.5 font-mono text-[10px] uppercase tracking-widest text-muted sm:px-5">
                    Capability
                  </th>
                  <th className="px-4 py-3.5 font-display text-sm font-semibold text-accent sm:px-5">
                    Build with {siteConfig.brand.shortName}
                  </th>
                  <th className="px-4 py-3.5 font-display text-sm font-semibold text-foreground sm:px-5">
                    DIY
                  </th>
                  <th className="px-4 py-3.5 font-display text-sm font-semibold text-foreground sm:px-5">
                    Typical agency
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <th
                      scope="row"
                      className="px-4 py-3.5 font-medium text-foreground sm:px-5"
                    >
                      {row.capability}
                    </th>
                    <td className="px-4 py-3.5 text-foreground sm:px-5">{row.withUs}</td>
                    <td className="px-4 py-3.5 text-muted sm:px-5">{row.diy}</td>
                    <td className="px-4 py-3.5 text-muted sm:px-5">{row.agency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => openIntake()}
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover"
          >
            Start a Project
            <ArrowRight className="h-4 w-4" />
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
}
