"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FINAL_MOTION, FinalMark } from "@/components/brand/FinalMark";
import { wordmarkLines } from "@/components/brand/wordmark";
import { siteConfig } from "@/data/site";
import {
  SPLASH_SKIP_MS,
  splashAlreadySeen,
  splashDecision,
  markSplashSeen,
} from "@/components/home/splash";

const WORDMARK_MOTION = `
@media (prefers-reduced-motion: no-preference) {
  .splash-wordmark { animation: splash-wordmark-in .7s ease .55s both; }
}
@keyframes splash-wordmark-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
`;

type Phase = "off" | "play" | "exit";

type SplashView = {
  phase: Phase;
  exitMs: number;
  reduced: boolean;
};

function readDecision() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    reducedMotion,
    decision: splashDecision({
      pathname: window.location.pathname,
      seen: splashAlreadySeen(),
      reducedMotion,
    }),
  };
}

/**
 * Homepage intro. The page underneath is already rendered; this overlay is
 * mounted only after hydration and never ships in the server HTML.
 */
export function HomeSplash() {
  const [view, setView] = useState<SplashView>({ phase: "off", exitMs: 0, reduced: false });
  const timersRef = useRef<number[]>([]);
  const phaseRef = useRef<Phase>("off");
  const reducedRef = useRef(false);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const skip = useCallback(() => {
    if (phaseRef.current === "off") return;
    clearTimers();
    markSplashSeen();
    const instant = reducedRef.current || phaseRef.current === "exit";
    if (instant) {
      phaseRef.current = "off";
      setView((current) => ({ ...current, phase: "off" }));
      return;
    }
    phaseRef.current = "exit";
    setView((current) => ({ ...current, phase: "exit", exitMs: SPLASH_SKIP_MS }));
    const id = window.setTimeout(() => {
      phaseRef.current = "off";
      setView((current) => ({ ...current, phase: "off" }));
    }, SPLASH_SKIP_MS);
    timersRef.current = [id];
  }, [clearTimers]);

  useEffect(() => {
    const { reducedMotion, decision } = readDecision();
    if (!decision.show) return;
    reducedRef.current = reducedMotion;

    const startTimer = window.setTimeout(() => {
      phaseRef.current = "play";
      markSplashSeen();
      setView({ phase: "play", exitMs: decision.exitMs, reduced: reducedMotion });
      if (decision.exitMs > 0) {
        const exitTimer = window.setTimeout(() => {
          phaseRef.current = "exit";
          setView((current) => ({ ...current, phase: "exit", exitMs: decision.exitMs }));
        }, decision.holdMs);
        timersRef.current.push(exitTimer);
      }
      const doneTimer = window.setTimeout(() => {
        phaseRef.current = "off";
        setView((current) => ({ ...current, phase: "off" }));
      }, decision.holdMs + decision.exitMs);
      timersRef.current.push(doneTimer);
    }, 0);
    timersRef.current = [startTimer];
    return () => clearTimers();
  }, [clearTimers]);

  const visible = view.phase !== "off";

  useEffect(() => {
    if (!visible) return;
    const splash = document.querySelector("[data-home-splash]");
    const locked: HTMLElement[] = [];
    for (const child of Array.from(document.body.children)) {
      if (!(child instanceof HTMLElement)) continue;
      if (splash && child === splash) continue;
      child.setAttribute("inert", "");
      locked.push(child);
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      skip();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      for (const child of locked) child.removeAttribute("inert");
      document.body.style.overflow = previousOverflow;
    };
  }, [skip, visible]);

  if (!visible || typeof document === "undefined") return null;

  const lines = wordmarkLines(siteConfig.brand.name);
  const leaving = view.phase === "exit";

  return createPortal(
    <div
      data-home-splash=""
      className={`fixed inset-0 z-[400] overflow-hidden bg-background transition-opacity ease-out ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: leaving ? `${view.exitMs}ms` : "0ms" }}
    >
      <style>{`${FINAL_MOTION}${WORDMARK_MOTION}`}</style>
      <div
        className="flex h-full flex-col items-center justify-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]"
        aria-hidden
      >
        <FinalMark
          size={300}
          animated={!view.reduced}
          className="h-auto w-[min(68vw,300px)]"
        />
        <div className="splash-wordmark mt-5 text-center text-heading">
          <div className="font-display text-[1.65rem] font-semibold leading-none tracking-[-0.03em] sm:text-4xl">
            {lines.title}
          </div>
          {lines.studio ? (
            <div className="mt-2 font-display text-xs font-semibold uppercase leading-none tracking-[0.28em] text-accent sm:text-sm">
              {lines.studio}
            </div>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        className="absolute inset-0 cursor-pointer border-0 bg-transparent p-0"
        aria-label={`Skip ${siteConfig.brand.name} intro`}
        onClick={skip}
      />
    </div>,
    document.body,
  );
}
