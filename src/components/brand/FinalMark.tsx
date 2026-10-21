import { useId } from "react";
import { FINAL_GLOW, FINAL_PATHS, FINAL_VIEW } from "@/components/brand/finalTrace";

/**
 * Intro: the tower rises, the lantern bloom opens, the rays scale out, the wave lifts in.
 * Loop: a quiet glow breath, a small ray twinkle, a slow wave shimmer.
 * Reduced motion keeps the finished still mark.
 */
export const FINAL_MOTION = `
@media (prefers-reduced-motion: no-preference) {
  .final-rise { animation: final-rise 1.15s cubic-bezier(.22,.7,.2,1) both; }
  .final-glow { animation: final-bloom .95s ease-out .5s both, final-pulse 3.6s ease-in-out 1.55s infinite; }
  .final-burst { transform-box: fill-box; transform-origin: center; animation: final-ray-in .9s cubic-bezier(.16,.84,.28,1) .38s both, final-twinkle 3.4s ease-in-out 1.4s infinite; }
  .final-wave { animation: final-wave-in 1.2s ease-out .08s both, final-shimmer 5.4s ease-in-out 1.15s infinite; }
}
@keyframes final-rise { from { opacity: 0; transform: translateY(8%); } to { opacity: 1; transform: none; } }
@keyframes final-bloom { from { opacity: 0; } to { opacity: 1; } }
@keyframes final-ray-in { from { opacity: 0; transform: scale(.22); } to { opacity: 1; transform: none; } }
@keyframes final-wave-in { from { opacity: 0; transform: translateY(10%); } to { opacity: 1; transform: none; } }
@keyframes final-pulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
@keyframes final-twinkle { 0%, 100% { opacity: .75; } 50% { opacity: 1; } }
@keyframes final-shimmer { 0%, 100% { opacity: .8; } 50% { opacity: 1; } }
`;

type MarkProps = {
  size?: number;
  animated?: boolean;
  className?: string;
};

/** Tower paths stay the approved trace. Wave and starburst outlines are the smoothed fills. */
export function FinalMark({ size = 280, animated = false, className }: MarkProps) {
  const filterId = `glow${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const height = Math.round((size * FINAL_VIEW.h) / FINAL_VIEW.w);
  const body = FINAL_PATHS.filter((path) => path.role === "body");
  const wave = FINAL_PATHS.filter((path) => path.role === "wave");
  const burst = FINAL_PATHS.filter((path) => path.role === "burst");

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
      <g className={animated ? "final-rise" : undefined}>
        {body.map((path, index) => (
          <path key={`b${index}`} d={path.d} fill={path.fill} transform={path.tr ? `translate(${path.tr})` : undefined} />
        ))}
        <g className={animated ? "final-wave" : undefined}>
          {wave.map((path, index) => (
            <path key={`w${index}`} d={path.d} fill={path.fill} fillRule="evenodd" />
          ))}
        </g>
        <g filter={`url(#${filterId})`} className={animated ? "final-glow" : undefined}>
          {burst.map((path, index) => (
            <path key={`g${index}`} d={path.d} fill={FINAL_GLOW} fillRule="evenodd" />
          ))}
        </g>
        <g className={animated ? "final-burst" : undefined}>
          {burst.map((path, index) => (
            <path key={`r${index}`} d={path.d} fill={path.fill} fillRule="evenodd" />
          ))}
        </g>
      </g>
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
