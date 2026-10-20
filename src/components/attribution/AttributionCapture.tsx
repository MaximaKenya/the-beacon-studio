"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttribution } from "@/lib/attribution-client";

function Capture() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    captureAttribution(pathname || "/", search.toString());
  }, [pathname, search]);

  return null;
}

/** Remembers UTM parameters and the external referrer for later lead forms. */
export function AttributionCapture() {
  return (
    <Suspense fallback={null}>
      <Capture />
    </Suspense>
  );
}
