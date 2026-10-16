import {
  BEACON_BASE,
  BEACON_BEAM_LEFT,
  BEACON_BEAM_RIGHT,
  BEACON_LANTERN,
  BEACON_LIGHT,
  BEACON_MONO,
  BEACON_TOWER,
} from "@/components/brand/beaconPaths";

type BeaconMarkProps = {
  /** Pixel size of the SVG (square). */
  size?: number;
  className?: string;
  /** @deprecated Glow is not part of the mark. Kept so older call sites still compile. */
  staticGlow?: boolean;
  /**
   * color — ink follows currentColor, lamp and beams use the accent.
   * mono — one ink, lamp punched out. For print and one-color lockups.
   */
  variant?: "color" | "mono";
};

/**
 * Lighthouse mark for The Beacon Studio.
 * Solid shapes only, so it stays clear at 16px in light and dark UI.
 */
export function BeaconMark({
  size = 28,
  className = "",
  staticGlow: _staticGlow = false,
  variant = "color",
}: BeaconMarkProps) {
  void _staticGlow;

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
      {variant === "mono" ? (
        <path fillRule="evenodd" clipRule="evenodd" d={BEACON_MONO} fill="currentColor" />
      ) : (
        <>
          <path d={BEACON_BEAM_LEFT} fill="var(--accent)" />
          <path d={BEACON_BEAM_RIGHT} fill="var(--accent)" />
          <path d={BEACON_TOWER} fill="currentColor" />
          <path d={BEACON_BASE} fill="currentColor" />
          <path d={BEACON_LANTERN} fill="currentColor" />
          <circle
            cx={BEACON_LIGHT.cx}
            cy={BEACON_LIGHT.cy}
            r={BEACON_LIGHT.r}
            fill="var(--accent)"
          />
        </>
      )}
    </svg>
  );
}
