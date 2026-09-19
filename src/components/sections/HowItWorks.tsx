"use client";

import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SoftImageCarousel } from "@/components/ui/SoftImageCarousel";
import { FileText, Hammer, Rocket } from "lucide-react";

const stepVisuals = [
  {
    icon: FileText,
    wash: "from-accent/15 via-transparent to-accent-violet/10",
  },
  {
    icon: Hammer,
    wash: "from-accent-warm/12 via-transparent to-accent/10",
  },
  {
    icon: Rocket,
    wash: "from-accent-violet/12 via-transparent to-accent-amber/10",
  },
] as const;

export function HowItWorks() {
  const processSlides = siteConfig.projects.map((p) => ({
    src: p.image,
    alt: p.title,
    caption: p.title,
  }));

  return (
    <section id="process" className="relative overflow-hidden py-24 lg:py-32">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="How it works"
            title="Brief → build → live"
            description="Weekly demos. Clear pricing. Less risk."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.06} className="mt-2 w-full">
          <SoftImageCarousel
            slides={processSlides}
            intervalMs={5200}
            className="w-full"
            fit="contain"
            aspect="aspect-[16/9] sm:aspect-[2/1]"
          />
        </ScrollReveal>

        <ScrollReveal stagger className="relative mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
          {siteConfig.howItWorks.map((step, i) => {
            const visual = stepVisuals[i % stepVisuals.length];
            const Icon = visual.icon;
            return (
              <StaggerChild key={step.id}>
                <article className="soft-panel group relative overflow-hidden rounded-3xl border border-border/70 p-6 transition-colors hover:border-accent/35">
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visual.wash} opacity-80`}
                    aria-hidden
                  />
                  <div className="relative">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/25 bg-background/80 text-accent">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="font-mono text-xs text-muted">
                        {String(step.step).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                </article>
              </StaggerChild>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
