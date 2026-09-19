import { siteConfig } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CountUp } from "@/components/ui/CountUp";

export function StatsBar() {
  return (
    <section aria-label="Statistics" className="border-y border-border bg-surface/30 py-12">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {siteConfig.stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={index * 0.1} variant={index % 2 === 0 ? "scale-in" : "fade-up"}>
              <div className="text-center md:text-left">
                <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
