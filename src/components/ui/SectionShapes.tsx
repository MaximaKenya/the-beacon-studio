"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ComponentType } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type SectionShapePreset = "hero" | "about" | "skills" | "projects" | "experience" | "contact";

type SectionShapesProps = {
  preset: SectionShapePreset;
  className?: string;
};

const glow = (color: string) =>
  `drop-shadow(0 0 12px color-mix(in srgb, ${color} 55%, transparent)) drop-shadow(0 0 24px color-mix(in srgb, ${color} 25%, transparent))`;

function HeroBurst({ reduced }: { reduced: boolean }) {
  const shapes = [
    { type: "ring", top: "12%", left: "82%", size: 40, color: "var(--accent-warm)", delay: 0.3 },
    { type: "plus", top: "72%", left: "6%", size: 24, color: "var(--accent-violet)", delay: 0.6 },
    { type: "arc", top: "58%", left: "88%", size: 50, color: "var(--accent-amber)", delay: 0.2 },
    { type: "blob", top: "28%", left: "90%", size: 32, color: "var(--accent)", delay: 0.8 },
  ];

  return (
    <>
      {shapes.map((s, i) => (
        <FloatingShape key={i} {...s} reduced={reduced} layer={i % 3} intensity={0.7} />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,color-mix(in_srgb,var(--accent)_4%,transparent),transparent)]" />
    </>
  );
}

function AboutCircles({ reduced }: { reduced: boolean }) {
  const circles = [
    { top: "8%", left: "4%", size: 76, color: "var(--accent-warm)", opacity: 0.22 },
    { top: "60%", left: "88%", size: 64, color: "var(--accent-amber)", opacity: 0.2 },
  ];

  return (
    <>
      {circles.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            borderColor: `color-mix(in srgb, ${c.color} 70%, transparent)`,
            background: `radial-gradient(circle, color-mix(in srgb, ${c.color} ${c.opacity * 100}%, transparent) 0%, transparent 70%)`,
            filter: glow(c.color),
          }}
          {...(reduced
            ? {}
            : {
                animate: { scale: [1, 1.03, 1], opacity: [0.4, 0.55, 0.4] },
                transition: { duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
              })}
        />
      ))}
      <div
        className="absolute inset-0 hidden opacity-[0.06] md:block [background-image:radial-gradient(circle,color-mix(in_srgb,var(--accent-warm)_40%,transparent)_1px,transparent_1px)] [background-size:28px_28px]"
        aria-hidden
      />
    </>
  );
}

function SkillsHexGrid({ reduced }: { reduced: boolean }) {
  const hexes = [
    { top: "10%", left: "90%", size: 30, color: "var(--accent-violet)" },
    { top: "75%", left: "5%", size: 34, color: "var(--accent)" },
  ];

  return (
    <>
      {hexes.map((h, i) => (
        <motion.svg
          key={i}
          className="absolute"
          style={{ top: h.top, left: h.left, width: h.size, height: h.size, filter: glow(h.color) }}
          viewBox="0 0 80 80"
          aria-hidden
          {...(reduced
            ? {}
            : {
                animate: { rotate: [0, 8, 0], y: [0, -6, 0] },
                transition: { duration: 10 + i, repeat: Infinity, ease: "easeInOut" },
              })}
        >
          <polygon
            points="40,4 76,22 76,58 40,76 4,58 4,22"
            fill={`color-mix(in srgb, ${h.color} 35%, transparent)`}
            stroke={h.color}
            strokeWidth="2"
            strokeOpacity="0.6"
          />
        </motion.svg>
      ))}
      <div
        className="absolute inset-0 hidden opacity-[0.04] md:block [background-image:linear-gradient(30deg,color-mix(in_srgb,var(--accent-violet)_30%,transparent)_1px,transparent_1px),linear-gradient(150deg,color-mix(in_srgb,var(--accent-violet)_30%,transparent)_1px,transparent_1px)] [background-size:40px_69px]"
        aria-hidden
      />
    </>
  );
}

