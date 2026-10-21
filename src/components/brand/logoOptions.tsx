import type { ReactNode } from "react";
import { badge, geometric, monoline, striped } from "@/components/brand/logoOptionPaths";

type LogoOptionProps = {
  /** Pixel size of the square SVG. */
  size?: number;
  className?: string;
};

function MarkSvg({
  size,
  className,
  children,
}: {
  size: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Minimal geometric lighthouse: a few solid shapes and one beam. */
export function LogoGeometric({ size = 32, className }: LogoOptionProps) {
  return (
    <MarkSvg size={size} className={className}>
      <path d={geometric.beam} fill="var(--accent)" />
      <path d={geometric.roof} fill="currentColor" />
      <path d={geometric.lantern} fill="currentColor" />
      <path d={geometric.gallery} fill="currentColor" />
      <path d={geometric.tower} fill="currentColor" />
      <path d={geometric.base} fill="currentColor" />
      <circle cx={geometric.lamp.cx} cy={geometric.lamp.cy} r={geometric.lamp.r} fill="var(--accent)" />
    </MarkSvg>
  );
}

/** Bold tower with two thick daymark stripes and one beam. */
export function LogoStriped({ size = 32, className }: LogoOptionProps) {
  return (
    <MarkSvg size={size} className={className}>
      <path d={striped.beam} fill="var(--accent)" />
      <path d={striped.roof} fill="currentColor" />
      <path d={striped.lantern} fill="currentColor" />
      <path d={striped.gallery} fill="currentColor" />
      <path d={striped.tower} fill="currentColor" />
      <path d={striped.bandA} fill="var(--accent)" />
      <path d={striped.bandB} fill="var(--accent)" />
      <circle cx={striped.lamp.cx} cy={striped.lamp.cy} r={striped.lamp.r} fill="var(--accent)" />
    </MarkSvg>
  );
}

/** Single-weight outline. The beam is one filled wedge, not a second stroke. */
export function LogoMonoline({ size = 32, className }: LogoOptionProps) {
  return (
    <MarkSvg size={size} className={className}>
      <path d={monoline.beam} fill="var(--accent)" />
      <path
        d={monoline.outline}
        stroke="currentColor"
        strokeWidth={monoline.strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={monoline.lamp.cx} cy={monoline.lamp.cy} r={monoline.lamp.r} fill="var(--accent)" />
    </MarkSvg>
  );
}

/** Circular emblem. The beam stays inside the ring. */
export function LogoBadge({ size = 32, className }: LogoOptionProps) {
  return (
    <MarkSvg size={size} className={className}>
      <circle
        cx="16"
        cy="16"
        r={badge.ringR}
        stroke="currentColor"
        strokeWidth={badge.ringWidth}
      />
      <path d={badge.beam} fill="var(--accent)" />
      <path d={badge.roof} fill="currentColor" />
      <path d={badge.lantern} fill="currentColor" />
      <path d={badge.gallery} fill="currentColor" />
      <path d={badge.tower} fill="currentColor" />
      <path d={badge.base} fill="currentColor" />
      <circle cx={badge.lamp.cx} cy={badge.lamp.cy} r={badge.lamp.r} fill="var(--accent)" />
    </MarkSvg>
  );
}

export const LOGO_OPTIONS = [
  {
    id: "geometric",
    name: "Geometric",
    blurb: "Minimal solid lighthouse. Few corners, so the tower still reads at 16px.",
    file: "/logo-options/geometric.svg",
    Mark: LogoGeometric,
  },
  {
    id: "striped",
    name: "Striped",
    blurb: "Heavy tower with two daymark bands and a single thick beam.",
    file: "/logo-options/striped.svg",
    Mark: LogoStriped,
  },
  {
    id: "monoline",
    name: "Monoline",
    blurb: "One outline weight. The beam is a single wedge off the lantern.",
    file: "/logo-options/monoline.svg",
    Mark: LogoMonoline,
  },
  {
    id: "badge",
    name: "Badge",
    blurb: "Circular emblem. The lighthouse and its one beam sit inside the ring.",
    file: "/logo-options/badge.svg",
    Mark: LogoBadge,
  },
] as const;
