"use client";

import { Calendar } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { trackEvent } from "@/lib/analytics";

export function BookingSection() {
  const { openBooking } = useFeatures();

  if (!siteConfig.booking.enabled) return null;

  return (
    <section id="book" className="border-t border-border bg-surface/20 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="Schedule"
            title="Book a Call"
            description="Book a 30-minute call to scope your build or product. Slots in East Africa Time (EAT)."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface/50 p-8 text-center backdrop-blur-sm sm:p-12">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
              <Calendar className="h-6 w-6 text-accent" aria-hidden />
            </div>

            <p className="text-sm text-muted">
              Available {siteConfig.booking.availableDays.length} days a week ·{" "}
              {siteConfig.booking.hoursStart}–{siteConfig.booking.hoursEnd}{" "}
              <span className="text-muted">({siteConfig.booking.timezone})</span>
            </p>

            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {siteConfig.booking.meetingTypes.map((type) => (
                <li
                  key={type.id}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
                >
                  {type.label} · {type.duration} min
                </li>
              ))}
            </ul>

            <MagneticButton
              onClick={() => {
                openBooking();
                trackEvent("booking_cta_click", { source: "section" });
              }}
              className="mt-8 inline-flex h-14 min-w-[200px] cursor-pointer items-center justify-center rounded-xl bg-accent px-8 text-sm font-semibold text-background shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover"
            >
              Choose a time
            </MagneticButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
