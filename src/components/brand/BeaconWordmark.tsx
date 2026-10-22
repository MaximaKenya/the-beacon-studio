import { siteConfig } from "@/data/site";
import { BeaconMark } from "@/components/brand/BeaconMark";
import { wordmarkLines } from "@/components/brand/wordmark";

type BeaconWordmarkProps = {
  size?: "sm" | "md" | "lg";
  /** Show mark only (no text). */
  showWordmark?: boolean;
  /**
   * compact — tighter header lockup.
   * full — footer and brand lockup.
   * Both keep “The Beacon” / “Studio” at every width.
   */
  variant?: "compact" | "full";
  className?: string;
};

const sizeMap = {
  sm: {
    mark: 26,
    title: "text-[12.5px] min-[380px]:text-[13px] sm:text-sm",
    studio: "text-[8px] sm:text-[9px]",
    gap: "gap-2",
  },
  md: {
    mark: 34,
    title: "text-base",
    studio: "text-[10px]",
    gap: "gap-2.5",
  },
  lg: {
    mark: 42,
    title: "text-xl sm:text-2xl",
    studio: "text-[11px] sm:text-xs",
    gap: "gap-3",
  },
} as const;

/**
 * Lighthouse mark plus the full name. The lockup stays “The Beacon” / “Studio”
 * at every width — headers never swap in the short name.
 */
export function BeaconWordmark({
  size = "md",
  showWordmark = true,
  variant = "compact",
  className = "",
}: BeaconWordmarkProps) {
  const s = sizeMap[size];
  const lines = wordmarkLines(siteConfig.brand.name);
  const studioTracking = variant === "full" ? "tracking-[0.2em]" : "tracking-[0.16em] sm:tracking-[0.2em]";

  return (
    <span
      data-wordmark={siteConfig.brand.name}
      data-lockup={variant}
      className={`inline-flex min-w-max items-center whitespace-nowrap ${s.gap} text-heading ${className}`}
    >
      <span className="relative flex shrink-0 items-center justify-center" aria-hidden>
        <BeaconMark size={s.mark} />
      </span>

      {showWordmark ? (
        <span className="flex shrink-0 flex-col leading-none">
          <span className={`font-display font-bold tracking-[-0.03em] ${s.title}`}>{lines.title}</span>
          {lines.studio ? (
            <span
              className={`mt-1 font-display font-semibold uppercase text-accent ${studioTracking} ${s.studio}`}
            >
              {lines.studio}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
