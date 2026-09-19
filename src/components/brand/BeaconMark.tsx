import {
  BEACON_DOT_COUNTER,
  BEACON_DOT_DISC_CX,
  BEACON_DOT_DISC_CY,
  BEACON_DOT_DISC_R,
  BEACON_DOT_LOWER,
  BEACON_DOT_MONO,
  BEACON_DOT_STEM,
  ROUNDED_TILE,
} from "@/components/brand/markConcepts";

type BeaconMarkProps = {
  /** Pixel size of the SVG (square). */
  size?: number;
  className?: string;
  /**
   * @deprecated Glow removed from the mark. Kept for call-site compatibility.
   */
  staticGlow?: boolean;
  /**
   * mono — single currentColor with punched Beacon Dot (print / one-ink).
   * Default uses currentColor tile + accent B / signal disc.
   */
  variant?: "color" | "mono";
};

/**
 * Beacon Dot — The Beacon Studio brand mark.
 * Rounded app tile + custom geometric B with solid signal disc.
 * Bold at 24px; currentColor + --accent for light/dark. No glow.
 */
export function BeaconMark({
  size = 28,
  className = "",
  staticGlow: _staticGlow = false,
  variant = "color",
}: BeaconMarkProps) {
  void _staticGlow;
  const mono = variant === "mono";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`beacon-mark ${className}`}
      aria-hidden
    >
      {mono ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={BEACON_DOT_MONO}
          fill="currentColor"
        />
      ) : (
        <>
          <path d={ROUNDED_TILE} fill="currentColor" />
          <path d={BEACON_DOT_STEM} fill="var(--accent)" />
          <path d={BEACON_DOT_LOWER} fill="var(--accent)" />
          <path d={BEACON_DOT_COUNTER} fill="currentColor" />
          <circle
            cx={BEACON_DOT_DISC_CX}
            cy={BEACON_DOT_DISC_CY}
            r={BEACON_DOT_DISC_R}
            fill="var(--accent)"
          />
        </>
      )}
    </svg>
  );
}
