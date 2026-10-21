import {
  BEACON_BAND,
  BEACON_BASE,
  BEACON_BEAM,
  BEACON_BEAM_CORE,
  BEACON_GALLERY,
  BEACON_LANTERN,
  BEACON_LIGHT,
  BEACON_MONO,
  BEACON_ROOF,
  BEACON_TOWER,
} from "@/components/brand/beaconPaths";

type BeaconMarkProps = {
  /** Pixel size of the SVG (square). */
  size?: number;
  className?: string;
  /** @deprecated Glow is not part of the mark. Kept so older call sites still compile. */
  staticGlow?: boolean;
  /**
   * color — ink follows currentColor, lamp and beam use the accent.
   * mono — one ink, lamp and daymark punched out. For print and one-color lockups.
   */
  variant?: "color" | "mono";
};

type LighthouseMarkProps = {
  /** Tower ink. Defaults to currentColor so the mark follows light and dark UI. */
  ink?: string;
  /** Lamp, daymark, and beam. */
  accent?: string;
  variant?: "color" | "mono";
};

/**
 * Shapes only, so favicon, OG, and email callers can pass explicit colors.
 */
export function LighthouseMark({
  ink = "currentColor",
  accent = "var(--accent)",
  variant = "color",
}: LighthouseMarkProps) {
  if (variant === "mono") {
    return <path fillRule="evenodd" clipRule="evenodd" d={BEACON_MONO} fill={ink} />;
  }

  return (
    <g>
      <path d={BEACON_BEAM} fill={accent} opacity={0.45} />
      <path d={BEACON_BEAM_CORE} fill={accent} />
      <path d={BEACON_ROOF} fill={ink} />
      <path d={BEACON_TOWER} fill={ink} />
      <path d={BEACON_BASE} fill={ink} />
      <path d={BEACON_GALLERY} fill={ink} />
      <path d={BEACON_LANTERN} fill={ink} />
      <path d={BEACON_BAND} fill={accent} />
      <circle cx={BEACON_LIGHT.cx} cy={BEACON_LIGHT.cy} r={BEACON_LIGHT.r} fill={accent} />
    </g>
  );
}

/**
 * Lighthouse mark for The Beacon Studio.
 * A tower, a lamp, and one beam. Solid shapes so it stays clear at 16px.
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
      <LighthouseMark variant={variant} />
    </svg>
  );
}
