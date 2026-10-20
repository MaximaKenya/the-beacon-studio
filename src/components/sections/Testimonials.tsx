import { siteConfig } from "@/data/site";

/**
 * Renders nothing until siteConfig.testimonials has a real quote.
 * Do not add placeholder people here.
 */
export function Testimonials() {
  const items = siteConfig.testimonials;
  if (items.length === 0) return null;

  return (
    <section id="testimonials" className="relative py-20 lg:py-28" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 id="testimonials-heading" className="font-display text-3xl font-semibold text-heading">
          From clients
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="sleek-card rounded-3xl p-6">
              <blockquote className="text-sm leading-relaxed text-foreground">“{item.quote}”</blockquote>
              <p className="mt-3 text-sm text-muted">
                {item.author}, {item.role}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
