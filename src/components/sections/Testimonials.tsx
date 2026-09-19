"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

export function Testimonials() {
  if (siteConfig.testimonials.length === 0) return null;

  return (
    <section aria-label="Testimonials" className="relative overflow-hidden py-24 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-accent-violet/[0.05]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal variant="fade-up">
          <SectionHeading
            label="Testimonials"
            title="Trusted by teams we've built with"
            description="Kind words from collaborators — replace placeholders with real client quotes."
          />
        </ScrollReveal>

        <ScrollReveal stagger className="grid gap-6 md:grid-cols-2">
          {siteConfig.testimonials.map((item) => (
            <StaggerChild key={item.id}>
              <figure className="soft-panel relative overflow-hidden rounded-3xl border border-border/60 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-8">
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl"
                  aria-hidden
                />
                <AnimatedIcon
                  icon={Quote}
                  size="xl"
                  animation="none"
                  className="relative text-accent/30"
                />
                <blockquote className="relative mt-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="relative mt-6 flex items-center gap-4 border-t border-border/70 pt-4">
                  {item.avatar && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-accent/30 shadow-md">
                      <Image
                        src={item.avatar}
                        alt={`Photo of ${item.author}`}
                        fill
                        sizes="48px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <cite className="not-italic">
                    <span className="font-display font-semibold text-foreground">
                      {item.author}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">{item.role}</span>
                  </cite>
                </figcaption>
              </figure>
            </StaggerChild>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
