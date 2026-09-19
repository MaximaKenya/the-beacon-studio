"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type SoftSlide = {
  src: string;
  alt: string;
  caption?: string;
};

type SoftImageCarouselProps = {
  slides: SoftSlide[];
  intervalMs?: number;
  className?: string;
  aspect?: string;
  /** Logos/wordmarks should contain; photos can cover. Default contain avoids clipping. */
  fit?: "contain" | "cover";
};

/**
 * Soft rounded image carousel — product/project visuals without card clutter.
 * Uses padded object-contain by default so logos aren't truncated.
 */
export function SoftImageCarousel({
  slides,
  intervalMs = 4500,
  className = "",
  aspect = "aspect-[16/10]",
  fit = "contain",
}: SoftImageCarouselProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const safe = slides.filter((s) => s.src);

  useEffect(() => {
    if (reduced || safe.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % safe.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reduced, safe.length, intervalMs]);

  if (safe.length === 0) return null;

  const current = safe[index % safe.length];
  const isContain = fit === "contain";

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative rounded-3xl border border-border/60 bg-surface/40 shadow-sm ${aspect}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.src + index}
            className={`absolute inset-0 flex items-center justify-center ${
              isContain ? "p-5 sm:p-7 md:p-8" : ""
            }`}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div
              className={`relative h-full w-full ${
                isContain ? "" : "overflow-hidden rounded-3xl"
              }`}
            >
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes="(max-width: 768px) 100vw, 1152px"
                className={
                  isContain
                    ? "object-contain object-center"
                    : "object-cover object-center"
                }
                priority={index === 0}
              />
            </div>
            {!isContain && (
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent"
                aria-hidden
              />
            )}
            {current.caption && (
              <p
                className={`absolute bottom-3 left-4 right-4 text-left text-sm font-medium ${
                  isContain
                    ? "rounded-xl border border-border/50 bg-background/85 px-3 py-1.5 text-foreground backdrop-blur-sm"
                    : "text-foreground"
                }`}
              >
                {current.caption}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {safe.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Slides">
          {safe.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-accent" : "w-1.5 bg-border hover:bg-muted"
              }`}
              aria-label={`Show slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
