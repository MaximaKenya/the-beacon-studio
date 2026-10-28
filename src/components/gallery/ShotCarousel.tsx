"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductShot } from "@/data/product-shots";
import { DeviceFrame } from "./DeviceFrame";

/**
 * Scroll-snap carousel: native swipe/drag on touch, pointer drag on desktop, arrows,
 * dots (or a thumbnail strip for large sets), ←/→ keys. Autoplay pauses on hover/focus/hidden tab, off for reduced motion.
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
  const root = useRef<HTMLDivElement>(null);
  /** Load the next slide early once the carousel is close to the viewport. */
  const [near, setNear] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const useThumbs = !compact && shots.length > 8;
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const go = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const n = (i + shots.length) % shots.length;
      const slide = el.children[n] as HTMLElement | undefined;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (slide) el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: reduce ? "auto" : "smooth" });
    },
    [shots.length]
  );

  useEffect(() => {
    const el = root.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true);
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

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

  // Keep the active thumbnail in view without scrolling the page vertically.
  useEffect(() => {
    const el = strip.current;
    const thumb = el?.children[index] as HTMLElement | undefined;
    if (!el || !thumb) return;
    const left = thumb.offsetLeft - el.offsetLeft - (el.clientWidth - thumb.clientWidth) / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [index]);

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
      ref={root}
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
                <DeviceFrame shot={s} sizes={compact ? "(min-width: 768px) 520px, calc(100vw - 5rem)" : "(min-width: 1024px) 760px, 92vw"} eager={i === 0 || (near && (i === index + 1 || i === index))} first={i === 0} className={s.device === "mobile" ? "pg-slide-phone" : ""} />
              </button>
            ) : (
              <DeviceFrame shot={s} sizes={compact ? "(min-width: 768px) 520px, calc(100vw - 5rem)" : "(min-width: 1024px) 760px, 92vw"} eager={i === 0 || (near && (i === index + 1 || i === index))} first={i === 0} className={s.device === "mobile" ? "pg-slide-phone" : ""} />
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
          {useThumbs ? (
            <span className="pg-count" aria-live="polite">
              {index + 1} / {shots.length}
            </span>
          ) : (
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
          )}
          <button type="button" className="pg-arrow" onClick={() => go(index + 1)} aria-label="Next screenshot">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
      {useThumbs ? (
        <div ref={strip} className="pg-thumbs" aria-label={`${name} screenshot thumbnails`}>
          {shots.map((s, i) => (
            <button
              key={s.file}
              type="button"
              className={`pg-thumb ${s.device === "mobile" ? "is-mobile" : ""}`}
              aria-current={i === index ? "true" : undefined}
              aria-label={`Show screenshot ${i + 1}: ${s.caption}`}
              onClick={() => go(i)}
            >
              <Image src={s.file} alt="" width={s.width} height={s.height} sizes="96px" loading="lazy" className="pg-thumb-img" draggable={false} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
