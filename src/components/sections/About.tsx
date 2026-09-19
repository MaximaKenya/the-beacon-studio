"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, MapPin, Phone, Play } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProfilePhoto } from "@/components/ui/ProfilePhoto";
import { AnimatedIcon, IconWrapper } from "@/components/ui/AnimatedIcon";
import { mailtoHref, phoneHref, trackCallClick, trackEmailClick } from "@/lib/contact-actions";

/**
 * Single founder section — heading once, then polaroid + bio (+ optional intro video).
 */
export function About() {
  const { meetMeVideo } = siteConfig;
  const [playing, setPlaying] = useState(false);
  const bioParagraphs = siteConfig.founder.bio
    .trim()
    .split(/\n\n+/)
    .filter(Boolean);

  return (
    <section id="about" className="section-wash-about relative overflow-hidden py-24 lg:py-32">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal variant="slide-right">
          <SectionHeading
            label="Founder"
            title="Meet the founder"
            description="Nairobi / EAT · products you can use · custom builds when you need them."
          />
        </ScrollReveal>

        <div className="grid items-start gap-12 lg:grid-cols-[300px_1fr] lg:gap-16">
          <ScrollReveal delay={0.1} variant="scale-in" className="order-2 lg:order-1">
            <ProfilePhoto
              src={siteConfig.profileImage}
              alt={siteConfig.profileImageAlt}
              badges={["Builder", "Human"]}
              priority
            />
          </ScrollReveal>

          <ScrollReveal delay={0.2} variant="slide-left" className="order-1 lg:order-2">
            <div className="space-y-6">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">
                {siteConfig.founder.shortName} · {siteConfig.founder.role}
              </p>

              <div className="space-y-4 text-base leading-relaxed text-muted">
                {bioParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>

              <ul className="space-y-2.5 text-base leading-relaxed text-muted">
                <li className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  Cloud products + custom TypeScript you can own
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  Clear scope, weekly demos, transparent pricing
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  Remote-friendly · based in Nairobi (EAT)
                </li>
              </ul>

              {siteConfig.founder.location && (
                <div className="inline-flex items-center gap-2 text-sm text-muted">
                  <IconWrapper accent="coral" size="sm">
                    <AnimatedIcon icon={MapPin} size="sm" animation="none" />
                  </IconWrapper>
                  {siteConfig.founder.location} ·{" "}
                  {siteConfig.founder.timezone.replace("_", " ")}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {siteConfig.personalityTraits.map((trait) => (
                  <span
                    key={trait.label}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-accent/15 bg-accent/5 px-3.5 py-1.5 text-sm font-medium text-foreground"
                  >
                    {trait.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#services"
                  className="rounded-2xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/30 hover:text-accent"
                >
                  Hire the studio
                </a>
                <a
                  href={mailtoHref("Hello from the site")}
                  onClick={() => trackEmailClick("about")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
                <a
                  href={phoneHref()}
                  onClick={() => trackCallClick("about")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent/30 hover:text-accent"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {meetMeVideo?.url && (
          <ScrollReveal delay={0.12} className="mt-14 lg:mt-16">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted">
              {meetMeVideo.caption || "A quick hello"}
            </p>
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface/50 shadow-xl shadow-accent/5">
              <div className="relative aspect-video w-full">
                {playing ? (
                  <iframe
                    src={`${meetMeVideo.url}?autoplay=1`}
                    title={meetMeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    className="group relative h-full w-full cursor-pointer"
                    aria-label={`Play video: ${meetMeVideo.title}`}
                  >
                    <Image
                      src={meetMeVideo.poster}
                      alt={`Video poster for ${meetMeVideo.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/40 bg-accent/20 text-accent backdrop-blur-sm transition-all group-hover:scale-110 group-hover:bg-accent group-hover:text-background">
                      <Play className="ml-1 h-7 w-7 fill-current" aria-hidden />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
