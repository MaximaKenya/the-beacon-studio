"use client";

import { useMemo, useState } from "react";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useFeatures } from "@/providers/FeatureProvider";

function formatUsd(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return Number.isInteger(k) ? `$${k}k` : `$${k.toFixed(1)}k`;
  }
  return `$${Math.round(n)}`;
}

/**
 * Lightweight scope estimator — timeline + cost range, clearly not a quote.
 */
export function ScopeEstimator() {
  const { projectTypes, complexities, disclaimer } = siteConfig.estimator;
  const { openIntake } = useFeatures();

  const [typeId, setTypeId] = useState(projectTypes[0]?.id ?? "mvp");
  const [complexityId, setComplexityId] = useState(
    complexities.find((c) => c.id === "standard")?.id ?? complexities[0]?.id ?? "standard"
  );

  const estimate = useMemo(() => {
    const type = projectTypes.find((t) => t.id === typeId);
    const complexity = complexities.find((c) => c.id === complexityId);
    if (!type || !complexity) return null;
    const weeks = Math.round(type.baseWeeks * complexity.multiplier);
    const low = Math.max(1, Math.round(weeks * 0.85));
    const high = Math.round(weeks * 1.2);
    const costFrom = Math.round(type.baseCostFrom * complexity.multiplier);
    const costTo = Math.round(type.baseCostTo * complexity.multiplier);
    return { weeks, low, high, costFrom, costTo };
  }, [typeId, complexityId, projectTypes, complexities]);

  return (
    <section id="estimator" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="Estimator"
            title="Rough timeline & cost"
            description="Project type × complexity → a ballpark schedule and USD range. Not a quote."
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 rounded-lg border border-border/80 bg-surface/20 p-6 sm:p-8">
            <fieldset>
              <legend className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Project type
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {projectTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTypeId(t.id)}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      typeId === t.id
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Complexity
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {complexities.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setComplexityId(c.id)}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      complexityId === c.id
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-accent/25 bg-accent/5 p-6 sm:p-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Estimate
              </p>
              {estimate ? (
                <>
                  <p className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground">
                    {estimate.low}–{estimate.high}
                    <span className="ml-2 text-lg font-medium text-muted">weeks</span>
                  </p>
                  <p className="mt-4 font-display text-2xl font-semibold text-foreground">
                    {formatUsd(estimate.costFrom)}–{formatUsd(estimate.costTo)}
                    <span className="ml-2 text-sm font-medium text-muted">USD</span>
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Midpoint ~{estimate.weeks} weeks. Cost scales with complexity —
                    discovery may adjust both.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-muted">Select options above.</p>
              )}
              <p className="mt-4 text-xs leading-relaxed text-muted">{disclaimer}</p>
            </div>
            <button
              type="button"
              onClick={() => openIntake()}
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start a project
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
