"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type ShapeType =
  | "circle"
  | "star"
  | "diamond"
  | "squiggle"
  | "hexagon"
  | "ring"
  | "plus"
  | "arc"
  | "blob"
  | "sparkle";

export type FloatingShape = {
  type: ShapeType;
  top: string;
  left: string;
  size: number;
  color: string;
  delay?: number;
  duration?: number;
  layer?: number;
};

const defaultShapes: FloatingShape[] = [
  { type: "ring", top: "14%", left: "86%", size: 36, color: "var(--accent-warm)", delay: 0.4, duration: 9, layer: 1 },
  { type: "arc", top: "52%", left: "90%", size: 42, color: "var(--accent-amber)", delay: 0.2, duration: 10, layer: 0 },
];

function shapeGlow(color: string) {
  return `drop-shadow(0 0 10px color-mix(in srgb, ${color} 60%, transparent)) drop-shadow(0 0 20px color-mix(in srgb, ${color} 30%, transparent))`;
}

function ShapeSvg({ type, size, color }: { type: ShapeType; size: number; color: string }) {
  const filter = shapeGlow(color);
  const fillOpacity = 0.45;

  switch (type) {
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ filter }}>
          <circle cx="12" cy="12" r="10" fill={color} fillOpacity={fillOpacity} />
        </svg>
      );
    case "star":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ filter }}>
          <path
            d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z"
            fill={color}
            fillOpacity={0.8}
          />
        </svg>
      );
    case "diamond":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ filter }}>
          <path d="M12 2l10 10-10 10L2 12 12 2z" fill={color} fillOpacity={0.7} />
        </svg>
      );
    case "hexagon":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ filter }}>
          <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill={color} fillOpacity={0.65} />
        </svg>
      );
    case "squiggle":
      return (
        <svg width={size} height={size / 2} viewBox="0 0 48 24" aria-hidden style={{ filter }}>
          <path
            d="M2 12c8-8 16 8 22 0s14 8 22 0"
            stroke={color}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
          />
        </svg>
      );
    case "ring":
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden style={{ filter }}>
          <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="3" strokeOpacity={0.9} />
          <circle cx="32" cy="32" r="12" fill={color} fillOpacity={0.35} />
        </svg>
      );
    case "plus":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden style={{ filter }}>
          <path d="M16 4v24M4 16h24" stroke={color} strokeWidth="4" strokeLinecap="round" strokeOpacity={0.9} />
        </svg>
      );
    case "arc":
      return (
        <svg width={size} height={size / 2} viewBox="0 0 80 40" aria-hidden style={{ filter }}>
          <path
            d="M4 36 C20 4, 60 4, 76 36"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeOpacity={0.85}
          />
        </svg>
      );
    case "blob":
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden style={{ filter }}>
          <path
            d="M24 4 C36 4 44 14 42 26 C40 38 28 44 18 40 C8 36 4 24 10 14 C14 8 18 4 24 4 Z"
            fill={color}
            fillOpacity={0.7}
          />
        </svg>
      );
    case "sparkle":
      return (
        <span className="block font-bold leading-none" style={{ fontSize: size, color, filter, opacity: 0.95 }} aria-hidden>
          ✦
        </span>
      );
  }
}

type FloatingShapesProps = {
  shapes?: FloatingShape[];
  className?: string;
  dense?: boolean;
};

export function FloatingShapes({ shapes = defaultShapes, className = "", dense = false }: FloatingShapesProps) {
  const reducedMotion = useReducedMotion();
  const visibleShapes = dense ? shapes : shapes.slice(0, Math.max(1, Math.ceil(shapes.length * 0.35)));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {visibleShapes.map((shape, i) => (
        <div
          key={i}
          className="absolute hidden sm:block"
          style={{
            top: shape.top,
            left: shape.left,
            zIndex: 1 + (shape.layer ?? i % 3),
            animationDelay: `${shape.delay ?? 0}s`,
            animationDuration: `${shape.duration ?? 6}s`,
          }}
        >
          {reducedMotion ? (
            <ShapeSvg type={shape.type} size={shape.size} color={shape.color} />
          ) : (
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: shape.type === "plus" ? [0, 45, 0] : [0, 8, 0],
                opacity: [0.2, 0.32, 0.2],
                scale: [1, 1.04, 1],
              }}
              transition={{
                duration: shape.duration ?? 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: shape.delay ?? 0,
              }}
            >
              <ShapeSvg type={shape.type} size={shape.size} color={shape.color} />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
