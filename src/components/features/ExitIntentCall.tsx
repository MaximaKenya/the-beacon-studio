"use client";

import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import { useFeatures } from "@/providers/FeatureProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";

const KEY = "beacon-exit-call-dismissed";

/**
 * Soft exit-intent / idle prompt: Book a 15-min call after browsing products.
 */
export function ExitIntentCall() {
  const { openBooking } = useFeatures();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;

    let armed = false;
    const arm = window.setTimeout(() => {
      armed = true;
    }, 14000);

    const onLeave = (e: MouseEvent) => {
      if (!armed || e.clientY > 12) return;
      if (sessionStorage.getItem(KEY)) return;
      setOpen(true);
      sessionStorage.setItem(KEY, "1");
      trackEvent("exit_intent_call_shown");
    };

    document.addEventListener("mouseout", onLeave);
    return () => {
      window.clearTimeout(arm);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-[160] mx-auto max-w-md rounded-2xl border border-border bg-background/95 p-5 shadow-xl backdrop-blur-md sm:inset-x-auto sm:right-6 sm:left-auto ${
        reduced ? "" : "animate-in fade-in slide-in-from-bottom-4"
      }`}
      role="dialog"
      aria-label="Book a quick call"
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-muted hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
        Quick question?
      </p>
      <p className="mt-1 font-display text-lg font-semibold text-foreground">
        Book a 15-min call
      </p>
      <p className="mt-1 text-sm text-muted">
        Exploring the suite? A short call clarifies fit — no pitch deck required.
      </p>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          openBooking();
          trackEvent("exit_intent_call_click");
        }}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
      >
        <Phone className="h-4 w-4" />
        Book 15 minutes
      </button>
    </div>
  );
}
