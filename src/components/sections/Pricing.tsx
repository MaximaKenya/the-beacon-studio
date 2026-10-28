"use client";

import { useEffect, useState } from "react";
import { siteConfig, type PricingTier } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CountUp } from "@/components/ui/CountUp";
import { useFeatures } from "@/providers/FeatureProvider";
import { PayButton } from "@/components/features/PayButton";
import { trackEvent } from "@/lib/analytics";
import { DEFAULT_USD_KES_RATE, formatKes, formatUsd } from "@/lib/fx";
import { parseResponseJson } from "@/lib/safe-json";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { AnnualBadge, CarePlansGrid, FoundersNote, ProAddonsGrid } from "@/components/revenue/Offers";

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
  const packageTiers = siteConfig.pricingTiers.filter((tier) => tier.group === "package");

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
            className="price-btn price-btn-primary shrink-0 self-start sm:self-auto"
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
          <Link href="/automations" className="price-btn price-btn-secondary shrink-0 self-start sm:self-auto">
            Build a bundle
          </Link>
        </div>

        <h3 className="mt-10 font-display text-lg font-semibold text-foreground">Custom build</h3>
        <div className="mt-6 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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

        {packageTiers.length > 0 && (
          <div id="packages" className="mt-12">
            <h3 className="font-display text-2xl font-semibold text-foreground">Fixed-price packages</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Set scope, set price. 30% deposit or request an invoice.{" "}
              <Link href="/automation-roi" className="text-accent hover:underline">
                Not sure? Run the ROI calculator.
              </Link>
            </p>
            <div className="mt-8 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:gap-8">
              {packageTiers.map((tier) => (
                <TierCard key={tier.id} tier={tier} rate={rate} onCta={handleCta} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6">
          {[...customTiers, ...itTiers].map((tier) => (
            <article
              key={tier.id}
              className="sleek-card price-lift flex flex-col gap-6 rounded-3xl p-7 sm:p-8 md:flex-row md:items-end md:justify-between md:gap-10"
            >
              <div className="max-w-xl">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {tier.group === "it" ? "Managed IT" : "Custom software"}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-heading">{tier.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tier.headline}</p>
                <p className="mt-5 font-display text-2xl font-semibold text-heading">{tier.fromPrice}</p>
                <ul className="mt-5 space-y-3">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
                      <span className="price-check" aria-hidden>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="min-w-0">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleCta(tier)}
                className="price-btn price-btn-secondary shrink-0 self-start md:self-auto"
              >
                {tier.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </article>
          ))}
        </div>

        <div id="care-plans" className="mt-16 scroll-mt-28">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-2xl font-semibold text-heading">Care plans</h3>
            <AnnualBadge />
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted">Monthly care after launch. Billed by invoice.</p>
          <div className="mt-8">
            <CarePlansGrid />
          </div>
        </div>

        <div id="add-ons" className="mt-16 scroll-mt-28">
          <h3 className="font-display text-2xl font-semibold text-heading">Pro add-ons</h3>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Add to any plan. WhatsApp and M-Pesa add-ons are on the <Link href="/add-ons" className="text-accent">add-ons page</Link>.
          </p>
          <div className="mt-8">
            <ProAddonsGrid />
          </div>
        </div>

        <div className="mt-8 max-w-3xl">
          <FoundersNote />
        </div>

        <p className="sleek-card mt-8 max-w-3xl rounded-3xl p-5 text-sm leading-relaxed text-foreground">
          The audit is free. You pay a deposit only after we agree what success looks like. If the first workflow misses that mark, we revise it before the next invoice.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{siteConfig.pricingDisclaimer}</p>
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
  const payable = priced && !tier.quoteOnly;

  return (
    <article className={`sleek-card price-card price-lift ${popular ? "price-card-popular" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h3 className="font-display text-xl font-semibold text-heading">{tier.name}</h3>
        {popular && <span className="price-badge">Most popular</span>}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{tier.headline}</p>

      <div className="mt-6">
        <p className="font-display text-4xl font-semibold tracking-tight text-heading">
          {priced ? (
            kesPriced ? (
              <>
                <span className="mr-1 text-lg font-medium text-muted">KES</span>
                <CountUp value={String(kes)} />
              </>
            ) : (
              <>
                $<CountUp value={String(tier.fromAmount)} />
              </>
            )
          ) : (
            tier.fromPrice
          )}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {priced ? (
            <>
              about {kesPriced ? formatUsd(tier.fromAmount) : formatKes(kes)} · {tier.unit}
            </>
          ) : (
            tier.unit
          )}
        </p>
      </div>

      <ul className="mt-7 flex-1 space-y-3.5">
        {tier.includes.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
            <span className="price-check" aria-hidden>
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
      {tier.excludes && tier.excludes.length > 0 && (
        <ul className="mt-5 space-y-1.5">
          {tier.excludes.map((item) => (
            <li key={item} className="text-xs leading-relaxed text-muted">
              Not included: {item}
            </li>
          ))}
        </ul>
      )}
      {tier.revisions && <p className="mt-4 text-xs text-muted">Revisions: {tier.revisions}</p>}

      <div className="mt-8 flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={() => onCta(tier)}
          className={`price-btn ${popular ? "price-btn-primary" : "price-btn-secondary"}`}
        >
          {tier.cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
        {payable && (
          <details className="group w-full">
            <summary className="cursor-pointer list-none text-sm font-medium text-muted hover:text-heading [&::-webkit-details-marker]:hidden">
              Other ways to pay
              <span className="ml-1 inline-block transition-transform group-open:rotate-90" aria-hidden>›</span>
            </summary>
            <PayButton tierId={tier.id} mode="deposit" variant="ghost" className="mt-3" />
          </details>
        )}
      </div>
    </article>
  );
}
