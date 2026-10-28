import type { NextConfig } from "next";
import { assetBase } from "./src/lib/asset-base";

/** Static assets (/_next/static, /_next/image) from the CDN host when NEXT_PUBLIC_ASSET_BASE is set at build time. */
const ASSET_BASE = assetBase();

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()" },
];

/** Not for client-site embeds: /a/<slug>/… pages and the widget/embed scripts. CSP itself is set per request in src/proxy.ts (nonce). */
const FRAME_HEADERS = [{ key: "X-Frame-Options", value: "DENY" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(ASSET_BASE ? { assetPrefix: ASSET_BASE } : {}),
  // `pg` talks to Postgres from the Node server. Leave it unbundled.
  serverExternalPackages: ["pg"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    ...(ASSET_BASE ? { path: `${ASSET_BASE}/_next/image` } : {}),
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/((?!a/|api/automations/embed/|api/automations/widget/).*)", headers: FRAME_HEADERS },
      {
        source: "/(admin|portal|dashboard|bookings)(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Only the screenshots: /work/<slug> case-study pages are HTML and must not be cached for a year.
        source: "/work/:file(.+\\.(?:jpg|jpeg|png|webp|avif))",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Product screenshots (/products/<slug>/<file>.webp). Not the /products/<slug> pages.
        source: "/products/:slug/:file(.+\\.(?:jpg|jpeg|png|webp|avif))",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
