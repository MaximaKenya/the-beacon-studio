"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import type { ProductShot } from "@/data/product-shots";
import { ShotCarousel } from "./ShotCarousel";
import { Lightbox, withViewTransition } from "./Lightbox";
import { Reveal } from "./Reveal";

/** Carousel section placed after "How it works". Slides open the lightbox. */
type DeviceFilter = "all" | "desktop" | "mobile";
const FILTERS: { id: DeviceFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
];

export function GalleryCarousel({ shots: allShots, name }: { shots: ProductShot[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [device, setDevice] = useState<DeviceFilter>("all");
  const hasBoth = allShots.some((s) => s.device === "desktop") && allShots.some((s) => s.device === "mobile");
  const shots = useMemo(() => (device === "all" ? allShots : allShots.filter((s) => s.device === device)), [allShots, device]);
  if (allShots.length === 0) return null;
  return (
    <section aria-labelledby="screens-heading" className="pg-section">
      <div className="pg-aurora" aria-hidden />
      <h2 id="screens-heading" className="text-heading font-display text-2xl font-semibold tracking-tight">
        Inside {name}
      </h2>
      <p className="mt-2 text-sm text-muted">Real screens. Swipe, use the arrows, or tap to enlarge.</p>
      {hasBoth ? (
        <div className="pg-filter mt-4" role="group" aria-label="Show screens for">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="pg-filter-btn"
              aria-pressed={device === f.id}
              onClick={() => { setOpen(null); setDevice(f.id); }}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-6">
        <ShotCarousel key={device} shots={shots} name={name} onOpen={(i) => withViewTransition(() => setOpen(i))} />
      </div>
      <Lightbox shots={shots} index={open} onIndex={setOpen} onClose={() => withViewTransition(() => setOpen(null))} name={name} />
    </section>
  );
}

/** Bento grid of every screen with captions, near the FAQ/CTA. Tiles open the lightbox. */
const BENTO_INITIAL = 12;

export function BentoGallery({ shots, name }: { shots: ProductShot[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  if (shots.length === 0) return null;
  const visible = expanded ? shots : shots.slice(0, BENTO_INITIAL);
  return (
    <section aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="text-heading font-display text-2xl font-semibold tracking-tight">
        Every screen
      </h2>
      <Reveal className="pg-bento mt-6">
        {visible.map((s, i) => (
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
      {shots.length > visible.length ? (
        <div className="mt-6 flex justify-center">
          <button type="button" className="pg-more" onClick={() => setExpanded(true)}>
            Show all {shots.length} screens
          </button>
        </div>
      ) : null}
      <Lightbox shots={shots} index={open} onIndex={setOpen} onClose={() => withViewTransition(() => setOpen(null))} name={name} />
    </section>
  );
}

/** Infinite screen strip (duplicated list, CSS marquee, pauses on hover). Decorative. */
export function ScreenMarquee({ shots }: { shots: ProductShot[] }) {
  if (shots.length < 3) return null;
  // Cap the decorative strip so large galleries don't add dozens of extra images.
  const picked = shots.slice(0, 12);
  const row = [...picked, ...picked];
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
