"use client";

import { useMemo, useState } from "react";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";

function money(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function RoiCalculator() {
  const { openBooking } = useFeatures();
  const [hours, setHours] = useState("");
  const [rate, setRate] = useState("");

  const estimate = useMemo(() => {
    const hoursN = Number(hours);
    const rateN = Number(rate);
    if (!Number.isFinite(hoursN) || !Number.isFinite(rateN) || hoursN <= 0 || rateN <= 0) {
      return null;
    }
    const weekly = hoursN * rateN;
    return { hours: hoursN, rate: rateN, weekly, month: weekly * 4 };
  }, [hours, rate]);

  function bookAudit() {
    const note = estimate
      ? `Savings estimate from the site calculator: ${estimate.hours} h/week at $${estimate.rate}/h is about ${money(estimate.weekly)} a week.`
      : undefined;
    trackEvent("cta_click", {
      type: "book",
      source: "roi",
      ...(estimate
        ? { hours: estimate.hours, rate: estimate.rate, weekly: Math.round(estimate.weekly) }
        : {}),
    });
    openBooking("automation-audit", note);
  }

  return (
    <section id="savings" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="AI Automation"
          title="What those hours cost"
          description="Enter hours you could take off repetitive work, and what an hour of that work costs. The figure uses your numbers. It is not a quote."
        />

        <div className="sleek-card grid gap-8 rounded-3xl p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-foreground">
              Hours a week
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                placeholder="5"
                className="field mt-2 px-4 py-3"
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Cost per hour (USD)
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
                placeholder="15"
                className="field mt-2 px-4 py-3"
              />
            </label>
            <p className="sm:col-span-2 text-sm leading-relaxed text-muted">
              {siteConfig.automation.supporting}
            </p>
          </div>

          <div className="rounded-3xl bg-surface-elevated/70 p-6">
            {estimate ? (
              <>
                <p className="font-display text-4xl font-semibold tracking-tight text-heading">
                  {money(estimate.weekly)}
                  <span className="ml-2 text-base font-medium text-muted">/ week</span>
                </p>
                <p className="mt-2 text-sm text-muted">
                  About {money(estimate.month)} over four weeks, from the hours and rate you entered.
                </p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-muted">
                Add both numbers to see the wage cost of those hours.
              </p>
            )}
            <button
              type="button"
              onClick={bookAudit}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-background"
            >
              {siteConfig.automation.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
