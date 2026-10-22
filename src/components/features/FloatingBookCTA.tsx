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
      data-cta=""
      data-cta-fixed=""
      className={`fixed bottom-6 right-4 z-[125] ${chatOpen ? "pointer-events-none opacity-0" : ""}`}
    >
      <button
        type="button"
        onClick={() => {
          openBooking();
          trackEvent("booking_cta_click", { source: "floating" });
        }}
        className="flex items-center gap-2 rounded-full bg-surface/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm transition-all hover:text-accent"
        aria-label="Book a call"
      >
        <AnimatedIcon icon={Calendar} size="sm" animation="subtle" className="text-accent" />
        Book a Call
      </button>
    </FabPulse>
  );
}
