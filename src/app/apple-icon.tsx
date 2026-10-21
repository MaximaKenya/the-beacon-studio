import { ImageResponse } from "next/og";
import { LighthouseMark } from "@/components/brand/BeaconMark";

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
          background: "#140e24",
          borderRadius: 40,
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32" fill="none">
          <LighthouseMark ink="#f6f3ff" accent="#45baab" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
