import { useId } from "react";
import type { ArtisticPathMark } from "@/components/brand/artisticPaths";

type ArtisticMarkProps = {
  mark: ArtisticPathMark;
  /** Pixel size of the square SVG. */
  size?: number;
  /** Gradient uses the brand pair. Flat is one currentColor fill, for favicons. */
  tone?: "gradient" | "flat";
  className?: string;
};

/** One artistic study. The same outlines serve the color mark and the flat favicon. */
export function ArtisticMark({ mark, size = 256, tone = "gradient", className }: ArtisticMarkProps) {
  const gid = `mark${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const fill = tone === "flat" ? "currentColor" : `url(#${gid})`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      shapeRendering="geometricPrecision"
    >
      {tone === "gradient" ? (
        <defs>
          <linearGradient
            id={gid}
            x1={mark.gradient.x1}
            y1={mark.gradient.y1}
            x2={mark.gradient.x2}
            y2={mark.gradient.y2}
          >
            <stop offset="0%" stopColor="var(--mark-grad-from, #d4c4f7)" />
            <stop offset="100%" stopColor="var(--mark-grad-to, #45baab)" />
          </linearGradient>
        </defs>
      ) : null}
      {mark.paths.map((d, index) => (
        <path key={index} d={d} fill={fill} fillRule="evenodd" />
      ))}
    </svg>
  );
}
