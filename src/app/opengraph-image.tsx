import { ImageResponse } from "next/og";
import {
  BEACON_BASE,
  BEACON_BEAM_LEFT,
  BEACON_BEAM_RIGHT,
  BEACON_LANTERN,
  BEACON_LIGHT,
  BEACON_TOWER,
} from "@/components/brand/beaconPaths";

export const alt = "The Beacon Studio — products, software, and IT from Nairobi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#1e2330",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 220,
            height: 220,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 48,
            background: "#262c3a",
            marginRight: 56,
          }}
        >
          <svg width="150" height="150" viewBox="0 0 32 32" fill="none">
            <path d={BEACON_BEAM_LEFT} fill="#45baab" />
            <path d={BEACON_BEAM_RIGHT} fill="#45baab" />
            <path d={BEACON_TOWER} fill="#e6e8ee" />
            <path d={BEACON_BASE} fill="#e6e8ee" />
            <path d={BEACON_LANTERN} fill="#e6e8ee" />
            <circle cx={BEACON_LIGHT.cx} cy={BEACON_LIGHT.cy} r={BEACON_LIGHT.r} fill="#45baab" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 28,
              letterSpacing: 6,
              color: "#45baab",
              fontWeight: 600,
            }}
          >
            STUDIO
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 72,
              lineHeight: 1.05,
              color: "#e6e8ee",
              fontWeight: 700,
            }}
          >
            The Beacon
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 28,
              color: "#a7adbd",
              maxWidth: 640,
            }}
          >
            Products, custom software, and IT from Nairobi.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
