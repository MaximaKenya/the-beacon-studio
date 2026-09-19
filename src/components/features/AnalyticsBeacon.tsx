"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

/** Fires page_view (and product_view on product routes) once per navigation. */
export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", { path: pathname });
    if (pathname.startsWith("/products/")) {
      const product = pathname.split("/")[2];
      if (product) trackEvent("product_view", { product, path: pathname });
    }
  }, [pathname]);

  return null;
}
