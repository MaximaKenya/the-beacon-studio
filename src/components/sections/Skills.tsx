"use client";

import type { ReactNode } from "react";
import { Braces, Cpu, Palette } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionShapes } from "@/components/ui/SectionShapes";
import { AnimatedIcon, IconWrapper } from "@/components/ui/AnimatedIcon";
import { TiltCard } from "@/components/ui/TiltCard";

const categoryIcons = [Braces, Cpu, Palette];
const categoryAccents = ["cyan", "violet", "coral"] as const;
const categoryAnimations = ["subtle", "subtle", "subtle"] as const;

const variantClasses: Record<string, string> = {
  large: "md:col-span-1 md:row-span-2",
  wide: "md:col-span-2",
  default: "",
};

const accentBg: Record<string, string> = {
  cyan: "from-accent/20 to-accent/5",
  coral: "from-accent-warm/20 to-accent-warm/5",
  amber: "from-accent-amber/20 to-accent-amber/5",
  violet: "from-accent-violet/20 to-accent-violet/5",
};

function SkillShape({ shape, accent }: { shape?: string; accent?: string }) {
  const bg = accentBg[accent ?? "cyan"] ?? accentBg.cyan;

  const shapes: Record<string, ReactNode> = {
    circle: (
      <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${bg} opacity-90`} />
    ),
    hexagon: (
      <svg className="absolute -right-4 -top-4 h-24 w-24 opacity-80" viewBox="0 0 80 80" aria-hidden>
        <polygon
          points="40,4 76,22 76,58 40,76 4,58 4,22"
          fill="currentColor"
          className="text-accent/30"
        />
      </svg>
    ),
    diamond: (
      <div className={`absolute -right-5 top-4 h-20 w-20 rotate-45 bg-gradient-to-br ${bg} opacity-85`} />
    ),
    squiggle: (
      <svg className="absolute -left-2 bottom-2 h-14 w-28 text-accent-warm/45" viewBox="0 0 96 24" aria-hidden>
        <path d="M2 12c16-10 32 10 46 0s30 10 46 0" stroke="currentColor" strokeWidth="3.5" fill="none" />
      </svg>
    ),
  };

  return shapes[shape ?? "circle"] ?? shapes.circle;
}

export function Skills() {
  return (
    <section id="skills" className="section-wash-skills relative overflow-hidden py-24 lg:py-32">
      <SectionShapes preset="skills" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal variant="fade-down">
          <SectionHeading
            label="Skills"
            title="Tools in my toolkit"
            description="The tech I reach for when turning wild ideas into real products."
          />
        </ScrollReveal>

        <ScrollReveal stagger className="grid auto-rows-fr gap-4 md:grid-cols-3 md:gap-5">
          {siteConfig.skills.map((category, categoryIndex) => {
            const Icon = categoryIcons[categoryIndex] ?? Braces;
            const accent = categoryAccents[categoryIndex] ?? "cyan";
            const animation = categoryAnimations[categoryIndex] ?? "bounce";
            const variant = category.variant ?? "default";

            return (
              <StaggerChild key={category.name} className={variantClasses[variant] ?? ""}>
                <TiltCard className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-sm sm:p-7">
                  <SkillShape shape={category.shape} accent={category.accent} />

                  <div className="relative mb-4 flex items-center gap-3">
                    <IconWrapper accent={accent} size="sm">
                      <AnimatedIcon icon={Icon} size="sm" animation={animation} strokeWidth={1.75} />
                    </IconWrapper>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {category.name}
                    </h3>
                  </div>

                  <ul className="relative flex flex-1 flex-wrap content-start gap-2">
                    {category.skills.map((skill) => (
                      <li key={skill}>
                        <span className="inline-block rounded-lg border border-border bg-background/60 px-3 py-1.5 font-mono text-sm text-muted transition-colors hover:border-accent-warm/40 hover:text-accent-warm">
                          {skill}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {variant === "large" && (
                    <p className="relative mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted/70">
                      Clean code, strong types, and a dash of personality in every commit.
                    </p>
                  )}
                </TiltCard>
              </StaggerChild>
            );
          })}

          <StaggerChild className="md:col-span-1">
            <div className="relative flex h-full min-h-[140px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-accent-warm/50 bg-gradient-to-br from-accent-warm/15 to-accent/8 p-6 text-center">
              <span className="absolute -right-4 -top-4 text-5xl text-accent-warm/50" aria-hidden>
                ✦
              </span>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent-warm">
                Always learning
              </p>
              <p className="mt-2 font-display text-sm font-medium text-foreground">
                New tools, new patterns, same curiosity
              </p>
            </div>
          </StaggerChild>
        </ScrollReveal>
      </div>
    </section>
  );
}
