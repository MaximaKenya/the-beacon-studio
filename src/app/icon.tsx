import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const TILE =
  "M11 4H21A7 7 0 0 1 28 11V21A7 7 0 0 1 21 28H11A7 7 0 0 1 4 21V11A7 7 0 0 1 11 4Z";
const STEM = "M10.1 8.1h3.7v15.8H10.1V8.1Z";
const LOWER =
  "M13.8 15.45h3.15c3.55 0 5.95 2 5.95 4.75 0 2.95-2.5 5.05-6.35 5.05H13.8V15.45Z";
const COUNTER =
  "M16.55 18.2c1.7 0 2.75.95 2.75 2.25s-1.05 2.25-2.75 2.25H13.8v-4.5h2.75Z";

/** Favicon — Beacon Dot mark on dark tile. */
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
          background: "#0f172a",
          borderRadius: 10,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <path d={TILE} fill="#e2e8f0" />
          <path d={STEM} fill="#2dd4bf" />
          <path d={LOWER} fill="#2dd4bf" />
          <path d={COUNTER} fill="#e2e8f0" />
          <circle cx="17.35" cy="11.95" r="4.45" fill="#2dd4bf" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
