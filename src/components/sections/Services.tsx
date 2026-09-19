"use client";

import { ArrowRight, Layers, Rocket, Server, Sparkles } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useFeatures } from "@/providers/FeatureProvider";
import { AnimatedIcon, IconWrapper } from "@/components/ui/AnimatedIcon";
import { SoftImageCarousel } from "@/components/ui/SoftImageCarousel";

const icons = [Layers, Sparkles, Server, Rocket] as const;
const accents = ["cyan", "violet", "coral", "amber"] as const;

export function Services() {
  const { openBooking, openIntake } = useFeatures();
  const surfaceSlides = [
    ...siteConfig.products.map((p) => ({
      src: p.image,
      alt: p.name,
      caption: p.name,
    })),
    ...siteConfig.projects.slice(0, 2).map((p) => ({
      src: p.image,
      alt: p.title,
      caption: p.title,
    })),
  ];

  return (
    <section id="services" className="section-wash-skills relative overflow-hidden py-24 lg:py-32">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:items-start">
          <div>
            <ScrollReveal variant="fade-down">
              <SectionHeading
                label="Services"
                title="We build for clients"
                description="Custom apps, suite products, payments & portal — same craft as the cloud suite."
              />
            </ScrollReveal>

            <ScrollReveal stagger className="mt-4 space-y-3">
              {siteConfig.services.map((service, i) => {
                const Icon = icons[i % icons.length];
                const accent = accents[i % accents.length];
                return (
                  <StaggerChild key={service.id}>
                    <article className="soft-panel flex gap-4 rounded-3xl border border-border/50 px-4 py-5 first:mt-0">
                      <IconWrapper accent={accent} size="sm">
                        <AnimatedIcon icon={Icon} size="sm" animation="none" />
                      </IconWrapper>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {service.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                          {service.description}
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Related skills">
                          {service.tags.map((tag) => (
                            <li
                              key={tag}
                              className="rounded-xl border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted"
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </StaggerChild>
                );
              })}
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.1} className="lg:sticky lg:top-24">
            <div className="glass-panel rounded-3xl p-7 sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                What you gain
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                Ready to build?
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                {siteConfig.clientGains.map((gain) => (
                  <li key={gain} className="flex gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      aria-hidden
                    />
                    {gain}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3">
                <MagneticButton
                  onClick={() => openIntake()}
                  className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-accent px-6 text-sm font-semibold text-background shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover"
                >
                  Start a Project
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </MagneticButton>
                <MagneticButton
                  onClick={() => openBooking()}
                  className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-surface/50 px-6 text-sm font-semibold text-foreground transition-all hover:border-accent/40"
                >
                  Book a Call
                </MagneticButton>
                <MagneticButton
                  href="#engagement"
                  className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-muted transition-colors hover:text-accent"
                >
                  See engagement models
                </MagneticButton>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Full-width carousel — aligned to section container, not nested in left column */}
        <ScrollReveal delay={0.08} className="mt-12 w-full">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted">
            Launch partnerships
          </p>
          <SoftImageCarousel
            slides={surfaceSlides}
            intervalMs={5000}
            className="w-full"
            fit="contain"
            aspect="aspect-[16/9] sm:aspect-[2/1]"
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
