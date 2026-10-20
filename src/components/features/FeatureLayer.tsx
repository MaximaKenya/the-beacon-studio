"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useFeatures } from "@/providers/FeatureProvider";
import type { ReactNode } from "react";

const DeferredOverlays = dynamic(
  () => import("@/components/features/DeferredOverlays").then((mod) => mod.DeferredOverlays),
  { ssr: false }
);

export function FeatureLayer({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { openBooking } = useFeatures();
  const [overlays, setOverlays] = useState(false);

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#book") openBooking();
    };
    window.addEventListener("hashchange", openFromHash);
    const handle = window.setTimeout(() => {
      setOverlays(true);
      openFromHash();
    }, 1200);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.clearTimeout(handle);
    };
  }, [openBooking]);

  const hideMarketing =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal");

  return (
    <>
      {children}
      {overlays ? <DeferredOverlays hideMarketing={Boolean(hideMarketing)} /> : null}
    </>
  );
}
