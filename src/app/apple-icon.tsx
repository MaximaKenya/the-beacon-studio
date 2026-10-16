import { ImageResponse } from "next/og";
import {
  BEACON_BASE,
  BEACON_BEAM_LEFT,
  BEACON_BEAM_RIGHT,
  BEACON_LANTERN,
  BEACON_LIGHT,
  BEACON_TOWER,
} from "@/components/brand/beaconPaths";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — same lighthouse mark, larger tile. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1220",
          borderRadius: 40,
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32" fill="none">
          <path d={BEACON_BEAM_LEFT} fill="#2dd4bf" />
          <path d={BEACON_BEAM_RIGHT} fill="#2dd4bf" />
          <path d={BEACON_TOWER} fill="#eef2ff" />
          <path d={BEACON_BASE} fill="#eef2ff" />
          <path d={BEACON_LANTERN} fill="#eef2ff" />
          <circle cx={BEACON_LIGHT.cx} cy={BEACON_LIGHT.cy} r={BEACON_LIGHT.r} fill="#2dd4bf" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
