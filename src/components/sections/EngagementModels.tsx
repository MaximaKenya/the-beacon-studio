"use client";

import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useFeatures } from "@/providers/FeatureProvider";
import { ArrowRight } from "lucide-react";

export function EngagementModels() {
  const { openIntake, openBooking } = useFeatures();

  return (
    <section id="engagement" className="section-wash-about relative overflow-hidden py-24 lg:py-32">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="Engagement"
            title="How we partner"
            description="Three studio postures — pick the shape that fits your stage. Details land after a short discovery."
          />
        </ScrollReveal>

        <ScrollReveal stagger className="mt-2 grid gap-6 lg:grid-cols-3">
          {siteConfig.engagementModels.map((model) => (
            <StaggerChild key={model.id}>
              <article className="gradient-border flex h-full flex-col rounded-2xl border border-border/70 bg-surface/40 p-6 backdrop-blur-sm lg:p-7">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  {model.name}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground">
                  {model.headline}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {model.description}
                </p>
                <p className="mt-4 text-xs text-muted">
                  Best for: <span className="text-foreground">{model.bestFor}</span>
                </p>
                <ul className="mt-4 space-y-1.5">
                  {model.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            </StaggerChild>
          ))}
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mt-12 flex flex-wrap gap-3">
            <MagneticButton
              onClick={() => openIntake()}
              className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-background shadow-lg shadow-accent/20 hover:bg-accent-hover"
            >
              Start a Project
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton
              onClick={() => openBooking()}
              className="inline-flex h-12 cursor-pointer items-center rounded-xl border border-border bg-surface/50 px-6 text-sm font-semibold text-foreground hover:border-accent/40"
            >
              Book a Call
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
