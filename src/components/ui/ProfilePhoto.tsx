"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ProfilePhotoProps = {
  src: string;
  alt: string;
  badges?: string[];
  className?: string;
  priority?: boolean;
};

/**
 * Original polaroid treatment — gradient ring, tilt, floating badges.
 * Restored from pre-FramedImage design (local history FYon.tsx).
 */
export function ProfilePhoto({
  src,
  alt,
  badges = ["Builder", "Human"],
  className = "",
  priority = false,
}: ProfilePhotoProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={`relative ${className}`}>
      {/* Gradient ring glow */}
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-accent via-accent-warm to-accent-violet opacity-60 blur-md" />

      <motion.div
        className="relative rotate-[-3deg] transition-transform hover:rotate-0"
        {...(reducedMotion
          ? {}
          : {
              animate: { y: [0, -8, 0], rotate: [-3, -1, -3] },
              whileHover: { rotate: 2, scale: 1.03 },
              transition: {
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                type: "spring",
                stiffness: 300,
              },
            })}
      >
        {/* Polaroid frame */}
        <div className="rounded-2xl border border-border bg-surface-elevated p-3 shadow-2xl shadow-accent/10">
          <div className="relative aspect-square w-64 overflow-hidden rounded-xl sm:w-72">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 640px) 256px, 288px"
              className="object-cover"
              priority={priority}
            />
          </div>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-muted">
            {alt.split(" ")[0]} ✦
          </p>
        </div>
      </motion.div>

      {/* Floating badges */}
      {badges.map((badge, i) => (
        <motion.span
          key={badge}
          className="absolute z-10 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-background/90 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent shadow-lg backdrop-blur-sm"
          style={{
            top: i === 0 ? "-8px" : "auto",
            bottom: i === 1 ? "-8px" : "auto",
            right: i === 0 ? "-12px" : "auto",
            left: i === 1 ? "-12px" : "auto",
          }}
          {...(reducedMotion
            ? {}
            : {
                animate: { y: [0, -6, 0] },
                transition: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" },
              })}
        >
          {i === 0 && <Sparkles className="h-3 w-3" aria-hidden />}
          {badge}
        </motion.span>
      ))}
    </div>
  );
}
