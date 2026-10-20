"use client";

import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HeroAutomationFlow } from "@/components/sections/HeroAutomationFlow";
import { trackEvent } from "@/lib/analytics";

const ACCENT_PHRASE = "repetitive work";

function headlineParts(text: string) {
  const index = text.toLowerCase().indexOf(ACCENT_PHRASE);
  if (index < 0) return { before: text, accent: "", after: "" };
  return {
    before: text.slice(0, index),
    accent: text.slice(index, index + ACCENT_PHRASE.length),
    after: text.slice(index + ACCENT_PHRASE.length),
  };
}

export function Hero() {
  const { openBooking } = useFeatures();
  const parts = headlineParts(siteConfig.heroHeadline);

  function bookAudit() {
    trackEvent("cta_click", { type: "book", source: "hero" });
    openBooking("automation-audit");
  }

  return (
    <section id="hero" className="relative px-6 pb-12 pt-28 lg:px-8 lg:pb-20 lg:pt-36">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <p className="text-sm font-medium text-accent">
            {siteConfig.brand.name} · {siteConfig.location}
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-heading sm:text-5xl lg:text-6xl">
            {parts.before}
            {parts.accent && <span className="gradient-text">{parts.accent}</span>}
            {parts.after}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {siteConfig.heroSubhead}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton
              onClick={bookAudit}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-background shadow-[0_12px_32px_color-mix(in_srgb,var(--accent)_35%,transparent)]"
            >
              {siteConfig.cta.primary}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MagneticButton>
            <MagneticButton
              href="#products"
              className="inline-flex h-12 items-center rounded-2xl bg-surface-elevated/80 px-5 text-sm font-semibold text-foreground shadow-[0_10px_28px_rgba(8,4,20,0.16)]"
            >
              {siteConfig.cta.secondary}
            </MagneticButton>
          </div>
          <p className="mt-5 text-sm text-muted">
            Free 20-minute audit. We agree success criteria before you pay a deposit.{" "}
            <a href="/book" className="text-accent underline-offset-4 hover:underline">
              Pick a time
            </a>
            .
          </p>
        </div>

        <HeroAutomationFlow />
      </div>
    </section>
  );
}
