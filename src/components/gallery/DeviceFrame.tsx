import Image from "next/image";
import type { ProductShot } from "@/data/product-shots";

type Props = {
  shot: ProductShot;
  sizes: string;
  priority?: boolean;
  /** Load now instead of lazily (first slide, or the next one up). */
  eager?: boolean;
  /** First slide of a carousel: ask the browser to fetch it ahead of other images. */
  first?: boolean;
  /** Fixed-aspect viewport; tall shots pan inside it. */
  className?: string;
  label?: string;
};

/** Frosted browser or phone chrome around a screenshot. No outlines, shadow only. */
export function DeviceFrame({ shot, sizes, priority = false, eager = false, first = false, className = "", label }: Props) {
  const img = (
    <Image
      src={shot.file}
      alt={shot.alt}
      width={shot.width}
      height={shot.height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : eager ? "eager" : "lazy"}
      fetchPriority={priority || first ? "high" : undefined}
      decoding="async"
      className="pg-shot block h-full w-full object-cover object-top"
      draggable={false}
    />
  );
  if (shot.device === "mobile") {
    return (
      <div className={`pg-phone ${className}`}>
        <div className="pg-phone-screen aspect-[390/844]">{img}</div>
      </div>
    );
  }
  return (
    <div className={`pg-browser ${className}`}>
      <div className="pg-browser-bar" aria-hidden>
        <span />
        <span />
        <span />
        {label ? <em>{label}</em> : null}
      </div>
      <div className="pg-browser-screen aspect-[16/10]">{img}</div>
    </div>
  );
}
