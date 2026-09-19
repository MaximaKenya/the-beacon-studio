"use client";

import { productForScreen, type ProductScreen } from "@/data/product-screens";
import { ProductScreenCard } from "@/components/sections/ProductScreenCard";

function ScreenRow({
  screens,
  source,
  inertCopy,
  onActivate,
}: {
  screens: ProductScreen[];
  source: string;
  inertCopy?: boolean;
  onActivate?: (productId: string) => void;
}) {
  return (
    <div className="flex shrink-0 gap-5 pr-5">
      {screens.map((screen) => {
        const product = productForScreen(screen);
        if (!product) return null;
        return (
          <ProductScreenCard
            key={`${screen.id}-${inertCopy ? "copy" : "main"}`}
            screen={screen}
            product={product}
            source={source}
            inertCopy={inertCopy}
            onActivate={onActivate}
          />
        );
      })}
    </div>
  );
}

type ProductScreenStripProps = {
  rowA: ProductScreen[];
  rowB: ProductScreen[];
  paused: boolean;
  reducedMotion: boolean;
  onActivate?: (productId: string) => void;
};

export function ProductScreenStrip({
  rowA,
  rowB,
  paused,
  reducedMotion,
  onActivate,
}: ProductScreenStripProps) {
  if (reducedMotion) {
    const unique = [...rowA, ...rowB].filter(
      (screen, index, all) => all.findIndex((s) => s.id === screen.id) === index
    );
    return (
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {unique.map((screen) => {
          const product = productForScreen(screen);
          if (!product) return null;
          return (
            <li key={screen.id}>
              <ProductScreenCard
                screen={screen}
                product={product}
                source="suite_strip"
                fluid
                onActivate={onActivate}
              />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div
      className={`product-screen-strip product-screen-mask relative ${paused ? "is-paused" : ""}`}
    >
      <div className="overflow-hidden py-3">
        <div className="product-screen-track">
          <ScreenRow screens={rowA} source="suite_strip" onActivate={onActivate} />
          <ScreenRow
            screens={rowA}
            source="suite_strip"
            inertCopy
            onActivate={onActivate}
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden py-3">
        <div className="product-screen-track is-reverse">
          <ScreenRow screens={rowB} source="suite_strip" onActivate={onActivate} />
          <ScreenRow
            screens={rowB}
            source="suite_strip"
            inertCopy
            onActivate={onActivate}
          />
        </div>
      </div>
    </div>
  );
}
