"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";
import { AnimatedIcon, FabPulse } from "@/components/ui/AnimatedIcon";

export function FloatingBookCTA() {
  const { openBooking, chatOpen } = useFeatures();
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  if (!siteConfig.booking.enabled || footerInView) return null;

  return (
    <FabPulse
      color="accent"
      className={`fixed bottom-24 left-4 z-[140] sm:bottom-6 ${chatOpen ? "pointer-events-none opacity-0" : ""}`}
    >
      <button
        type="button"
        onClick={() => {
          openBooking();
          trackEvent("booking_cta_click", { source: "floating" });
        }}
        className="flex items-center gap-2 rounded-full border border-border bg-surface/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm transition-all hover:border-accent/40 hover:text-accent"
        aria-label="Book a call"
      >
        <AnimatedIcon icon={Calendar} size="sm" animation="subtle" className="text-accent" />
        Book a Call
      </button>
    </FabPulse>
  );
}
