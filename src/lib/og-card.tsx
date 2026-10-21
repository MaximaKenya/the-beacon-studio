import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

const logoSrc = `data:image/png;base64,${readFileSync(join(process.cwd(), "public/email/beacon-mark.png")).toString("base64")}`;

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
        {/* Satori paints <img>. next/image is not available inside ImageResponse. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={200}
          height={200}
          alt=""
          style={{
            width: 200,
            height: 200,
            borderRadius: 48,
            marginRight: 56,
          }}
        />
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
