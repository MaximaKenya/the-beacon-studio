import { siteConfig } from "@/data/site";
import { BeaconMark } from "@/components/brand/BeaconMark";

type BeaconWordmarkProps = {
  size?: "sm" | "md" | "lg";
  /** Show mark only (no text). */
  showWordmark?: boolean;
  /**
   * compact — mark + short name ("Beacon") on very small screens;
   * full name from sm+.
   * full — always "The Beacon Studio" stacked lockup.
   */
  variant?: "compact" | "full";
  className?: string;
};

const sizeMap = {
  sm: {
    mark: 28,
    title: "text-[13px] sm:text-sm",
    studio: "text-[8px] sm:text-[9px]",
    gap: "gap-2.5",
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
 * Beacon Dot mark + Plus Jakarta lockup — “The Beacon” / “Studio”.
 * Accent lives in the mark (signal disc); type stays clean and high-contrast.
 */
export function BeaconWordmark({
  size = "md",
  showWordmark = true,
  variant = "compact",
  className = "",
}: BeaconWordmarkProps) {
  const s = sizeMap[size];
  const shortName = siteConfig.brand.shortName;
  const displayName = siteConfig.brand.name;

  return (
    <span className={`inline-flex items-center ${s.gap} text-foreground ${className}`}>
      <span className="relative flex shrink-0 items-center justify-center" aria-hidden>
        <BeaconMark size={s.mark} />
      </span>

      {showWordmark && (
        <span className="flex min-w-0 flex-col leading-none">
          {variant === "full" ? (
            <>
              <span className={`font-display font-bold tracking-[-0.03em] ${s.title}`}>
                The Beacon
              </span>
              <span
                className={`mt-1 font-display font-semibold uppercase tracking-[0.2em] text-accent ${s.studio}`}
              >
                Studio
              </span>
            </>
          ) : (
            <>
              <span
                className={`font-display font-bold tracking-[-0.03em] sm:hidden ${s.title}`}
              >
                {shortName}
              </span>
              <span className="hidden flex-col sm:flex">
                <span className={`font-display font-bold tracking-[-0.03em] ${s.title}`}>
                  The Beacon
                </span>
                <span
                  className={`mt-1 font-display font-semibold uppercase tracking-[0.2em] text-accent ${s.studio}`}
                >
                  Studio
                </span>
              </span>
              <span className="sr-only">{displayName}</span>
            </>
          )}
        </span>
      )}
    </span>
  );
}
