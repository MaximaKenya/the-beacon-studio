import { BEACON_MONO_D, BEACON_MONO_VIEW } from "@/components/brand/beaconMono";

type BeaconMarkProps = {
  /** Pixel width of the mark. Height follows the lighthouse proportion. */
  size?: number;
  className?: string;
  /** @deprecated Glow is painted into the color mark. Kept so older call sites still compile. */
  staticGlow?: boolean;
  /**
   * color — the painted lighthouse, as a cached SVG.
   * mono — one currentColor silhouette, for buttons and one-ink UI.
   */
  variant?: "color" | "mono";
};

const view = `${BEACON_MONO_VIEW.x} ${BEACON_MONO_VIEW.y} ${BEACON_MONO_VIEW.w} ${BEACON_MONO_VIEW.h}`;

/**
 * Live lighthouse. The color file is the smoothed mark (transparent spiral channels,
 * so it sits on purple and teal). The header uses that file rather than the animated
 * component, which would ship hundreds of paths and a blur on every page.
 */
export function BeaconMark({
  size = 28,
  className = "",
  staticGlow: _staticGlow = false,
  variant = "color",
}: BeaconMarkProps) {
  void _staticGlow;
  const height = Math.round((size * BEACON_MONO_VIEW.h) / BEACON_MONO_VIEW.w);

  if (variant === "mono") {
    return (
      <svg
        width={size}
        height={height}
        viewBox={view}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`beacon-mark ${className}`}
        aria-hidden
      >
        <path d={BEACON_MONO_D} fill="currentColor" />
      </svg>
    );
  }

  return (
    // The mark has to stay a vector. next/image would rasterize it.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/beacon-mark.svg"
      width={size}
      height={height}
      alt=""
      draggable={false}
      className={`beacon-mark ${className}`}
    />
  );
}
