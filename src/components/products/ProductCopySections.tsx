import { Check } from "lucide-react";
import { EVERY_APP_INCLUDES, type ProductCopy } from "@/data/product-copy";
import type { ProductShot } from "@/data/product-shots";
import { GalleryCarousel } from "@/components/gallery/ProductGallery";
import { MotionGallery } from "@/components/gallery/MotionGallery";

/** Conversion sections for a product page. Server-safe, no client hooks. */
export function ProductCopySections({ name, copy, shots = [] }: { name: string; copy: ProductCopy; shots?: ProductShot[] }) {
  return (
    <div className="mt-16 space-y-14">
      <GalleryCarousel shots={shots} name={name} />

      <section aria-labelledby="why-heading">
        <h2 id="why-heading" className="text-heading font-display text-2xl font-semibold tracking-tight">
          Why {name}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {copy.sellingPoints.map((group) => (
            <div key={group.title} className="sleek-card rounded-2xl bg-surface p-5">
              <h3 className="text-heading font-display text-base font-semibold">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm leading-relaxed text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-heading font-display text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.howItWorks.map((step, i) => (
            <li key={step} className="sleek-card rounded-2xl bg-surface p-5">
              <span className="font-display text-sm font-semibold text-accent">Step {i + 1}</span>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="outcomes-heading">
        <h2 id="outcomes-heading" className="text-heading font-display text-2xl font-semibold tracking-tight">
          Before and after
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.outcomes.map((o) => (
            <div key={o.before} className="sleek-card rounded-2xl bg-surface p-5 text-sm leading-relaxed">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Before</p>
              <p className="mt-1 text-muted">{o.before}</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-accent">After</p>
              <p className="mt-1 text-foreground">{o.after}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="includes-heading">
        <h2 id="includes-heading" className="text-heading font-display text-2xl font-semibold tracking-tight">
          Every Beacon app includes
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EVERY_APP_INCLUDES.map((item) => (
            <li key={item.title} className="sleek-card rounded-2xl bg-surface p-4">
              <p className="text-heading text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <MotionGallery
        id="all-screens"
        shots={shots}
        name={name}
        title={`Every ${name} screen`}
        description="Hover to tilt, tap to enlarge. Use ←/→ or swipe in the viewer."
      />

      <section aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-heading font-display text-2xl font-semibold tracking-tight">
          Questions
        </h2>
        <div className="mt-6 space-y-3">
          {copy.faqs.map((f) => (
            <details key={f.question} className="sleek-card group rounded-2xl bg-surface p-5">
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                {f.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
