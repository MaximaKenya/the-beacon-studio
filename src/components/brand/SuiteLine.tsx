import Link from "next/link";
import { siteConfig } from "@/data/site";

type SuiteLineProps = {
  className?: string;
  /** Link product chips to product pages */
  linkProducts?: boolean;
  /** Visual density */
  size?: "sm" | "md";
  align?: "left" | "center";
};

/**
 * Industry-standard SaaS suite line: product name chips + secondary custom-dev label.
 */
export function SuiteLine({
  className = "",
  linkProducts = true,
  size = "md",
  align = "center",
}: SuiteLineProps) {
  const chip =
    size === "sm"
      ? "rounded-xl border border-border/70 bg-surface/60 px-2.5 py-1 font-mono text-[10px] text-foreground"
      : "rounded-2xl border border-border/70 bg-surface/60 px-3 py-1.5 text-xs font-medium text-foreground";

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${
        align === "center" ? "justify-center" : "justify-start"
      } ${className}`}
      role="list"
      aria-label="Product suite and services"
    >
      {siteConfig.products.map((p) => {
        const inner = <span className={chip}>{p.name}</span>;
        return (
          <span key={p.id} role="listitem">
            {linkProducts ? (
              <Link
                href={`/products/${p.id}`}
                className="transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {inner}
              </Link>
            ) : (
              inner
            )}
          </span>
        );
      })}
      <span
        role="listitem"
        className={
          size === "sm"
            ? "rounded-xl border border-dashed border-border/50 px-2.5 py-1 text-[10px] text-muted"
            : "rounded-2xl border border-dashed border-border/50 px-3 py-1.5 text-xs text-muted"
        }
      >
        Custom software development
      </span>
    </div>
  );
}
