import { ImageResponse } from "next/og";
import { LighthouseMark } from "@/components/brand/BeaconMark";

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
            <LighthouseMark ink="#f6f3ff" accent="#45baab" />
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
