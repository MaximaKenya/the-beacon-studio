"use client";

import Link from "next/link";
import { BeaconMark } from "@/components/brand/BeaconMark";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1b1030",
          color: "#f4efe8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ maxWidth: 420, padding: 32, textAlign: "center" }}>
          <BeaconMark size={72} />
          <h1 style={{ fontSize: 32, marginTop: 24 }}>The studio hit a snag</h1>
          <p style={{ opacity: 0.8 }}>Try again, or go back home.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                background: "#7c5cbf",
                color: "#fff",
                border: 0,
                borderRadius: 16,
                padding: "12px 18px",
                fontWeight: 600,
              }}
            >
              Try again
            </button>
            <Link href="/" style={{ color: "#9ee6d6", padding: "12px 8px" }}>
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
