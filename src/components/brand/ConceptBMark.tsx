import { useId } from "react";
import type { ConceptBVariant } from "@/components/brand/conceptB";

/** Lantern glow pulses. Still when the visitor prefers reduced motion. */
export const CONCEPT_B_MOTION = `
@media (prefers-reduced-motion: no-preference) {
  .concept-b-glow {
    animation: concept-b-pulse 2.8s ease-in-out infinite;
  }
}
@keyframes concept-b-pulse {
  0%, 100% { opacity: 0.62; }
  50% { opacity: 1; }
}
`;

type MarkProps = {
  variant: ConceptBVariant;
  size?: number;
  tone?: "gradient" | "flat";
  animated?: boolean;
  className?: string;
};

/** Traced Concept A lighthouse. The long ray is gone; only a short lantern light remains. */
export function ConceptBMark({
  variant,
  size = 256,
  tone = "gradient",
  animated = false,
  className,
}: MarkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tower = `tower${uid}`;
  const blur = `blur${uid}`;
  const flat = tone === "flat";
  const fill = flat ? "currentColor" : `url(#${tower})`;
  const glowClass = animated && !flat ? "concept-b-glow" : undefined;
  const { glow } = variant;
  const coreR = variant.id === "b4" ? 16 : glow.core;
  const coreOpacity = variant.id === "b4" ? 0.4 : 1;

  return (
    <svg
      width={size}
      height={size * (440 / 360)}
      viewBox="0 0 360 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      shapeRendering="geometricPrecision"
    >
      {flat ? null : (
        <defs>
          <linearGradient id={tower} x1="180" y1="20" x2="170" y2="390" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f6f1ff" />
            <stop offset="22%" stopColor="#e4d4ff" />
            <stop offset="40%" stopColor="#b7b4f6" />
            <stop offset="58%" stopColor="#7f9aee" />
            <stop offset="78%" stopColor="#45cfe2" />
            <stop offset="100%" stopColor="#2ad8c6" />
          </linearGradient>
          <filter id={blur} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation={glow.blur} />
          </filter>
        </defs>
      )}
      {flat ? (
        <circle cx={glow.cx} cy={glow.cy} r={coreR} fill="currentColor" opacity={coreOpacity} />
      ) : (
        <g className={glowClass}>
          <circle cx={glow.cx} cy={glow.cy} r={glow.r} fill="#f4eeff" opacity={0.88} filter={`url(#${blur})`} />
          <circle cx={glow.cx} cy={glow.cy} r={glow.core} fill="#ffffff" />
        </g>
      )}
      <path d={variant.tower} fill={fill} fillRule="evenodd" />
      <path d={variant.wave} fill={fill} />
      {variant.light ? (
        <g className={glowClass}>
          <path d={variant.light} fill={flat ? "currentColor" : "#f7f3ff"} />
        </g>
      ) : null}
    </svg>
  );
}

export function ConceptBLockup({
  variant,
  layout,
  markSize = 112,
  wordmarkClassName,
}: {
  variant: ConceptBVariant;
  layout: "horizontal" | "stacked";
  markSize?: number;
  wordmarkClassName: string;
}) {
  const type = (
    <div className={wordmarkClassName} style={{ fontVariationSettings: '"opsz" 72, "SOFT" 30, "WONK" 0' }}>
      <div className="font-medium leading-none tracking-[-0.03em]" style={{ fontSize: layout === "horizontal" ? "1.7rem" : "1.85rem" }}>
        The Beacon
      </div>
      <div className="mt-1.5 font-medium uppercase leading-none tracking-[0.28em]" style={{ fontSize: "0.68rem" }}>
        Studio
      </div>
    </div>
  );
  if (layout === "horizontal") {
    return (
      <div className="flex items-center gap-4">
        <ConceptBMark variant={variant} size={markSize} />
        {type}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <ConceptBMark variant={variant} size={markSize} />
      {type}
    </div>
  );
}
