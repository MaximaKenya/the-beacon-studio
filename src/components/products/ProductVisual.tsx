import Image from "next/image";
import type { Product } from "@/data/site";

function initials(name: string) {
  const parts = name.replace(/([a-z])([A-Z])/g, "$1 $2").split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ProductVisual({
  product,
  frameClassName = "aspect-[16/10]",
}: {
  product: Product;
  frameClassName?: string;
}) {
  if (product.image) {
    return (
      <div className={`relative overflow-hidden bg-surface ${frameClassName}`}>
        <Image
          src={product.image}
          alt={product.imageAlt || product.name}
          fill
          sizes="(min-width: 768px) 560px, 100vw"
          quality={75}
          className="object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-surface ${frameClassName}`}
      role="img"
      aria-label={`${product.name} mark`}
    >
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated font-display text-xl font-semibold text-foreground">
          {initials(product.name)}
        </div>
        <p className="mt-3 font-display text-lg font-semibold text-foreground">{product.name}</p>
        <p className="mt-1 text-xs text-muted">{product.statusLabel}</p>
      </div>
    </div>
  );
}
