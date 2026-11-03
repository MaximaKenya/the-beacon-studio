"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ProductShot } from "@/data/product-shots";

/** Modal viewer: captions, prev/next, ←/→ and swipe, Esc closes, focus trapped, focus restored. */
export function Lightbox({
  shots,
  index,
  onClose,
  onIndex,
  name,
}: {
  shots: ProductShot[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
  name: string;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      restore.current?.focus();
    };
  }, [open]);

  if (index === null) return null;
  const shot = shots[index];
  const step = (d: number) => onIndex((index + d + shots.length) % shots.length);

  return (
    <div
      ref={dialog}
      className="pg-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} screenshot ${index + 1} of ${shots.length}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onPointerDown={(e) => { if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY }; }}
      onPointerUp={(e) => {
        const s0 = swipe.current;
        swipe.current = null;
        if (!s0) return;
        const dx = e.clientX - s0.x;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s0.y)) step(dx < 0 ? 1 : -1);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        else if (e.key === "ArrowRight") step(1);
        else if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "Tab") {
          const f = Array.from(dialog.current?.querySelectorAll<HTMLElement>("button") ?? []);
          if (f.length === 0) return;
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }}
    >
      <figure className={`pg-lightbox-figure ${shot.device === "mobile" ? "is-mobile" : ""}`}>
        <Image
          key={shot.file}
          src={shot.file}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          sizes="(min-width: 1024px) 1100px, 96vw"
          placeholder="blur"
          blurDataURL={shot.blurDataURL}
          className="pg-lightbox-img"
        />
        <figcaption className="pg-lightbox-caption">
          <span className="text-heading font-semibold">{shot.caption}</span>
          <span className="text-muted"> · {index + 1}/{shots.length}</span>
        </figcaption>
      </figure>
      <button type="button" className="pg-lb-btn pg-lb-close" onClick={onClose} aria-label="Close" data-autofocus>
        <X className="h-5 w-5" aria-hidden />
      </button>
      {shots.length > 1 ? (
        <>
          <button type="button" className="pg-lb-btn pg-lb-prev" onClick={() => step(-1)} aria-label="Previous screenshot">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" className="pg-lb-btn pg-lb-next" onClick={() => step(1)} aria-label="Next screenshot">
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      ) : null}
    </div>
  );
}

/** Wrap a state update in a View Transition where supported (shared-element feel). */
export function withViewTransition(fn: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (d.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) d.startViewTransition(fn);
  else fn();
}
