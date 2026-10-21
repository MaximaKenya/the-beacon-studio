"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { siteConfig } from "@/data/site";
import { whatsappHref, whatsappPrefill } from "@/lib/contact-actions";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "beacon-audit-offer";

export function ExitOffer() {
  const pathname = usePathname();
  const { openBooking, bookingOpen, intakeOpen } = useFeatures();
  const [open, setOpen] = useState(false);

  const hidden =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal");

  useEffect(() => {
    if (hidden) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    if (!desktop) return;

    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 5000);

    const show = (reason: "exit" | "scroll") => {
      if (!armed || sessionStorage.getItem(STORAGE_KEY)) return;
      sessionStorage.setItem(STORAGE_KEY, "1");
      setOpen(true);
      trackEvent("cta_click", { type: "audit_offer", source: reason });
      cleanup();
    };

    const onOut = (event: MouseEvent) => {
      if (event.clientY <= 4 && event.relatedTarget == null) show("exit");
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const depth = (window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1);
      if (depth >= 0.7) show("scroll");
    };

    document.addEventListener("mouseout", onOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    function cleanup() {
      window.clearTimeout(armTimer);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("scroll", onScroll);
    }

    return cleanup;
  }, [hidden]);

  if (hidden || !open || bookingOpen || intakeOpen) return null;

  return (
    <div className="fixed inset-0 z-[180] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#070412]/50"
        aria-label="Dismiss offer"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-offer-title"
        className="sleek-card relative w-full max-w-md rounded-3xl p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated/80 text-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium text-accent">Free 20-minute audit</p>
        <h2 id="audit-offer-title" className="mt-2 font-display text-2xl font-semibold text-heading">
          Before you go
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {siteConfig.automation.supporting} The call is free. We agree success criteria before you
          pay a deposit.
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            trackEvent("cta_click", { type: "book", source: "exit_offer" });
            openBooking("automation-audit");
          }}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-background"
        >
          {siteConfig.cta.primary}
        </button>
        <a
          href={whatsappHref(whatsappPrefill)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-surface-elevated/80 text-sm font-semibold text-foreground"
        >
          WhatsApp {siteConfig.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
