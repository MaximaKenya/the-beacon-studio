import Link from "next/link";
import { siteConfig } from "@/data/site";

/** "Works with our apps" strip. Live apps link out; the rest go to their product page. */
export function WorksWithApps({ className = "" }: { className?: string }) {
  return (
    <section className={`sleek-card rounded-3xl p-5 ${className}`} aria-labelledby="works-with-apps">
      <h2 id="works-with-apps" className="font-display text-base font-semibold text-heading">
        Works with our apps
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {siteConfig.products.map((product) => (
          <li key={product.id}>
            {product.liveUrl ? (
              <a href={product.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-surface-elevated/80 px-3 py-1.5 text-sm text-foreground shadow-sm hover:text-accent">
                {product.name}
              </a>
            ) : (
              <Link href={`/products/${product.id}`} className="inline-flex rounded-full bg-surface-elevated/60 px-3 py-1.5 text-sm text-muted shadow-sm hover:text-accent">
                {product.name} · {product.statusLabel}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
