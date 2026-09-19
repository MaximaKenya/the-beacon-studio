"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const HINT_KEY = "portfolio-shortcuts-hint-seen";

export function KeyboardShortcuts() {
  const {
    shortcutsOpen,
    setShortcutsOpen,
    openChat,
    openBooking,
    openNewsletter,
    closeChat,
    closeBooking,
    closeNewsletter,
    chatOpen,
    bookingOpen,
    newsletterOpen,
  } = useFeatures();
  const reducedMotion = useReducedMotion();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(HINT_KEY) !== "true") {
      setShowHint(true);
      const timer = setTimeout(() => {
        localStorage.setItem(HINT_KEY, "true");
        setShowHint(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "?" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShortcutsOpen(!shortcutsOpen);
        return;
      }

      if (isInput || e.metaKey || e.ctrlKey) return;

      if (e.key === "Escape") {
        if (shortcutsOpen) setShortcutsOpen(false);
        else if (chatOpen) closeChat();
        else if (bookingOpen) closeBooking();
        else if (newsletterOpen) closeNewsletter();
        return;
      }

      if (shortcutsOpen) return;

      switch (e.key.toLowerCase()) {
        case "c":
          if (siteConfig.assistant.enabled) {
            e.preventDefault();
            openChat();
          }
          break;
        case "b":
          if (siteConfig.booking.enabled) {
            e.preventDefault();
            openBooking();
          }
          break;
        case "n":
          if (siteConfig.newsletter.enabled) {
            e.preventDefault();
            openNewsletter();
          }
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    shortcutsOpen,
    setShortcutsOpen,
    openChat,
    openBooking,
    openNewsletter,
    closeChat,
    closeBooking,
    closeNewsletter,
    chatOpen,
    bookingOpen,
    newsletterOpen,
  ]);

  const shortcuts = [
    { keys: ["⌘", "K"], label: "Command palette", enabled: true },
    { keys: ["?"], label: "Keyboard shortcuts", enabled: true },
    { keys: ["C"], label: "Open AI chat", enabled: siteConfig.assistant.enabled },
    { keys: ["B"], label: "Book a call", enabled: siteConfig.booking.enabled },
    { keys: ["N"], label: "Newsletter", enabled: siteConfig.newsletter.enabled },
    { keys: ["Esc"], label: "Close panel", enabled: true },
  ].filter((s) => s.enabled);

  const showHintVisible = showHint && !shortcutsOpen;

  return (
    <>
      {showHintVisible && (
        <p className="pointer-events-none fixed bottom-6 left-1/2 z-[130] -translate-x-1/2 rounded-full border border-border bg-surface/80 px-3 py-1.5 font-mono text-[10px] text-muted backdrop-blur-sm sm:text-xs">
          Press <kbd className="text-accent">?</kbd> for shortcuts
        </p>
      )}

      <AnimatePresence>
        {shortcutsOpen && (
          <div
            className="fixed inset-0 z-[190] flex items-center justify-center bg-background/60 px-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            onClick={() => setShortcutsOpen(false)}
          >
            <motion.div
              {...(reducedMotion
                ? {}
                : {
                    initial: { opacity: 0, scale: 0.95 },
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 0.95 },
                  })}
              className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-lg font-semibold text-foreground">
                Keyboard shortcuts
              </h2>
              <ul className="mt-4 space-y-2">
                {shortcuts.map((s) => (
                  <li key={s.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{s.label}</span>
                    <span className="flex gap-1">
                      {s.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-foreground"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setShortcutsOpen(false)}
                className="mt-5 w-full rounded-xl border border-border py-2 text-sm text-muted hover:text-foreground"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
