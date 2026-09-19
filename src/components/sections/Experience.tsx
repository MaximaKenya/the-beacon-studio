"use client";

import Image from "next/image";
import { Briefcase, Code2, Rocket, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionShapes } from "@/components/ui/SectionShapes";
import { AnimatedIcon, IconWrapper } from "@/components/ui/AnimatedIcon";

const accentRing: Record<string, string> = {
  cyan: "ring-accent/50 border-accent/40",
  coral: "ring-accent-warm/50 border-accent-warm/40",
  amber: "ring-accent-amber/50 border-accent-amber/40",
  violet: "ring-accent-violet/50 border-accent-violet/40",
};

const accentText: Record<string, string> = {
  cyan: "text-accent",
  coral: "text-accent-warm",
  amber: "text-accent-amber",
  violet: "text-accent-violet",
};

const accentWrapper: Record<string, "cyan" | "coral" | "amber" | "violet"> = {
  cyan: "cyan",
  coral: "coral",
  amber: "amber",
  violet: "violet",
};

function roleIcon(role: string): LucideIcon {
  const lower = role.toLowerCase();
  if (lower.includes("freelance") || lower.includes("independent")) return Briefcase;
  if (lower.includes("junior") || lower.includes("intern")) return Rocket;
  return Code2;
}

export function Experience() {
  return (
    <section id="experience" className="relative border-y border-border bg-surface/20 py-24 lg:py-32">
      <SectionShapes preset="experience" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal variant="fade-up">
          <SectionHeading
            label="Experience"
            title="Where I've made my mark"
            description="Every role taught me something — here's the journey so far."
          />
        </ScrollReveal>

        <div className="relative">
          <div
            className="absolute bottom-0 left-[19px] top-0 w-px bg-gradient-to-b from-accent-warm/60 via-border to-transparent md:left-1/2 md:-translate-x-px"
            aria-hidden
          />

          <ScrollReveal stagger>
            <ol className="space-y-12">
              {siteConfig.experience.map((entry, index) => {
                const ring = accentRing[entry.accent ?? "cyan"] ?? accentRing.cyan;
                const text = accentText[entry.accent ?? "cyan"] ?? accentText.cyan;
                const wrapperAccent = accentWrapper[entry.accent ?? "cyan"] ?? "cyan";
                const RoleIcon = roleIcon(entry.role);

                return (
                  <StaggerChild key={entry.id}>
                    <li className="relative md:grid md:grid-cols-2 md:gap-12">
                      <div
                        className={`mb-4 md:mb-0 ${
                          index % 2 === 0 ? "md:text-right" : "md:order-2 md:text-left"
                        }`}
                      >
                        <p className={`pl-12 font-mono text-sm md:pl-0 ${text}`}>
                          {entry.period}
                        </p>
                        {entry.current && (
                          <span className="mt-1 inline-flex items-center rounded-full border border-accent/30 bg-accent/15 px-2.5 py-0.5 pl-12 font-mono text-[10px] uppercase tracking-wider text-accent md:ml-0 md:pl-2.5">
                            Current
                          </span>
                        )}
                      </div>

                      <div
                        className={`absolute left-0 top-1 md:left-1/2 md:-translate-x-1/2 ${ring}`}
                        aria-hidden
                      >
                        <IconWrapper accent={wrapperAccent} size="sm" rounded="full" className="ring-2">
                          {entry.logo ? (
                            <Image
                              src={entry.logo}
                              alt=""
                              width={20}
                              height={20}
                              className="h-5 w-5 object-contain"
                            />
                          ) : (
                            <AnimatedIcon icon={RoleIcon} size="sm" animation="none" />
                          )}
                        </IconWrapper>
                      </div>

                      <div
                        className={`pl-12 md:pl-0 ${
                          index % 2 === 0 ? "md:order-2" : "md:order-1 md:text-right"
                        }`}
                      >
                        <div className="gradient-border glass-panel rounded-2xl p-6 transition-all hover:border-accent-warm/30 hover:shadow-lg hover:shadow-accent/5">
                          <h3 className="font-display text-lg font-semibold text-foreground">
                            {entry.role}
                          </h3>
                          <p className={`mt-1 text-sm font-medium ${text}`}>{entry.company}</p>
                          <p className="mt-3 text-sm leading-relaxed text-muted">
                            {entry.description}
                          </p>
                          <ul
                            className={`mt-4 flex flex-wrap gap-2 ${
                              index % 2 !== 0 ? "md:justify-end" : ""
                            }`}
                          >
                            {entry.tags.map((tag) => (
                              <li
                                key={tag}
                                className="rounded-md border border-border bg-background/50 px-2 py-0.5 font-mono text-xs text-muted"
                              >
                                {tag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  </StaggerChild>
                );
              })}
            </ol>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
