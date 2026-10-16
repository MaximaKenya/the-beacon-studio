"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";

export function Services() {
  const { openBooking, openIntake } = useFeatures();
  const [automation, custom] = siteConfig.services;

  return (
    <section id="services" className="relative border-t border-border py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="Services"
          title="Two ways to hire us"
          description="Automate one task, or have us build software for you."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {automation && (
            <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
              <h3 className="font-display text-2xl font-semibold text-foreground">{automation.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{automation.description}</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                {siteConfig.automation.toolsLine}
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <Link
                  href="/automation"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  See how it works
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("cta_click", { type: "book", source: "services_automation" });
                    openBooking("automation-audit");
                  }}
                  className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:border-accent/40"
                >
                  Free 20-min audit
                </button>
              </div>
            </article>
          )}

          {custom && (
            <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
              <h3 className="font-display text-2xl font-semibold text-foreground">{custom.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{custom.description}</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                Websites, internal tools, and new products. We agree the work before we start.
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("cta_click", { type: "book", source: "services_custom" });
                    openBooking();
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  Book a free call
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("cta_click", { type: "intake", source: "services_custom" });
                    openIntake();
                  }}
                  className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:border-accent/40"
                >
                  Start a project
                </button>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
