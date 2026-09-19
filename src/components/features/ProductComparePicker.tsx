"use client";

import { useMemo, useState } from "react";
import { GitCompare, X } from "lucide-react";
import { siteConfig } from "@/data/site";
import { trackEvent } from "@/lib/analytics";
import { useFeatures } from "@/providers/FeatureProvider";

/**
 * Floating compare-products quick picker (max 2 products side-by-side).
 */
export function ProductComparePicker() {
  const { openProductDrawer } = useFeatures();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const products = siteConfig.products;
  const pair = useMemo(
    () => products.filter((p) => selected.includes(p.id)),
    [products, selected]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          trackEvent("compare_open");
        }}
        className="fixed bottom-24 left-4 z-[140] inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background/90 px-4 text-xs font-medium text-foreground shadow-md backdrop-blur-md hover:border-accent/40 sm:left-6"
      >
        <GitCompare className="h-3.5 w-3.5 text-accent" />
        Compare
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[170] flex items-end justify-center bg-background/50 px-4 py-6 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass-panel w-full max-w-lg overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Suite
                </p>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Compare products
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 px-5 py-4">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    selected.includes(p.id)
                      ? "border-accent/50 bg-accent/10"
                      : "border-border/70 bg-surface/40"
                  }`}
                >
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="mt-0.5 block text-[11px] text-muted">{p.tagline}</span>
                </button>
              ))}
            </div>
            {pair.length === 2 && (
              <div className="grid gap-3 border-t border-border/60 px-5 py-4 sm:grid-cols-2">
                {pair.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border/60 bg-background/40 p-3">
                    <p className="font-display text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="mt-1 text-xs text-muted line-clamp-3">{p.description}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase text-accent">{p.status}</p>
                    <button
                      type="button"
                      onClick={() => {
                        openProductDrawer(p.id);
                        setOpen(false);
                      }}
                      className="mt-2 text-xs text-accent hover:underline"
                    >
                      View details
                    </button>
                  </div>
                ))}
              </div>
            )}
            {pair.length < 2 && (
              <p className="px-5 pb-4 text-xs text-muted">Select two products to compare.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
