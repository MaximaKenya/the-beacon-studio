"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import type { ProductShot } from "@/data/product-shots";
import { Lightbox, withViewTransition } from "./Lightbox";
import { DeviceToggle, filterByDevice, type DeviceFilter } from "./DeviceToggle";

const BATCH = 12;
/** Auto-load on scroll up to this many tiles; beyond that the visitor asks for more. */
const AUTO_MAX = 24;

type ProductChip = { id: string; name: string };

/**
 * Motion gallery: marquee rows + a bento grid of every screen. Tiles mount in batches as you
 * scroll (never all at once), images lazy-load into fixed boxes (no CLS).
 * Spring hover with pointer tilt, staggered bouncy reveal, lightbox on click. Reduced motion: static.
 */
export function MotionGallery({
  shots: allShots,
  products,
  name,
  title,
  description,
  id = "gallery",
  headingLevel = "h2",
}: {
  shots: ProductShot[];
  products?: ProductChip[];
  name: string;
  title: string;
  description?: string;
  id?: string;
  headingLevel?: "h2" | "h3";
}) {
  const [product, setProduct] = useState<string>("all");
  const [device, setDevice] = useState<DeviceFilter>("all");
  const [limit, setLimit] = useState(BATCH);
  const [open, setOpen] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const byProduct = useMemo(
    () => (product === "all" ? allShots : allShots.filter((s) => s.slug === product)),
    [allShots, product]
  );
  const shots = useMemo(() => filterByDevice(byProduct, device), [byProduct, device]);
  const visible = shots.slice(0, limit);
  const names = useMemo(() => new Map((products ?? []).map((p) => [p.id, p.name])), [products]);

  // Mount the next batch when the sentinel nears the viewport.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || limit >= shots.length || limit >= AUTO_MAX) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setLimit((n) => Math.min(n + BATCH, shots.length));
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [limit, shots.length]);

  // Staggered bouncy reveal for tiles that enter the viewport.
  useEffect(() => {
    const root = grid.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        let n = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const t = e.target as HTMLElement;
          t.style.setProperty("--mg-delay", `${Math.min(n++, 6) * 60}ms`);
          t.dataset.in = "true";
          io.unobserve(t);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );
    root.querySelectorAll<HTMLElement>(".mg-tile:not([data-in='true'])").forEach((t) => {
      if (t.getBoundingClientRect().top > window.innerHeight) {
        t.dataset.in = "false";
        io.observe(t);
      }
    });
    return () => io.disconnect();
  }, [visible.length, product, device]);

  if (allShots.length === 0) return null;
  const Heading = headingLevel;
  const reset = () => { setOpen(null); setLimit(BATCH); };
  const marquee = byProduct.slice(0, 16);

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mg-section pg-section">
      <div className="pg-aurora" aria-hidden />
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <Heading id={`${id}-heading`} className="text-heading font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </Heading>
          {description ? <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p> : null}
        </div>
        <DeviceToggle value={device} shots={byProduct} onChange={(d) => { reset(); setDevice(d); }} />
      </div>

      {products && products.length > 1 ? (
        <div className="mg-chips mt-5" role="radiogroup" aria-label="Filter by product">
          {[{ id: "all", name: "All products" }, ...products].map((p) => {
            const count = p.id === "all" ? allShots.length : allShots.filter((s) => s.slug === p.id).length;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={product === p.id}
                className="mg-chip"
                onClick={() => { reset(); setProduct(p.id); }}
              >
                {p.name}
                <span className="mg-chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {marquee.length >= 6 ? (
        <div className="mg-marquee mt-8" aria-hidden>
          {[0, 1].map((row) => {
            const items = marquee.filter((_, i) => i % 2 === row);
            return (
              <div key={row} className={`mg-marquee-row ${row ? "mg-reverse" : ""}`}>
                {[...items, ...items].map((s, i) => (
                  <Image
                    key={`${s.file}-${i}`}
                    src={s.file}
                    alt=""
                    width={s.width}
                    height={s.height}
                    sizes="240px"
                    loading="lazy"
                    className={`mg-marquee-img ${s.device === "mobile" ? "is-mobile" : ""}`}
                    draggable={false}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        Showing {shots.length} screens
      </p>
      <div ref={grid} className="mg-grid mt-8">
        {visible.map((s, i) => (
          <figure key={s.file} className={`mg-tile ${s.device === "mobile" ? "mg-tall" : "mg-wide"}`}>
            <button
              type="button"
              className="mg-btn"
              aria-label={`Open ${names.get(s.slug) ? `${names.get(s.slug)}: ` : ""}${s.caption}`}
              onClick={() => withViewTransition(() => setOpen(i))}
              onPointerMove={(e) => {
                if (e.pointerType !== "mouse") return;
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
                e.currentTarget.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.setProperty("--mx", "0");
                e.currentTarget.style.setProperty("--my", "0");
              }}
            >
              <span className={s.device === "mobile" ? "mg-frame-phone" : "mg-frame-browser"}>
                {s.device === "desktop" ? (
                  <span className="mg-bar" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}
                <span className="mg-screen">
                  <Image
                    src={s.file}
                    alt={s.alt}
                    width={s.width}
                    height={s.height}
                    sizes={s.device === "mobile" ? "(min-width: 768px) 200px, 45vw" : "(min-width: 1024px) 400px, (min-width: 768px) 46vw, 92vw"}
                    loading="lazy"
                    className="mg-img"
                    draggable={false}
                  />
                </span>
              </span>
              <span className="mg-glare" aria-hidden />
              <span className="mg-zoom" aria-hidden>
                <Maximize2 className="h-4 w-4" />
              </span>
            </button>
            <figcaption className="mg-caption">
              {names.get(s.slug) ? <span className="mg-tag">{names.get(s.slug)}</span> : null}
              <span className="line-clamp-2">{s.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {limit < shots.length ? (
        <div ref={sentinel} className="mt-8 flex justify-center">
          <button type="button" className="pg-more" onClick={() => setLimit((n) => Math.min(n + BATCH * 2, shots.length))}>
            Show more ({shots.length - limit} left)
          </button>
        </div>
      ) : null}
      <Lightbox
        shots={shots}
        index={open}
        onIndex={setOpen}
        onClose={() => withViewTransition(() => setOpen(null))}
        name={name}
      />
    </section>
  );
}
