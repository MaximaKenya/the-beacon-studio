"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductShot } from "@/data/product-shots";
import { DeviceFrame } from "./DeviceFrame";

/**
 * Scroll-snap carousel: native swipe/drag on touch, pointer drag on desktop, arrows,
 * dots, ←/→ keys. Autoplay pauses on hover/focus/hidden tab, off for reduced motion.
 */
export function ShotCarousel({
  shots,
  name,
  compact = false,
  autoplayMs = 4500,
  onOpen,
}: {
  shots: ProductShot[];
  name: string;
  compact?: boolean;
  autoplayMs?: number;
  onOpen?: (index: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const go = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const n = (i + shots.length) % shots.length;
      const slide = el.children[n] as HTMLElement | undefined;
      if (slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: "smooth" });
    },
    [shots.length]
  );

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setIndex(Number((e.target as HTMLElement).dataset.idx));
      },
      { root: el, threshold: 0.6 }
    );
    Array.from(el.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [shots.length]);

  useEffect(() => {
    if (paused || shots.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") go(index + 1);
    }, autoplayMs);
    return () => window.clearInterval(t);
  }, [paused, index, go, autoplayMs, shots.length]);

  if (shots.length === 0) return null;

  return (
    <div
      className={`pg-carousel ${compact ? "pg-carousel-compact" : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${name} screenshots`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
      }}
    >
      <div
        ref={track}
        className="pg-track"
        tabIndex={0}
        aria-live={paused ? "polite" : "off"}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !track.current) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4) { d.moved = true; track.current.dataset.dragging = "true"; }
          track.current.scrollLeft = d.left - dx;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (!d || !track.current) return;
          delete track.current.dataset.dragging;
          if (d.moved) {
            const dx = e.clientX - d.x;
            go(index + (dx < -40 ? 1 : dx > 40 ? -1 : 0));
          }
        }}
        onPointerLeave={() => {
          if (drag.current && track.current) { delete track.current.dataset.dragging; drag.current = null; go(index); }
        }}
      >
        {shots.map((s, i) => (
          <div
            key={s.file}
            data-idx={i}
            className="pg-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${shots.length}: ${s.caption}`}
          >
            {onOpen ? (
              <button type="button" className="pg-slide-btn" onClick={() => onOpen(i)} aria-label={`Open ${s.caption} full size`}>
                <DeviceFrame shot={s} sizes={compact ? "(min-width: 768px) 520px, 92vw" : "(min-width: 1024px) 760px, 92vw"} className={s.device === "mobile" ? "pg-slide-phone" : ""} />
              </button>
            ) : (
              <DeviceFrame shot={s} sizes={compact ? "(min-width: 768px) 520px, 92vw" : "(min-width: 1024px) 760px, 92vw"} className={s.device === "mobile" ? "pg-slide-phone" : ""} />
            )}
            {!compact ? <p className="pg-caption">{s.caption}</p> : null}
          </div>
        ))}
      </div>
      {shots.length > 1 ? (
        <div className="pg-controls">
          <button type="button" className="pg-arrow" onClick={() => go(index - 1)} aria-label="Previous screenshot">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <div className="pg-dots">
            {shots.map((s, i) => (
              <button
                key={s.file}
                type="button"
                className="pg-dot"
                aria-current={i === index ? "true" : undefined}
                aria-label={`Show screenshot ${i + 1}: ${s.caption}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <button type="button" className="pg-arrow" onClick={() => go(index + 1)} aria-label="Next screenshot">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
