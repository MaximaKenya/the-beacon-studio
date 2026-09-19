"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/** Soft rectangular frames — radii aligned with soft UI. */
export type FrameShape = "rect" | "soft-rect";

const RADIUS: Record<FrameShape, string> = {
  rect: "1rem",
  "soft-rect": "1.25rem",
};

type FramedImageProps = {
  src: string;
  alt: string;
  shape?: FrameShape;
  className?: string;
  sizes?: string;
  priority?: boolean;
  glow?: boolean;
};

/**
 * Soft rectangular image frame (no oval / water-drop clips).
 */
export function FramedImage({
  src,
  alt,
  shape = "soft-rect",
  className = "relative aspect-square w-64 sm:w-72",
  sizes = "(max-width: 640px) 256px, 288px",
  priority = false,
  glow = true,
}: FramedImageProps) {
  const radius = RADIUS[shape];

  return (
    <div className={`relative ${className}`}>
      {glow && (
        <div
          className="absolute -inset-3 opacity-40 blur-2xl"
          style={{
            borderRadius: radius,
            background:
              "radial-gradient(ellipse at 40% 30%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 70%)",
          }}
          aria-hidden
        />
      )}
      <div
        className="frame-ring relative h-full w-full overflow-hidden bg-surface ring-1 ring-accent/20"
        style={{ borderRadius: radius }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />
      </div>
    </div>
  );
}

export function FrameClip({
  shape = "soft-rect",
  className = "",
  children,
}: {
  shape?: FrameShape;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`overflow-hidden ${className}`} style={{ borderRadius: RADIUS[shape] }}>
      {children}
    </div>
  );
}
