"use client";

import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { LiftCard } from "@/components/ui/LiftCard";

export function HowItWorks() {
  return (
    <section id="process" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="How we work"
          title="Three steps"
          description="The same path for automation and custom software."
        />

        <ScrollReveal stagger className="grid gap-6 md:grid-cols-3">
          {siteConfig.howItWorks.map((step) => (
            <StaggerChild key={step.id} className="h-full">
              <LiftCard className="h-full">
                <article className="sleek-card h-full rounded-3xl p-6">
                  <p className="font-display text-sm font-semibold text-accent">
                    {String(step.step).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
                </article>
              </LiftCard>
            </StaggerChild>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
