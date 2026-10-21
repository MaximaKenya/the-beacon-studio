import { useId } from "react";
import { FINAL_GLOW, FINAL_PATHS, FINAL_VIEW } from "@/components/brand/finalTrace";

/** Lantern glow and starburst pulse, wave shimmer. Still when reduced motion is preferred. */
export const FINAL_MOTION = `
@media (prefers-reduced-motion: no-preference) {
  .final-glow { animation: final-pulse 2.6s ease-in-out infinite; }
  .final-burst { animation: final-burst 2.6s ease-in-out infinite; }
  .final-wave { animation: final-shimmer 3.8s ease-in-out infinite; }
}
@keyframes final-pulse { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; } }
@keyframes final-burst { 0%, 100% { opacity: 0.45; filter: brightness(0.55); } 50% { opacity: 1; filter: brightness(1); } }
@keyframes final-shimmer { 0%, 100% { opacity: 0.4; filter: brightness(0.7); } 50% { opacity: 1; filter: brightness(1); } }
`;

type MarkProps = {
  size?: number;
  animated?: boolean;
  className?: string;
};

/** Approved vtracer paths. A blurred copy of the lantern shapes supplies the teal glow. */
export function FinalMark({ size = 280, animated = false, className }: MarkProps) {
  const filterId = `glow${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const height = Math.round((size * FINAL_VIEW.h) / FINAL_VIEW.w);

  return (
    <svg
      width={size}
      height={height}
      viewBox={`${FINAL_VIEW.x} ${FINAL_VIEW.y} ${FINAL_VIEW.w} ${FINAL_VIEW.h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      shapeRendering="geometricPrecision"
    >
      <defs>
        <filter
          id={filterId}
          x="-180%"
          y="-180%"
          width="460%"
          height="460%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="28" result="b" />
          <feComponentTransfer in="b">
            <feFuncA type="linear" slope="2" />
          </feComponentTransfer>
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} className={animated ? "final-glow" : undefined}>
        {FINAL_PATHS.map((path, index) =>
          path.burst ? (
            <path key={index} d={path.d} fill={FINAL_GLOW} transform={`translate(${path.tr})`} />
          ) : null,
        )}
      </g>
      {FINAL_PATHS.map((path, index) => (
        <path
          key={index}
          d={path.d}
          fill={path.fill}
          transform={`translate(${path.tr})`}
          className={
            animated ? (path.burst ? "final-burst" : path.wave ? "final-wave" : undefined) : undefined
          }
        />
      ))}
    </svg>
  );
}

export function FinalLockup({
  layout,
  markSize = 112,
  wordmarkClassName,
  animated = false,
}: {
  layout: "horizontal" | "stacked";
  markSize?: number;
  wordmarkClassName: string;
  animated?: boolean;
}) {
  const type = (
    <div className={wordmarkClassName} style={{ fontVariationSettings: '"opsz" 72, "SOFT" 30, "WONK" 0' }}>
      <div
        className="font-medium leading-none tracking-[-0.03em]"
        style={{ fontSize: layout === "horizontal" ? "1.7rem" : "1.85rem" }}
      >
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
        <FinalMark size={markSize} animated={animated} />
        {type}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <FinalMark size={markSize} animated={animated} />
      {type}
    </div>
  );
}
