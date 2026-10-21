"use client";

import { useEffect, useState } from "react";
import { siteConfig, type PricingTier } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CountUp } from "@/components/ui/CountUp";
import { LiftCard } from "@/components/ui/LiftCard";
import { useFeatures } from "@/providers/FeatureProvider";
import { PayButton } from "@/components/features/PayButton";
import { trackEvent } from "@/lib/analytics";
import { DEFAULT_USD_KES_RATE, formatKes, formatUsd } from "@/lib/fx";
import { parseResponseJson } from "@/lib/safe-json";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

function kesFloor(tier: PricingTier, rate: number): number {
  if (tier.kesAmount && tier.kesAmount > 0) return tier.kesAmount;
  return Math.max(1, Math.round(tier.fromAmount * rate));
}

export function Pricing() {
  const { openIntake, openBooking } = useFeatures();
  const [rate, setRate] = useState(DEFAULT_USD_KES_RATE);
  const offer = siteConfig.automationPricing;

  useEffect(() => {
    void fetch("/api/payments/options")
      .then((res) => parseResponseJson<{ usdKesRate?: number }>(res, {}))
      .then((data) => {
        if (typeof data.usdKesRate === "number" && data.usdKesRate > 0) setRate(data.usdKesRate);
      })
      .catch(() => undefined);
  }, []);

  const handleCta = (tier: PricingTier) => {
    const automation = tier.group === "automation";
    if (tier.ctaAction === "booking") {
      trackEvent("cta_click", { type: "book", source: "pricing", tier: tier.id });
      openBooking(
        tier.group === "it" ? "it-assessment" : automation ? "automation-audit" : undefined
      );
    } else {
      trackEvent("cta_click", { type: "intake", source: "pricing", tier: tier.id });
      openIntake(automation ? "ai-automation" : undefined);
    }
  };

  const automationTiers = siteConfig.pricingTiers.filter((tier) => tier.group === "automation");
  const customTiers = siteConfig.pricingTiers.filter((tier) => tier.group === "studio" || !tier.group);
  const itTiers = siteConfig.pricingTiers.filter((tier) => tier.group === "it");

  return (
    <section id="pricing" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="Pricing"
          title="Simple starting prices"
          description="A build is a one-off. A care plan keeps it running. Smaller teams can start with a template. Custom software is quoted after a free call. Outsourced IT is quoted after a free assessment."
        />

        <div className="sleek-card mb-8 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">AI Automation</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              One workflow first. The audit is free and takes about 20 minutes. Prices below are in KES and USD.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              trackEvent("cta_click", { type: "book", source: "pricing_audit" });
              openBooking("automation-audit");
            }}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-semibold text-background"
          >
            {siteConfig.automation.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="sleek-card rounded-3xl p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">{offer.buildTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{offer.buildBody}</p>
          </article>
          <article className="sleek-card rounded-3xl p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">{offer.careTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{offer.careBody}</p>
          </article>
        </div>

        <div className="mt-8">
          <h3 className="font-display text-lg font-semibold text-foreground">How it works</h3>
          <ol className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-stretch">
            {offer.howItWorks.map((step, index) => (
              <li key={step.id} className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch">
                <article className="sleek-card flex flex-1 flex-col rounded-3xl p-4">
                  <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <p className="mt-2 font-display text-base font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.detail}</p>
                </article>
                {index < offer.howItWorks.length - 1 && (
                  <ArrowRight
                    className="mx-auto h-4 w-4 shrink-0 rotate-90 text-accent lg:my-auto lg:rotate-0"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="sleek-card mt-8 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Ready-made buffet</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              {formatKes(Math.min(...siteConfig.automationCatalog.templates.map((item) => item.priceKes)))}–{formatKes(Math.max(...siteConfig.automationCatalog.templates.map((item) => item.priceKes)))} a month each
              (about {formatUsd(Math.min(...siteConfig.automationCatalog.templates.map((item) => item.priceUsd)))}–{formatUsd(Math.max(...siteConfig.automationCatalog.templates.map((item) => item.priceUsd)))}).
              Discounts at 3, 5, and 8 or more. Annual pay takes a further {siteConfig.automationCatalog.annualDiscountPercent}% off.
            </p>
          </div>
          <Link href="/automations" className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-background">
            Build a bundle
          </Link>
        </div>

        <h3 className="mt-10 font-display text-lg font-semibold text-foreground">Custom build</h3>
        <div className="mt-4 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {automationTiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} rate={rate} onCta={handleCta} />
          ))}
        </div>

        <article className="sleek-card mt-8 rounded-3xl p-6">
          <h3 className="font-display text-lg font-semibold text-foreground">{offer.flexibilityTitle}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{offer.flexibilityIntro}</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {offer.flexibility.map((point) => (
              <li key={point.id} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-foreground">{point.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{point.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>

        <div className="mt-8 grid gap-6">
          {[...customTiers, ...itTiers].map((tier) => (
            <article
              key={tier.id}
              className="sleek-card flex flex-col gap-6 rounded-3xl p-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="max-w-xl">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {tier.group === "it" ? "Managed IT" : "Custom software"}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-foreground">{tier.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tier.headline}</p>
                <p className="mt-4 font-display text-2xl font-semibold text-foreground">{tier.fromPrice}</p>
                <ul className="mt-4 space-y-2">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleCta(tier)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-background"
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

function TierCard({
  tier,
  rate,
  onCta,
}: {
  tier: PricingTier;
  rate: number;
  onCta: (tier: PricingTier) => void;
}) {
  const popular = Boolean(tier.featured);
  const priced = tier.fromAmount > 0;
  const kesPriced = Boolean(tier.kesAmount);
  const kes = priced ? kesFloor(tier, rate) : 0;

  return (
    <LiftCard className="h-full">
      <article className={`sleek-card flex h-full flex-col rounded-3xl p-6 ${popular ? "sleek-card-popular" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-foreground">{tier.name}</h3>
          {popular && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-background">
              Most popular
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{tier.headline}</p>
        {priced ? (
          <>
            <p className="mt-5 font-display text-3xl font-semibold text-foreground">
              {kesPriced ? (
                <>
                  KES <CountUp value={String(kes)} />
                </>
              ) : (
                <>
                  $<CountUp value={String(tier.fromAmount)} />
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-muted">
              about {kesPriced ? formatUsd(tier.fromAmount) : formatKes(kes)}
              <span className="text-muted"> · {tier.unit}</span>
            </p>
          </>
        ) : (
          <>
            <p className="mt-5 font-display text-3xl font-semibold text-foreground">{tier.fromPrice}</p>
            <p className="mt-1 text-sm text-muted">{tier.unit}</p>
          </>
        )}
        <ul className="mt-5 flex-1 space-y-2">
          {tier.includes.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => onCta(tier)}
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold ${
              popular ? "bg-accent text-background" : "bg-surface-elevated/80 text-foreground"
            }`}
          >
            {tier.cta}
          </button>
          {priced && !tier.quoteOnly && <PayButton tierId={tier.id} mode="deposit" variant="ghost" />}
        </div>
      </article>
    </LiftCard>
  );
}
