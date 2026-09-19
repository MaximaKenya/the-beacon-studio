"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export const ICON_SIZES = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

export type IconSize = keyof typeof ICON_SIZES;
export type IconAnimation = "rotate" | "bounce" | "draw" | "pulse" | "wiggle" | "subtle" | "none";

type AnimatedIconProps = {
  icon: LucideIcon;
  size?: IconSize;
  animation?: IconAnimation;
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
};

const hoverVariants = {
  rotate: { rotate: [0, -8, 8, 0], transition: { duration: 0.4 } },
  bounce: { y: [0, -3, 0], scale: [1, 1.08, 1], transition: { duration: 0.35, type: "spring" as const, stiffness: 400 } },
  draw: { scale: [1, 1.12, 1], opacity: [1, 0.85, 1], transition: { duration: 0.35 } },
  pulse: { scale: [1, 1.05, 1], transition: { duration: 0.45 } },
  wiggle: { rotate: [0, -5, 5, 0], transition: { duration: 0.4 } },
  subtle: { scale: 1.05, transition: { duration: 0.2, ease: "easeOut" as const } },
  none: {},
};

type IconWrapperProps = {
  children: ReactNode;
  className?: string;
  accent?: "cyan" | "coral" | "amber" | "violet";
  size?: "sm" | "md" | "lg";
  rounded?: "full" | "xl";
};

const accentBg: Record<string, string> = {
  cyan: "from-accent/25 to-accent/10 text-accent border-accent/30",
  coral: "from-accent-warm/25 to-accent-warm/10 text-accent-warm border-accent-warm/30",
  amber: "from-accent-amber/25 to-accent-amber/10 text-accent-amber border-accent-amber/30",
  violet: "from-accent-violet/25 to-accent-violet/10 text-accent-violet border-accent-violet/30",
};

const wrapperSize: Record<string, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
};

export function AnimatedIcon({
  icon: Icon,
  size = "md",
  animation = "subtle",
  className = "",
  strokeWidth = 1.75,
  "aria-hidden": ariaHidden = true,
}: AnimatedIconProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion || animation === "none") {
    return (
      <Icon
        className={`${ICON_SIZES[size]} ${className}`}
        strokeWidth={strokeWidth}
        aria-hidden={ariaHidden}
      />
    );
  }

  return (
    <motion.span
      className="inline-flex"
      whileHover={hoverVariants[animation]}
    >
      <Icon
        className={`${ICON_SIZES[size]} ${className}`}
        strokeWidth={strokeWidth}
        aria-hidden={ariaHidden}
      />
    </motion.span>
  );
}

export function IconWrapper({
  children,
  className = "",
  accent = "cyan",
  size = "md",
  rounded = "xl",
}: IconWrapperProps) {
  const reducedMotion = useReducedMotion();
  const roundClass = rounded === "full" ? "rounded-full" : "rounded-xl";

  return (
    <motion.span
      className={`inline-flex shrink-0 items-center justify-center border bg-gradient-to-br ${accentBg[accent]} ${wrapperSize[size]} ${roundClass} ${className}`}
      {...(reducedMotion
        ? {}
        : {
            whileHover: { scale: 1.04 },
            transition: { type: "spring" as const, stiffness: 400, damping: 20 },
          })}
    >
      {children}
    </motion.span>
  );
}

type FabPulseProps = {
  children: ReactNode;
  className?: string;
  color?: "accent" | "warm" | "violet";
  style?: CSSProperties;
};

const pulseColors = {
  accent: "border-accent/25",
  warm: "border-accent-warm/25",
  violet: "border-accent-violet/25",
};

export function FabPulse({
  children,
  className = "",
  color = "accent",
  style,
}: FabPulseProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={`relative ${className}`} style={style}>
      {!reducedMotion && (
        <span
          className={`fab-pulse-ring pointer-events-none absolute -inset-0.5 rounded-full border ${pulseColors[color]}`}
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}
