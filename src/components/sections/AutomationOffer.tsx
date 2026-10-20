"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";

type AutomationOfferProps = {
  /** Homepage anchor. The /automation page uses the same id. */
  id?: string;
  /** Outreach page is the document title. Homepage stays an h2 under the hero. */
  titleAs?: "h1" | "h2";
};

export function AutomationOffer({ id = "automation", titleAs = "h2" }: AutomationOfferProps) {
  const { automation } = siteConfig;
  const { openBooking, openIntake } = useFeatures();

  return (
    <section id={id} className="relative overflow-hidden py-28 lg:py-40">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            as={titleAs}
            label="Automation"
            title={automation.headline}
            description={automation.supporting}
          />
        </ScrollReveal>

        <ScrollReveal stagger className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {automation.steps.map((step, index) => (
            <StaggerChild key={step.id}>
              <article className="soft-panel h-full rounded-3xl border border-border/60 px-6 py-8">
                <p className="font-mono text-xs text-accent">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{step.description}</p>
              </article>
            </StaggerChild>
          ))}
        </ScrollReveal>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted">
          Built on your tools: {automation.toolsLine}
        </p>

        <ScrollReveal stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {automation.useCases.map((useCase) => (
            <StaggerChild key={useCase.id}>
              <article className="rounded-3xl border border-border/60 bg-surface/50 px-6 py-6">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {useCase.id === "smes" ? (
                    useCase.industry
                  ) : (
                    <Link href={`/industries/${useCase.id}`} className="hover:text-accent">
                      {useCase.industry}
                    </Link>
                  )}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-muted">{useCase.line}</p>
              </article>
            </StaggerChild>
          ))}
        </ScrollReveal>

        <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => {
              trackEvent("cta_click", { type: "book", source: "automation" });
              openBooking("automation-audit");
            }}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-accent px-6 text-sm font-semibold text-background hover:bg-accent-hover"
          >
            {automation.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => {
              trackEvent("cta_click", { type: "intake", source: "automation" });
              openIntake("ai-automation");
            }}
            className="text-sm font-medium text-muted hover:text-accent"
          >
            Or start a project
          </button>
          <Link href="/book" className="text-sm font-medium text-accent hover:underline">
            Pick a time on the booking page
          </Link>
        </div>
      </div>
    </section>
  );
}
