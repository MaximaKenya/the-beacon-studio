"use client";

import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
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

  const studioTiers = siteConfig.pricingTiers.filter((tier) => tier.group !== "automation");
  const automationTiers = siteConfig.pricingTiers.filter((tier) => tier.group === "automation");

  return (
    <section id="pricing" className="section-wash-projects relative overflow-hidden py-28 lg:py-40">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="Pricing"
            title="Clear ranges"
            description="USD floors for studio builds and automation. A quote follows discovery."
          />
        </ScrollReveal>

        {[
          { id: "studio", label: "Studio builds", tiers: studioTiers },
          { id: "automation", label: "AI Automation", tiers: automationTiers },
        ].map((group) => (
          <div key={group.id} className="mt-12 first:mt-2">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {group.label}
            </p>
            <ScrollReveal stagger className="grid gap-8 lg:grid-cols-3">
              {group.tiers.map((tier) => (
                <StaggerChild key={tier.id}>
                  <article
                    className={`flex h-full flex-col rounded-3xl border p-7 lg:p-8 ${
                      tier.featured
                        ? "border-accent/50 bg-surface shadow-lg shadow-accent/10"
                        : "border-border bg-surface/80"
                    }`}
                  >
                    {tier.featured && (
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-accent">
                        Most popular
                      </p>
                    )}
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      {tier.name}
                    </p>
                    <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-foreground">
                      {tier.headline}
                    </h3>
                    <p className="mt-5 flex flex-col gap-1">
                      <span className="font-display text-3xl font-bold text-foreground">
                        {tier.fromPrice}
                      </span>
                      <span className="text-sm leading-relaxed text-muted">{tier.unit}</span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {tier.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 space-y-2">
                      <button
                        type="button"
                        onClick={() => handleCta(tier)}
                        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
                          tier.featured
                            ? "bg-accent text-background hover:bg-accent-hover"
                            : "border border-border bg-background text-foreground hover:border-accent/40"
                        }`}
                      >
                        {tier.cta}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      {tier.fromAmount > 0 && !("quoteOnly" in tier && tier.quoteOnly) && (
                        <PayButton
                          tierId={tier.id}
                          mode="deposit"
                          variant={tier.featured ? "secondary" : "ghost"}
                        />
                      )}
                    </div>
                  </article>
                </StaggerChild>
              ))}
            </ScrollReveal>
          </div>
        ))}

        <ScrollReveal delay={0.1}>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
            {siteConfig.pricingDisclaimer}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{siteConfig.productAccessNote}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                trackEvent("cta_click", { type: "intake", source: "pricing_footer" });
                openIntake();
              }}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover"
            >
              Start a Project
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                trackEvent("cta_click", { type: "book", source: "pricing_footer" });
                openBooking();
              }}
              className="inline-flex h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
            >
              Book a discovery call
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
