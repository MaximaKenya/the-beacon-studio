import { ImageResponse } from "next/og";
import {
  BEACON_BASE,
  BEACON_BEAM_LEFT,
  BEACON_BEAM_RIGHT,
  BEACON_LANTERN,
  BEACON_LIGHT,
  BEACON_TOWER,
} from "@/components/brand/beaconPaths";

export const ogSize = { width: 1200, height: 630 };

export function renderOgCard(title: string, subtitle: string) {
  const heading = title.length > 42 ? 52 : title.length > 24 ? 64 : 72;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#140e24",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 200,
            height: 200,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 48,
            background: "#2a1848",
            marginRight: 56,
          }}
        >
          <svg width="140" height="140" viewBox="0 0 32 32" fill="none">
            <path d={BEACON_BEAM_LEFT} fill="#45baab" />
            <path d={BEACON_BEAM_RIGHT} fill="#45baab" />
            <path d={BEACON_TOWER} fill="#f6f3ff" />
            <path d={BEACON_BASE} fill="#f6f3ff" />
            <path d={BEACON_LANTERN} fill="#f6f3ff" />
            <circle cx={BEACON_LIGHT.cx} cy={BEACON_LIGHT.cy} r={BEACON_LIGHT.r} fill="#45baab" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
          <div style={{ fontSize: 24, letterSpacing: 6, color: "#45baab", fontWeight: 600 }}>
            THE BEACON STUDIO
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: heading,
              lineHeight: 1.05,
              color: "#f6f3ff",
              fontWeight: 700,
            }}
          >
            {title}
          </div>
          <div style={{ marginTop: 20, fontSize: 28, lineHeight: 1.35, color: "#b9b4d0" }}>{subtitle}</div>
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
