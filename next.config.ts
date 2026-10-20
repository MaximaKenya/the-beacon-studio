import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `pg` talks to Postgres from the Node server. Leave it unbundled.
  serverExternalPackages: ["pg"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
