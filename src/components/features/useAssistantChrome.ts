"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  ASSISTANT_FAB_INTRO_MS,
  ASSISTANT_FAB_SEEN_KEY,
  placeAssistantPanel,
  resolveAssistantFab,
  type AssistantFabMode,
  type Box,
  type FabSide,
} from "@/components/features/assistant-fab";

export type AssistantFabLayout = {
  mode: AssistantFabMode;
  x: number;
  y: number;
  side: FabSide;
  width: number;
  height: number;
  rightInset: number;
};

export const ASSISTANT_PANEL_FALLBACK: CSSProperties = {
  right: 16,
  left: "auto",
  top: "auto",
  bottom: "calc(7.5rem + env(safe-area-inset-bottom, 0px))",
  width: "min(24rem, calc(100vw - 2rem))",
  maxHeight: "min(32rem, calc(100dvh - 12rem))",
};

function readIntroduced(): boolean {
  try {
    return localStorage.getItem(ASSISTANT_FAB_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroduced() {
  try {
    localStorage.setItem(ASSISTANT_FAB_SEEN_KEY, "1");
  } catch {
    /* private mode */
  }
}

function boxFromElement(element: Element): Box | null {
  if (!(element instanceof HTMLElement)) return null;
  const style = getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;
  return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
}

export function readCtaBoxes(fixedOnly: boolean): Box[] {
  if (typeof document === "undefined") return [];
  const selector = fixedOnly ? "[data-cta-fixed]" : "[data-cta]";
  const boxes: Box[] = [];
  for (const element of document.querySelectorAll(selector)) {
    if (element.closest("[data-assistant-fab], [data-assistant-panel]")) continue;
    const box = boxFromElement(element);
    if (box) boxes.push(box);
  }
  return boxes;
}

function sameFab(prev: AssistantFabLayout | null, next: AssistantFabLayout) {
  return (
    prev !== null &&
    prev.mode === next.mode &&
    prev.x === next.x &&
    prev.y === next.y &&
    prev.side === next.side &&
    prev.width === next.width &&
    prev.height === next.height
  );
}

export function useAssistantFabLayout(active: boolean): AssistantFabLayout | null {
  const reducedMotion = useReducedMotion();
  const [layout, setLayout] = useState<AssistantFabLayout | null>(null);
  const introTimer = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;

    const measure = () => {
      const viewport = { w: window.innerWidth, h: window.innerHeight };
      const next = resolveAssistantFab({
        viewport,
        obstacles: readCtaBoxes(false),
        introduced: readIntroduced(),
        reducedMotion,
      });
      if (!next.clear) {
        setLayout((prev) => (prev === null ? prev : null));
        return;
      }
      const resolved: AssistantFabLayout = {
        mode: next.mode,
        x: next.x,
        y: next.y,
        side: next.side,
        width: next.width,
        height: next.height,
        rightInset: Math.max(0, viewport.w - next.x - next.width),
      };
      setLayout((prev) => (sameFab(prev, resolved) ? prev : resolved));

      if (next.mode === "expanded" && !introTimer.current) {
        introTimer.current = window.setTimeout(() => {
          introTimer.current = 0;
          markIntroduced();
          measure();
        }, ASSISTANT_FAB_INTRO_MS);
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden"],
    });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(introTimer.current);
      introTimer.current = 0;
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      observer.disconnect();
    };
  }, [active, reducedMotion]);

  return active ? layout : null;
}

export function useAssistantPanelLayout(open: boolean): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>(ASSISTANT_PANEL_FALLBACK);

  useEffect(() => {
    if (!open) return;

    let frame = 0;

    const measure = () => {
      const viewport = { w: window.innerWidth, h: window.innerHeight };
      const panel = placeAssistantPanel({
        viewport,
        obstacles: readCtaBoxes(true),
      });
      const next: CSSProperties = {
        left: panel.left,
        right: "auto",
        top: "auto",
        bottom: panel.bottom,
        width: panel.width,
        maxHeight: panel.maxHeight,
      };
      setStyle((prev) => {
        if (
          prev.left === next.left &&
          prev.bottom === next.bottom &&
          prev.width === next.width &&
          prev.maxHeight === next.maxHeight
        ) {
          return prev;
        }
        return next;
      });
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden"],
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      observer.disconnect();
    };
  }, [open]);

  return style;
}
