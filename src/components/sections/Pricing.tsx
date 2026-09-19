"use client";

import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFeatures } from "@/providers/FeatureProvider";
import { PayButton } from "@/components/features/PayButton";
import { trackEvent } from "@/lib/analytics";
import { mailtoHref, phoneHref, trackCallClick, trackEmailClick } from "@/lib/contact-actions";
import { ArrowRight, Mail, Phone } from "lucide-react";

export function Pricing() {
  const { openIntake, openBooking } = useFeatures();

  const handleCta = (action: "intake" | "booking" | "access") => {
    if (action === "booking") {
      trackEvent("cta_click", { type: "book", source: "pricing" });
      openBooking();
    } else {
      trackEvent("cta_click", { type: "intake", source: "pricing" });
      openIntake();
    }
  };

  return (
    <section id="pricing" className="section-wash-projects relative overflow-hidden py-24 lg:py-32">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="Pricing"
            title="Engagement models with clear ranges"
            description="SME-friendly floors in USD — not fake $9/mo seats. Custom quotes after discovery."
          />
        </ScrollReveal>

        <ScrollReveal stagger className="mt-2 grid gap-6 lg:grid-cols-3">
          {siteConfig.pricingTiers.map((tier) => (
            <StaggerChild key={tier.id}>
              <article
                className={`flex h-full flex-col rounded-2xl border p-6 lg:p-7 ${
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
                <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground">
                  {tier.headline}
                </h3>
                <p className="mt-4 flex flex-col gap-0.5">
                  <span className="font-display text-3xl font-bold text-foreground">
                    {tier.fromPrice}
                  </span>
                  <span className="text-sm text-muted">{tier.unit}</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleCta(tier.ctaAction)}
                    className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
                      tier.featured
                        ? "bg-accent text-background hover:bg-accent-hover"
                        : "border border-border bg-background text-foreground hover:border-accent/40"
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <PayButton
                    tierId={tier.id}
                    mode="deposit"
                    variant={tier.featured ? "secondary" : "ghost"}
                  />
                </div>
              </article>
            </StaggerChild>
          ))}
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
            {siteConfig.pricingDisclaimer}
          </p>
          <p className="mt-2 text-sm text-muted">{siteConfig.payments.currencyNote}</p>
          <p className="mt-2 text-sm text-muted">{siteConfig.productAccessNote}</p>
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
            <a
              href={phoneHref()}
              onClick={() => trackCallClick("pricing")}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
            >
              <Phone className="h-4 w-4 text-accent" />
              Call
            </a>
            <a
              href={mailtoHref("Project inquiry — Beacon Studio")}
              onClick={() => trackEmailClick("pricing")}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
            >
              <Mail className="h-4 w-4 text-accent" />
              Email
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
