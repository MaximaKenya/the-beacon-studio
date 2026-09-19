import type { Product } from "@/data/site";

/**
 * Public "Open [Product]" destination:
 * liveUrl → githubUrl → on-site product page.
 * Never invents a production URL.
 */
export function getProductOpenHref(product: Product): string {
  if (product.liveUrl) return product.liveUrl;
  if (product.githubUrl) return product.githubUrl;
  return `/products/${product.id}`;
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/** Prefer a new tab for every Open destination (external required; same-origin for consistency). */
export function productOpenLinkAttrs(product: Product) {
  const href = getProductOpenHref(product);
  return {
    href,
    target: "_blank" as const,
    rel: "noopener noreferrer" as const,
    external: isExternalHref(href),
  };
}
