"use client";

import { siteConfig } from "@/data/site";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { BeaconWordmark } from "@/components/brand/BeaconWordmark";
import { SuiteLine } from "@/components/brand/SuiteLine";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useFeatures } from "@/providers/FeatureProvider";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Phone } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  const reducedMotion = useReducedMotion();
  const { openIntake, openBooking } = useFeatures();

  return (
    <section
      id="hero"
      className="relative flex min-h-[88vh] items-center overflow-hidden px-6 pt-24 pb-16 lg:min-h-screen lg:px-8 lg:pb-20"
    >
      <AnimatedBackground subtle />

      {siteConfig.heroVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
          aria-hidden
        >
          <source src={siteConfig.heroVideo} type="video/mp4" />
        </video>
      )}

      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center"
        {...(reducedMotion
          ? {}
          : { variants: containerVariants, initial: "hidden", animate: "visible" })}
      >
        <motion.div
          className="mb-8"
          {...(reducedMotion ? {} : { variants: itemVariants })}
        >
          <BeaconWordmark size="lg" variant="full" />
        </motion.div>

        <motion.p
          className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-muted"
          {...(reducedMotion ? {} : { variants: itemVariants })}
        >
          {siteConfig.brand.name} — {siteConfig.brand.lockup}
        </motion.p>

        <motion.p
          className="mb-5 text-sm font-medium text-accent"
          {...(reducedMotion ? {} : { variants: itemVariants })}
        >
          Software product studio · Nairobi · EAT
        </motion.p>

        <motion.h1
          className="font-display text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          {...(reducedMotion ? {} : { variants: itemVariants })}
        >
          {siteConfig.heroHeadline}
        </motion.h1>

        <motion.div
          className="mt-6 w-full max-w-2xl"
          {...(reducedMotion ? {} : { variants: itemVariants })}
        >
          <SuiteLine size="md" align="center" />
        </motion.div>

        <motion.p
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted lg:text-lg"
          {...(reducedMotion ? {} : { variants: itemVariants })}
        >
          {siteConfig.heroSubhead}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          {...(reducedMotion ? {} : { variants: itemVariants })}
        >
          <MagneticButton
            href="#products"
            className="inline-flex h-12 min-w-[168px] items-center justify-center gap-2 rounded-2xl bg-accent px-7 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            {siteConfig.cta.primary}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </MagneticButton>
          <MagneticButton
            onClick={() => openIntake()}
            className="inline-flex h-12 min-w-[168px] cursor-pointer items-center justify-center rounded-2xl border border-border bg-surface/40 px-7 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-surface"
          >
            {siteConfig.cta.secondary}
          </MagneticButton>
          <MagneticButton
            onClick={() => openBooking()}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {siteConfig.cta.tertiary}
          </MagneticButton>
        </motion.div>
      </motion.div>

      {!reducedMotion && (
        <motion.a
          href="#products"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-muted transition-colors hover:text-accent"
          aria-label="Scroll to products"
        >
          <ArrowDown className="h-5 w-5" aria-hidden />
        </motion.a>
      )}
    </section>
  );
}