function ProjectsDiagonals({ reduced }: { reduced: boolean }) {
  const lines = [
    { top: "5%", left: "0%", width: "45%", rotate: 25, color: "var(--accent-warm)" },
    { top: "70%", left: "10%", width: "40%", rotate: 32, color: "var(--accent)" },
  ];

  return (
    <>
      {lines.map((l, i) => (
        <motion.div
          key={i}
          className="absolute h-px origin-left"
          style={{
            top: l.top,
            left: l.left,
            width: l.width,
            rotate: `${l.rotate}deg`,
            background: `linear-gradient(90deg, ${l.color}, transparent)`,
            boxShadow: `0 0 16px color-mix(in srgb, ${l.color} 50%, transparent)`,
            opacity: 0.4,
          }}
          {...(reduced
            ? {}
            : {
                animate: { opacity: [0.3, 0.5, 0.3], scaleX: [0.98, 1, 0.98] },
                transition: { duration: 7 + i, repeat: Infinity, ease: "easeInOut" },
              })}
        />
      ))}
      <FloatingShape
        type="diamond"
        top="45%"
        left="88%"
        size={18}
        color="var(--accent-violet)"
        delay={0.4}
        reduced={reduced}
        layer={0}
      />
    </>
  );
}

function ExperienceNodes({ reduced }: { reduced: boolean }) {
  return (
    <FloatingShape type="ring" top="15%" left="3%" size={36} color="var(--accent)" delay={0} reduced={reduced} layer={0} />
  );
}

function ContactShapes({ reduced }: { reduced: boolean }) {
  return (
    <FloatingShape type="blob" top="75%" left="5%" size={36} color="var(--accent-violet)" delay={0.3} reduced={reduced} layer={0} />
  );
}

const presets: Record<SectionShapePreset, ComponentType<{ reduced: boolean }>> = {
  hero: HeroBurst,
  about: AboutCircles,
  skills: SkillsHexGrid,
  projects: ProjectsDiagonals,
  experience: ExperienceNodes,
  contact: ContactShapes,
};

type FloatingShapeProps = {
  type: string;
  top: string;
  left: string;
  size: number;
  color: string;
  delay?: number;
  reduced: boolean;
  layer?: number;
  intensity?: number;
};

function FloatingShape({
  type,
  top,
  left,
  size,
  color,
  delay = 0,
  reduced,
  layer = 0,
  intensity = 1,
}: FloatingShapeProps) {
  const zIndex = 1 + layer;
  const filter = glow(color);

  const svg = renderShape(type, size, color, intensity, filter);

  return (
    <div className="absolute hidden sm:block" style={{ top, left, zIndex }}>
      {reduced ? (
        svg
      ) : (
        <motion.div
          animate={{
            y: [0, -8 * intensity, 0],
            rotate: type === "plus" ? [0, 45, 0] : [0, 6, 0],
            opacity: [0.2, 0.32, 0.2],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 5 + layer,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        >
          {svg}
        </motion.div>
      )}
    </div>
  );
}

function renderShape(type: string, size: number, color: string, intensity: number, filter: string) {
  const fillOpacity = 0.35 + intensity * 0.15;
  const strokeOpacity = 0.85;

  switch (type) {
    case "ring":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" style={{ filter }} aria-hidden>
          <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="3" strokeOpacity={strokeOpacity} />
          <circle cx="32" cy="32" r="14" fill={color} fillOpacity={fillOpacity * 0.4} />
        </svg>
      );
    case "plus":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" style={{ filter }} aria-hidden>
          <path d="M16 4v24M4 16h24" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeOpacity={strokeOpacity} />
        </svg>
      );
    case "arc":
      return (
        <svg width={size} height={size / 2} viewBox="0 0 80 40" style={{ filter }} aria-hidden>
          <path
            d="M4 36 C20 4, 60 4, 76 36"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeOpacity={strokeOpacity}
          />
        </svg>
      );
    case "blob":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" style={{ filter }} aria-hidden>
          <path
            d="M24 4 C36 4 44 14 42 26 C40 38 28 44 18 40 C8 36 4 24 10 14 C14 8 18 4 24 4 Z"
            fill={color}
            fillOpacity={fillOpacity}
          />
        </svg>
      );
    case "sparkle":
      return (
        <span
          className="block font-bold leading-none"
          style={{ fontSize: size, color, filter, opacity: strokeOpacity }}
          aria-hidden
        >
          ✦
        </span>
      );
    case "diamond":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter }} aria-hidden>
          <path d="M12 2l10 10-10 10L2 12 12 2z" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter }} aria-hidden>
          <circle cx="12" cy="12" r="10" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
  }
}

export function SectionShapes({ preset, className = "" }: SectionShapesProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [10, -10]);

  const PresetComponent = presets[preset];

  return (
    <motion.div
      ref={ref}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={reducedMotion ? undefined : { y: parallaxY }}
      aria-hidden
    >
      <PresetComponent reduced={reducedMotion} />
    </motion.div>
  );
}
