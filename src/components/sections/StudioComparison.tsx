import { studioComparison } from "@/data/comparison";

export function StudioComparison() {
  return (
    <section id="compare" className="relative py-20 lg:py-28" aria-labelledby="compare-heading">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">How to staff it</p>
        <h2 id="compare-heading" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
          Hire, freelance, or a studio workflow
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          The same job can sit with a new employee, a freelancer, or one automation. Pick the one that matches how often the work repeats.
        </p>
        <ul className="mt-10 grid gap-4 lg:grid-cols-3">
          {studioComparison.map((item) => (
            <li key={item.id} className={`sleek-card rounded-3xl p-6 ${item.emphasis ? "sleek-card-popular" : ""}`}>
              <h3 className="font-display text-xl font-semibold text-heading">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{item.line}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">{item.fit}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
