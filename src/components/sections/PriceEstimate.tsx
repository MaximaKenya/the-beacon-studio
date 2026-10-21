"use client";

import { useMemo, useState } from "react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";

export function PriceEstimate() {
  const types = siteConfig.estimator.projectTypes;
  const complexities = siteConfig.estimator.complexities;
  const [typeId, setTypeId] = useState(types[0]?.id || "");
  const [complexityId, setComplexityId] = useState(
    complexities.find((item) => item.id === "standard")?.id || complexities[0]?.id || ""
  );
  const { openBooking } = useFeatures();

  const estimate = useMemo(() => {
    const type = types.find((item) => item.id === typeId) || types[0];
    const complexity = complexities.find((item) => item.id === complexityId) || complexities[0];
    if (!type || !complexity) return null;
    const multiplier = complexity.multiplier;
    return {
      label: type.label,
      weeks: Math.max(1, Math.round(type.baseWeeks * multiplier)),
      from: Math.round(type.baseCostFrom * multiplier),
      to: Math.round(type.baseCostTo * multiplier),
    };
  }, [complexities, complexityId, typeId, types]);

  if (!estimate) return null;

  return (
    <section id="estimate" className="px-6 py-16 lg:px-8" aria-labelledby="estimate-heading">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Rough range</p>
        <h2 id="estimate-heading" className="mt-3 font-display text-3xl font-semibold tracking-tight text-heading">
          Instant price estimate
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{siteConfig.estimator.disclaimer}</p>
        <div className="sleek-card mt-6 rounded-3xl p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-muted">
              What you need
              <select
                value={typeId}
                onChange={(event) => setTypeId(event.target.value)}
                className="mt-1 w-full rounded-xl bg-surface-elevated/80 px-3 py-2 text-sm text-foreground"
              >
                {types.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              Scope
              <select
                value={complexityId}
                onChange={(event) => setComplexityId(event.target.value)}
                className="mt-1 w-full rounded-xl bg-surface-elevated/80 px-3 py-2 text-sm text-foreground"
              >
                {complexities.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-6 font-display text-3xl font-semibold text-heading">
            ${estimate.from.toLocaleString("en-US")}–${estimate.to.toLocaleString("en-US")}
          </p>
          <p className="mt-1 text-sm text-muted">
            About {estimate.weeks} {estimate.weeks === 1 ? "week" : "weeks"} for {estimate.label}. Not a quote.
          </p>
          <button
            type="button"
            onClick={() => {
              trackEvent("cta_click", { type: "book", source: "estimate" });
              openBooking("project");
            }}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background"
          >
            Book a call to lock the price
          </button>
        </div>
      </div>
    </section>
  );
}
