import { useId } from "react";
import type { ConceptVariant } from "@/components/brand/conceptA";

export const CONCEPT_A_MOTION = `
@media (prefers-reduced-motion: no-preference) {
  .concept-a-glow {
    opacity: 0;
    animation: concept-a-in 1.05s ease forwards, concept-a-pulse 2.6s ease-in-out 1.05s infinite;
  }
  .concept-a-beam {
    clip-path: inset(0 100% 0 0);
    animation: concept-a-draw 1.25s cubic-bezier(.33, 0, .2, 1) 0.2s forwards,
      concept-a-pulse 2.6s ease-in-out 1.45s infinite;
  }
}
@keyframes concept-a-in { to { opacity: 1; } }
@keyframes concept-a-draw { to { clip-path: inset(0 0 0 0); } }
@keyframes concept-a-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.62; }
}
`;

type MarkProps = {
  variant: ConceptVariant;
  size?: number;
  tone?: "gradient" | "flat";
  /** Lantern fades in, the beam draws, then both pulse. Still when reduced motion is set. */
  animated?: boolean;
  className?: string;
};

/** Concept A lighthouse. Gradient matches the chosen violet-to-teal study. */
export function ConceptAMark({
  variant,
  size = 256,
  tone = "gradient",
  animated = false,
  className,
}: MarkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tower = `tower${uid}`;
  const ray = `ray${uid}`;
  const blur = `blur${uid}`;
  const flat = tone === "flat";
  const towerFill = flat ? "currentColor" : `url(#${tower})`;
  const beamFill = flat ? "currentColor" : `url(#${ray})`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      shapeRendering="geometricPrecision"
    >
      {flat ? null : (
        <defs>
          <linearGradient id={tower} x1="50%" y1="6%" x2="46%" y2="94%">
            <stop offset="0%" stopColor="#e2d2ff" />
            <stop offset="42%" stopColor="#8a9cf0" />
            <stop offset="100%" stopColor="#3ed6c6" />
          </linearGradient>
          <linearGradient id={ray} x1="0%" y1="40%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#d4c4ff" />
            <stop offset="100%" stopColor="#3ed6c6" />
          </linearGradient>
          <filter id={blur} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
        </defs>
      )}
      {flat ? null : (
        <g className={animated ? "concept-a-glow" : undefined}>
          <circle
            cx={variant.glow.cx}
            cy={variant.glow.cy}
            r={variant.glow.r}
            fill="#f4eeff"
            opacity={0.85}
            filter={`url(#${blur})`}
          />
          <circle
            cx={variant.glow.cx}
            cy={variant.glow.cy}
            r={variant.glow.r * 0.42}
            fill="#ffffff"
            opacity={0.95}
          />
        </g>
      )}
      <path d={variant.tower} fill={towerFill} fillRule="evenodd" />
      <path d={variant.wave} fill={towerFill} />
      <g className={animated ? "concept-a-beam" : undefined}>
        <path d={variant.beam} fill={beamFill} />
      </g>
    </svg>
  );
}

export function ConceptALockup({
  variant,
  layout,
  markSize = 112,
  wordmarkClassName,
}: {
  variant: ConceptVariant;
  layout: "horizontal" | "stacked";
  markSize?: number;
  wordmarkClassName: string;
}) {
  const type = (
    <div className={wordmarkClassName} style={{ fontVariationSettings: '"opsz" 72, "SOFT" 30, "WONK" 0' }}>
      <div className="font-medium leading-none tracking-[-0.03em]" style={{ fontSize: layout === "horizontal" ? "1.7rem" : "1.85rem" }}>
        The Beacon
      </div>
      <div
        className="mt-1.5 font-medium uppercase leading-none tracking-[0.28em]"
        style={{ fontSize: "0.68rem" }}
      >
        Studio
      </div>
    </div>
  );
  if (layout === "horizontal") {
    return (
      <div className="flex items-center gap-4">
        <ConceptAMark variant={variant} size={markSize} />
        {type}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <ConceptAMark variant={variant} size={markSize} />
      {type}
    </div>
  );
}
