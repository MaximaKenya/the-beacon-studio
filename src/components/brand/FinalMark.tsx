import { useId } from "react";
import { FINAL_MARK } from "@/components/brand/finalMark";

/** Starburst pulse, ray twinkle, and a quiet wave shimmer. Still when reduced motion is preferred. */
export const FINAL_MOTION = `
@media (prefers-reduced-motion: no-preference) {
  .final-glow { animation: final-pulse 2.6s ease-in-out infinite; }
  .final-ray { animation: final-twinkle 2.2s ease-in-out infinite; }
  .final-wave { animation: final-shimmer 3.8s ease-in-out infinite; }
  .final-core { animation: final-core 2.6s ease-in-out infinite; }
}
@keyframes final-pulse { 0%, 100% { opacity: 0.28; } 50% { opacity: 1; } }
@keyframes final-twinkle { 0%, 100% { opacity: 0.12; } 40% { opacity: 1; } }
@keyframes final-shimmer { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
@keyframes final-core { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
`;

type MarkProps = {
  size?: number;
  tone?: "gradient" | "flat";
  animated?: boolean;
  className?: string;
};

/** Traced starburst lighthouse. Glow and rays sit behind the tower; the window stays bright. */
export function FinalMark({ size = 256, tone = "gradient", animated = false, className }: MarkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tower = `tower${uid}`;
  const burst = `burst${uid}`;
  const glowFilter = `glow${uid}`;
  const rayFilter = `ray${uid}`;
  const flat = tone === "flat";
  const { glow } = FINAL_MARK;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 480 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      shapeRendering="geometricPrecision"
    >
      {flat ? null : (
        <defs>
          <linearGradient id={tower} x1="240" y1="60" x2="230" y2="420" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f6f1ff" />
            <stop offset="18%" stopColor="#e4d4ff" />
            <stop offset="36%" stopColor="#b9b4f8" />
            <stop offset="54%" stopColor="#7f98ee" />
            <stop offset="74%" stopColor="#45d0e4" />
            <stop offset="100%" stopColor="#2ed9c4" />
          </linearGradient>
          <linearGradient id={burst} x1="150" y1="176" x2="340" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7ef6ea" />
            <stop offset="48%" stopColor="#f4fffd" />
            <stop offset="100%" stopColor="#5eecd8" />
          </linearGradient>
          <filter id={glowFilter} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id={rayFilter} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.3" />
          </filter>
        </defs>
      )}
      {flat ? (
        <path d={`${FINAL_MARK.tower} ${FINAL_MARK.window}`} fill="currentColor" fillRule="evenodd" />
      ) : (
        <>
          <g className={animated ? "final-glow" : undefined}>
            <circle
              cx={glow.cx}
              cy={glow.cy}
              r={animated ? 52 : glow.r}
              fill="#9ff7ec"
              opacity={0.95}
              filter={`url(#${glowFilter})`}
            />
          </g>
          <g filter={`url(#${rayFilter})`}>
            {FINAL_MARK.rays.map((d, index) => (
              <path
                key={index}
                d={d}
                fill={`url(#${burst})`}
                className={animated ? "final-ray" : undefined}
                style={animated ? { animationDelay: `${index * 0.28}s` } : undefined}
              />
            ))}
          </g>
        </>
      )}
      {flat ? null : <path d={FINAL_MARK.tower} fill={`url(#${tower})`} fillRule="evenodd" />}
      {flat || !animated ? null : (
        <circle cx={glow.cx} cy={glow.cy} r={30} fill="#d9fff8" className="final-glow" />
      )}
      <path
        d={FINAL_MARK.wave}
        fill={flat ? "currentColor" : `url(#${tower})`}
        className={animated && !flat ? "final-wave" : undefined}
      />
      {flat
        ? FINAL_MARK.rays.map((d, index) => <path key={index} d={d} fill="currentColor" />)
        : null}
      {flat ? null : (
        <path d={FINAL_MARK.window} fill="#f7fffd" className={animated ? "final-core" : undefined} />
      )}
      {flat ? null : (
        <circle
          cx={glow.cx}
          cy={glow.cy}
          r={6}
          fill="#ffffff"
          className={animated ? "final-core" : undefined}
        />
      )}
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
      <div className="mt-1.5 font-medium uppercase leading-none tracking-[0.28em]" style={{ fontSize: "0.68rem" }}>
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
