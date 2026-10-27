import Image from "next/image";
import Link from "next/link";
import { workStudies } from "@/data/work";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function SelectedWork() {
  return (
    <section id="work" className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="Work"
          title="Two products, in the open"
          description="ConfiRent and CadenceApp are live. Results stay blank until we can publish them."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {workStudies.map((study) => {
            const shot = study.shots[0];
            return (
              <article key={study.slug} className="sleek-card flex h-full flex-col overflow-hidden rounded-3xl">
                {shot && (
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    sizes="(min-width: 768px) 520px, 100vw"
                    className="h-52 w-full object-cover object-top"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-semibold text-heading">{study.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{study.problem}</p>
                  <Link href={study.path} className="mt-5 text-sm font-semibold text-accent">
                    Read the case study
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
