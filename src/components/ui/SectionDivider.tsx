type SectionDividerProps = {
  variant?: "hairline" | "fade" | "rule";
  className?: string;
};

/**
 * Soft section separators — gentle fades and rounded rule accents.
 */
export function SectionDivider({
  variant = "hairline",
  className = "",
}: SectionDividerProps) {
  if (variant === "fade") {
    return (
      <div
        className={`relative mx-auto h-14 w-full max-w-6xl px-6 lg:px-8 ${className}`}
        aria-hidden
      >
        <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border/60 to-transparent lg:inset-x-8" />
      </div>
    );
  }

  if (variant === "rule") {
    return (
      <div
        className={`relative mx-auto flex max-w-6xl items-center gap-4 px-6 py-8 lg:px-8 ${className}`}
        aria-hidden
      >
        <div className="h-px flex-1 rounded-full bg-gradient-to-r from-transparent via-border/70 to-border/40" />
        <div className="h-1.5 w-1.5 rounded-full bg-accent/45" />
        <div className="h-px flex-1 rounded-full bg-gradient-to-l from-transparent via-border/70 to-border/40" />
      </div>
    );
  }

  return (
    <div
      className={`relative mx-auto max-w-6xl px-6 py-2 lg:px-8 ${className}`}
      aria-hidden
    >
      <div className="h-px w-full rounded-full bg-border/50" />
    </div>
  );
}
