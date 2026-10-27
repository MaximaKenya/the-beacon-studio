"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import type { ProductShot } from "@/data/product-shots";
import { ShotCarousel } from "./ShotCarousel";
import { Lightbox, withViewTransition } from "./Lightbox";
import { Reveal } from "./Reveal";

/** Carousel section placed after "How it works". Slides open the lightbox. */
export function GalleryCarousel({ shots, name }: { shots: ProductShot[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (shots.length === 0) return null;
  return (
    <section aria-labelledby="screens-heading" className="pg-section">
      <div className="pg-aurora" aria-hidden />
      <h2 id="screens-heading" className="text-heading font-display text-2xl font-semibold tracking-tight">
        Inside {name}
      </h2>
      <p className="mt-2 text-sm text-muted">Real screens. Swipe, use the arrows, or tap to enlarge.</p>
      <div className="mt-6">
        <ShotCarousel shots={shots} name={name} onOpen={(i) => withViewTransition(() => setOpen(i))} />
      </div>
      <Lightbox shots={shots} index={open} onIndex={setOpen} onClose={() => withViewTransition(() => setOpen(null))} name={name} />
    </section>
  );
}

/** Bento grid of every screen with captions, near the FAQ/CTA. Tiles open the lightbox. */
export function BentoGallery({ shots, name }: { shots: ProductShot[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (shots.length === 0) return null;
  return (
    <section aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="text-heading font-display text-2xl font-semibold tracking-tight">
        Every screen
      </h2>
      <Reveal className="pg-bento mt-6">
        {shots.map((s, i) => (
          <figure
            key={s.file}
            data-reveal-item
            className={`pg-tile ${s.device === "mobile" ? "pg-tile-tall" : i % 5 === 0 ? "pg-tile-wide" : ""}`}
          >
            <button
              type="button"
              className="pg-tile-btn"
              onClick={() => withViewTransition(() => setOpen(i))}
              aria-label={`Open ${s.caption} full size`}
            >
              <Image
                src={s.file}
                alt={s.alt}
                width={s.width}
                height={s.height}
                sizes={s.device === "mobile" ? "(min-width: 768px) 220px, 45vw" : "(min-width: 768px) 460px, 92vw"}
                loading="lazy"
                placeholder="blur"
                blurDataURL={s.blurDataURL}
                className="pg-tile-img"
              />
              <span className="pg-tile-zoom" aria-hidden>
                <Maximize2 className="h-4 w-4" />
              </span>
            </button>
            <figcaption className="pg-tile-caption">{s.caption}</figcaption>
          </figure>
        ))}
      </Reveal>
      <Lightbox shots={shots} index={open} onIndex={setOpen} onClose={() => withViewTransition(() => setOpen(null))} name={name} />
    </section>
  );
}

/** Infinite screen strip (duplicated list, CSS marquee, pauses on hover). Decorative. */
export function ScreenMarquee({ shots }: { shots: ProductShot[] }) {
  if (shots.length < 3) return null;
  const row = [...shots, ...shots];
  return (
    <div className="pg-marquee" aria-hidden>
      <div className="pg-marquee-row">
        {row.map((s, i) => (
          <Image
            key={`${s.file}-${i}`}
            src={s.file}
            alt=""
            width={s.width}
            height={s.height}
            sizes="220px"
            loading="lazy"
            className={`pg-marquee-img ${s.device === "mobile" ? "is-mobile" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
