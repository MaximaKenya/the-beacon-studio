import { ImageResponse } from "next/og";
import { LighthouseMark } from "@/components/brand/BeaconMark";

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
          background: "#140e24",
          borderRadius: 8,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <LighthouseMark ink="#f6f3ff" accent="#45baab" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
