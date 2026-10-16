"use client";

import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFeatures } from "@/providers/FeatureProvider";
import { PayButton } from "@/components/features/PayButton";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "lucide-react";

export function Pricing() {
  const { openIntake, openBooking } = useFeatures();

  const handleCta = (tier: (typeof siteConfig.pricingTiers)[number]) => {
    const automation = tier.group === "automation";
    if (tier.ctaAction === "booking") {
      trackEvent("cta_click", { type: "book", source: "pricing", tier: tier.id });
      openBooking(automation ? "automation-audit" : undefined);
    } else {
      trackEvent("cta_click", { type: "intake", source: "pricing", tier: tier.id });
      openIntake(automation ? "ai-automation" : undefined);
    }
  };

  const automationTiers = siteConfig.pricingTiers.filter((tier) => tier.group === "automation");
  const customTiers = siteConfig.pricingTiers.filter((tier) => tier.group !== "automation");

  return (
    <section id="pricing" className="relative border-t border-border py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="Pricing"
          title="Simple starting prices"
          description="Automation has published starting prices. Custom software is quoted after a free call."
        />

        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">AI Automation</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              One workflow first. The audit is free and takes about 20 minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              trackEvent("cta_click", { type: "book", source: "pricing_audit" });
              openBooking("automation-audit");
            }}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
          >
            {siteConfig.automation.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {automationTiers.map((tier) => (
            <article key={tier.id} className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-display text-xl font-semibold text-foreground">{tier.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{tier.headline}</p>
              <p className="mt-5 font-display text-3xl font-semibold text-foreground">{tier.fromPrice}</p>
              <p className="mt-1 text-sm text-muted">{tier.unit}</p>
              <ul className="mt-5 flex-1 space-y-2">
                {tier.includes.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-foreground">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => handleCta(tier)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:border-accent/40"
                >
                  {tier.cta}
                </button>
                {tier.fromAmount > 0 && !tier.quoteOnly && (
                  <PayButton tierId={tier.id} mode="deposit" variant="ghost" />
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6">
          {customTiers.map((tier) => (
            <article
              key={tier.id}
              className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="max-w-xl">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Custom software</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">{tier.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tier.headline}</p>
                <p className="mt-4 font-display text-2xl font-semibold text-foreground">{tier.fromPrice}</p>
                <ul className="mt-4 space-y-2">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-foreground">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleCta(tier)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover"
              >
                {tier.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </article>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">{siteConfig.pricingDisclaimer}</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{siteConfig.productAccessNote}</p>
      </div>
    </section>
  );
}
