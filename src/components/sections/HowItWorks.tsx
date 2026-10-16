import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function HowItWorks() {
  return (
    <section id="process" className="relative border-t border-border py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="How we work"
          title="Three steps"
          description="The same path for automation and custom software."
        />

        <ol className="grid gap-6 md:grid-cols-3">
          {siteConfig.howItWorks.map((step) => (
            <li key={step.id} className="rounded-2xl border border-border bg-surface p-6">
              <p className="font-display text-sm font-semibold text-accent">
                {String(step.step).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
