"use client";

import { useMemo, useState } from "react";
import type { ProductShot } from "@/data/product-shots";
import { ShotCarousel } from "./ShotCarousel";
import { Lightbox, withViewTransition } from "./Lightbox";
import { DeviceToggle, filterByDevice, type DeviceFilter } from "./DeviceToggle";

/** Carousel section placed after "How it works". Slides open the lightbox. */
export function GalleryCarousel({ shots: allShots, name }: { shots: ProductShot[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [device, setDevice] = useState<DeviceFilter>("all");
  const shots = useMemo(() => filterByDevice(allShots, device), [allShots, device]);
  if (allShots.length === 0) return null;
  return (
    <section aria-labelledby="screens-heading" className="pg-section">
      <div className="pg-aurora" aria-hidden />
      <h2 id="screens-heading" className="text-heading font-display text-2xl font-semibold tracking-tight">
        Inside {name}
      </h2>
      <p className="mt-2 text-sm text-muted">Real screens. Swipe, use the arrows, or tap to enlarge.</p>
      <DeviceToggle
        className="mt-5"
        value={device}
        shots={allShots}
        onChange={(d) => { setOpen(null); setDevice(d); }}
      />
      <div className="mt-6">
        <ShotCarousel key={device} shots={shots} name={name} onOpen={(i) => withViewTransition(() => setOpen(i))} />
      </div>
      <Lightbox shots={shots} index={open} onIndex={setOpen} onClose={() => withViewTransition(() => setOpen(null))} name={name} />
    </section>
  );
}
