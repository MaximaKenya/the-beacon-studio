import { ImageResponse } from "next/og";
import {
  BEACON_BASE,
  BEACON_BEAM_LEFT,
  BEACON_BEAM_RIGHT,
  BEACON_LANTERN,
  BEACON_LIGHT,
  BEACON_TOWER,
} from "@/components/brand/beaconPaths";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon — lighthouse mark on a dark tile, so it stays visible on light and dark browser chrome. */
export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
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
