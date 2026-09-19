"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { parseResponseJson } from "@/lib/safe-json";

/**
 * Marketing teaser — aggregate portal activity without PII.
 * Hides when the footer is in view so it doesn't invent empty scroll space / overlap.
 */
export function PortalProgressTeaser() {
  const [active, setActive] = useState<number | null>(null);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/analytics/public");
        const data = await parseResponseJson<{
          portalProjectsActive?: number;
          visitorsThisWeek?: number;
        }>(res, {});
        if (typeof data.portalProjectsActive === "number") {
          setActive(data.portalProjectsActive);
        } else if (typeof data.visitorsThisWeek === "number") {
          setActive(Math.max(1, Math.min(12, Math.round(data.visitorsThisWeek / 8))));
        }
      } catch {
        setActive(3);
      }
    })();
  }, []);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  if (active == null || footerInView) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[120] hidden -translate-x-1/2 sm:block">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-4 py-2 text-xs text-muted shadow-sm backdrop-blur-md">
        <Activity className="h-3.5 w-3.5 text-accent" />
        <span>
          Clients tracking builds in portal
          {active > 0 ? ` · ~${active} active` : ""}
        </span>
        <Link href="/portal/login" className="font-medium text-accent hover:underline">
          Portal
        </Link>
      </div>
    </div>
  );
}
