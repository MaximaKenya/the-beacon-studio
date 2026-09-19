"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { safeJsonParse } from "@/lib/safe-json";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useFeatures } from "@/providers/FeatureProvider";

export const VIBE_EMOJIS = ["😍", "🔥", "✨", "👍", "🤔", "😐", "😕"] as const;

const STORAGE_KEY = "beacon_vibe_session";
const VIBE_EVENT = "beacon:vibe";

type VibeRecord = { emoji: string; ts: number };

function readVibe(): VibeRecord | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return safeJsonParse<VibeRecord | null>(raw, null);
  } catch {
    return null;
  }
}

function writeVibe(emoji: string) {
  try {
    const record = { emoji, ts: Date.now() } satisfies VibeRecord;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new CustomEvent(VIBE_EVENT, { detail: record }));
  } catch {
    /* ignore */
  }
}

async function persistVibe(emoji: string) {
  trackEvent("emoji_reaction", { emoji });
  try {
    let visitorId = "anonymous";
    try {
      visitorId = localStorage.getItem("beacon_vid") ?? "anonymous";
    } catch {
      /* ignore */
    }
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "reaction",
        name: "emoji_reaction",
        emoji,
        props: { emoji },
        ts: Date.now(),
        visitorId,
        path: typeof window !== "undefined" ? window.location.pathname : "/",
      }),
    });
  } catch {
    /* ignore */
  }
}

type Placement = "dock" | "inline";

export function ReactionWidget({
  placement = "dock",
  className = "",
}: {
  placement?: Placement;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const { chatOpen } = useFeatures();
  const [emoji, setEmoji] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const existing = readVibe();
    if (existing?.emoji) {
      setEmoji(existing.emoji);
      setThanks(true);
    }
    setHydrated(true);

    const onVibe = (e: Event) => {
      const detail = (e as CustomEvent<VibeRecord>).detail;
      if (detail?.emoji) {
        setEmoji(detail.emoji);
        setThanks(true);
      }
    };
    window.addEventListener(VIBE_EVENT, onVibe);
    return () => window.removeEventListener(VIBE_EVENT, onVibe);
  }, []);

  useEffect(() => {
    if (placement !== "dock") return;
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(
      ([entry]) => setFooterInView(entry.isIntersecting),
      { threshold: 0.12 }
    );
    io.observe(footer);
    return () => io.disconnect();
  }, [placement]);

  async function react(next: string) {
    writeVibe(next);
    setEmoji(next);
    setThanks(true);
    setOpen(false);
    await persistVibe(next);
  }

  if (!hydrated) return null;

  const picker = (
    <div
      className={`flex flex-wrap gap-1 rounded-2xl border border-border bg-surface/98 p-2 shadow-xl backdrop-blur-md ${
        placement === "inline" ? "justify-center" : ""
      }`}
      role="group"
      aria-label="Pick a vibe"
    >
      {VIBE_EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => void react(e)}
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-transform hover:scale-110 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            emoji === e ? "bg-accent/15 ring-1 ring-accent/40" : ""
          }`}
          aria-label={`React ${e}`}
          aria-pressed={emoji === e}
        >
          {e}
        </button>
      ))}
    </div>
  );

  if (placement === "inline") {
    return (
      <div
        className={`rounded-2xl border border-border bg-surface/60 px-5 py-5 sm:px-6 ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Vibe check
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-foreground">
              {thanks ? "Thanks — how’s the vibe now?" : "How’s this visit feeling?"}
            </p>
            <p className="mt-1 text-sm text-muted">
              One vibe per visit — you can change it anytime.
            </p>
          </div>
          {thanks && emoji && (
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-sm text-accent">
              <span className="text-lg" aria-hidden>
                {emoji}
              </span>
              Locked in
            </span>
          )}
        </div>
        <div className="mt-4">{picker}</div>
      </div>
    );
  }

  if (chatOpen || footerInView) return null;

  return (
    <div
      className={`fixed bottom-24 right-4 z-[135] sm:bottom-28 sm:right-6 lg:right-24 ${className}`}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            {...(reducedMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 8, scale: 0.96 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  exit: { opacity: 0, y: 8, scale: 0.96 },
                })}
            className="mb-2"
          >
            {picker}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent px-4 py-2.5 text-sm font-semibold text-background shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02] hover:bg-accent-hover"
        aria-expanded={open}
        aria-label="Vibe check"
      >
        {thanks && emoji ? (
          <>
            <span className="text-base" aria-hidden>
              {emoji}
            </span>
            Change vibe
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" aria-hidden />
            Vibe check
          </>
        )}
      </button>
    </div>
  );
}
