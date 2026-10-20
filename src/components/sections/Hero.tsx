"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { trackEvent } from "@/lib/analytics";

const ACCENT_PHRASE = "repetitive work";

function headlineParts(text: string) {
  const index = text.toLowerCase().indexOf(ACCENT_PHRASE);
  if (index < 0) return { before: text, accent: "", after: "" };
  return {
    before: text.slice(0, index),
    accent: text.slice(index, index + ACCENT_PHRASE.length),
    after: text.slice(index + ACCENT_PHRASE.length),
  };
}

export function Hero() {
  const { openBooking } = useFeatures();
  const reducedMotion = useReducedMotion();
  const parts = headlineParts(siteConfig.heroHeadline);
  const shots = siteConfig.products.filter((product) => product.image);

  function bookAudit() {
    trackEvent("cta_click", { type: "book", source: "hero" });
    openBooking("automation-audit");
  }

  return (
    <section id="hero" className="relative px-6 pb-12 pt-28 lg:px-8 lg:pb-20 lg:pt-36">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <p className="text-sm font-medium text-accent">
            {siteConfig.brand.name} · {siteConfig.location}
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-heading sm:text-5xl lg:text-6xl">
            {parts.before}
            {parts.accent && <span className="gradient-text">{parts.accent}</span>}
            {parts.after}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {siteConfig.heroSubhead}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton
              onClick={bookAudit}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-background shadow-[0_12px_32px_color-mix(in_srgb,var(--accent)_35%,transparent)]"
            >
              {siteConfig.cta.primary}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MagneticButton>
            <MagneticButton
              href="#products"
              className="inline-flex h-12 items-center rounded-2xl bg-surface-elevated/80 px-5 text-sm font-semibold text-foreground shadow-[0_10px_28px_rgba(8,4,20,0.16)]"
            >
              {siteConfig.cta.secondary}
            </MagneticButton>
          </div>
          <p className="mt-5 text-sm text-muted">
            Free 20-minute audit. We agree success criteria before you pay a deposit.
          </p>
        </div>

        {shots.length > 0 && (
          <div className="relative mx-auto w-full max-w-lg pb-6">
            {shots.slice(0, 2).map((product, index) => (
              <motion.figure
                key={product.id}
                className={
                  index === 0
                    ? "relative z-10"
                    : "relative z-20 -mt-16 ml-auto w-[84%] sm:-mt-20"
                }
                animate={reducedMotion ? undefined : { y: [0, index === 0 ? -8 : -12, 0] }}
                transition={
                  reducedMotion
                    ? undefined
                    : { duration: 6 + index * 1.4, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <div className="sleek-card overflow-hidden rounded-3xl p-2 sm:p-3">
                  <div className="flex items-center gap-1.5 px-2 py-1.5" aria-hidden>
                    <span className="h-2 w-2 rounded-full bg-accent/80" />
                    <span className="h-2 w-2 rounded-full bg-accent-violet/80" />
                    <span className="h-2 w-2 rounded-full bg-accent-warm/80" />
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                    <Image
                      src={product.image}
                      alt={product.imageAlt || product.name}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 1024px) 480px, 90vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <figcaption className="px-2 py-2 text-xs text-muted">
                    {product.name} · {product.statusLabel}
                  </figcaption>
                </div>
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
