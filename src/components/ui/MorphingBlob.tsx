"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type MorphingBlobProps = {
  className?: string;
  color?: string;
  secondaryColor?: string;
  size?: number;
  blur?: number;
  parallax?: boolean;
  index?: number;
};

const BLOB_PATHS = [
  "M40,80 C20,60 10,30 40,20 C70,10 90,40 80,70 C70,100 60,100 40,80 Z",
  "M40,75 C15,55 20,25 45,15 C75,5 95,45 75,75 C55,105 65,95 40,75 Z",
  "M42,78 C25,58 8,35 38,18 C68,2 92,38 82,68 C72,98 58,102 42,78 Z",
  "M38,82 C18,62 12,28 42,16 C72,4 88,42 78,72 C68,102 52,98 38,82 Z",
  "M40,80 C20,60 10,30 40,20 C70,10 90,40 80,70 C70,100 60,100 40,80 Z",
];

export function MorphingBlob({
  className = "",
  color = "var(--accent)",
  secondaryColor,
  size = 400,
  blur = 80,
  parallax = false,
  index = 0,
}: MorphingBlobProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [15 * (index + 1), -15 * (index + 1)]);

  const gradientId = `blob-gradient-${index}`;
  const fill = secondaryColor ? `url(#${gradientId})` : color;

  return (
    <motion.div
      ref={ref}
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: size,
        height: size,
        filter: `blur(${blur}px)`,
        y: parallax && !reducedMotion ? parallaxY : undefined,
      }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
        {secondaryColor && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.15" />
            </linearGradient>
          </defs>
        )}
        {reducedMotion ? (
          <path d={BLOB_PATHS[0]} fill={fill} fillOpacity={secondaryColor ? 1 : 0.22} />
        ) : (
          <motion.path
            fill={fill}
            fillOpacity={secondaryColor ? 1 : 0.22}
            animate={{ d: BLOB_PATHS }}
            transition={{ duration: 20 + index * 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </svg>
    </motion.div>
  );
}

type MorphingBlobGroupProps = {
  className?: string;
  blobs?: Array<{
    className?: string;
    color?: string;
    secondaryColor?: string;
    size?: number;
    blur?: number;
  }>;
};

export function MorphingBlobGroup({ className = "", blobs }: MorphingBlobGroupProps) {
  const defaults = [
    { className: "-left-32 top-20", color: "var(--accent)", secondaryColor: "var(--accent-warm)", size: 260, blur: 90 },
    { className: "-right-24 bottom-10", color: "var(--accent-violet)", secondaryColor: "var(--accent)", size: 220, blur: 85 },
  ];

  const items = blobs ?? defaults;

  return (
    <div className={className} aria-hidden>
      {items.map((blob, i) => (
        <MorphingBlob key={i} {...blob} parallax index={i} />
      ))}
    </div>
  );
}
