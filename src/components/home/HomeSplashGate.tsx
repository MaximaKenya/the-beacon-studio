"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { isHomeSplashPath } from "@/components/home/splash";

const HomeSplash = dynamic(
  () => import("@/components/home/HomeSplash").then((mod) => mod.HomeSplash),
  { ssr: false },
);

/** Loads the intro after hydration, and only on the homepage. */
export function HomeSplashGate() {
  const pathname = usePathname();
  if (!isHomeSplashPath(pathname)) return null;
  return <HomeSplash />;
}
