"use client";

import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { trackEvent } from "@/lib/analytics";

export function FinalCta() {
  const { openBooking } = useFeatures();

  return (
    <section className="px-6 py-8 lg:px-8" aria-label="Book an audit">
      <div className="sleek-card mx-auto max-w-6xl rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
          Tell us the repetitive work. We will map one workflow.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          The audit is free and takes about 20 minutes. We agree clear success criteria before you
          pay a deposit.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3" data-cta="">
          <MagneticButton
            onClick={() => {
              trackEvent("cta_click", { type: "book", source: "final_cta" });
              openBooking("automation-audit");
            }}
            className="inline-flex h-12 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background"
          >
            {siteConfig.cta.primary}
          </MagneticButton>
          <MagneticButton
            href="#lead"
            className="inline-flex h-12 items-center rounded-2xl bg-surface-elevated/80 px-5 text-sm font-semibold text-foreground"
          >
            What do you need?
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
