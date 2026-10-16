"use client";

import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const { openBooking } = useFeatures();

  return (
    <section id="hero" className="relative px-6 pb-16 pt-28 lg:px-8 lg:pb-20 lg:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-accent">The Beacon Studio · Nairobi</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {siteConfig.heroHeadline}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {siteConfig.heroSubhead}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#products"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover"
          >
            {siteConfig.cta.primary}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <a
            href="#contact"
            className="inline-flex h-12 items-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
          >
            {siteConfig.cta.secondary}
          </a>
          <button
            type="button"
            onClick={() => openBooking()}
            className="inline-flex h-12 items-center px-3 text-sm font-medium text-muted hover:text-foreground"
          >
            {siteConfig.cta.tertiary}
          </button>
        </div>
      </div>
    </section>
  );
}
