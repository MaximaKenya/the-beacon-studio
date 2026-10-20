import Link from "next/link";
import { illustrativeExamples } from "@/data/landings";

/** Example shapes only. Hidden copy makes the label impossible to miss. */
export function ExampleResults() {
  return (
    <section id="examples" className="relative py-20 lg:py-28" aria-labelledby="examples-heading">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Illustrative examples</p>
        <h2 id="examples-heading" className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
          Example results
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          These are not client results and not testimonials. They show the shape of a workflow. We publish a quote only after a real client agrees.
        </p>
        <ul className="mt-10 grid gap-4 lg:grid-cols-3">
          {illustrativeExamples.slice(0, 3).map((example) => (
            <li key={example.id} className="sleek-card rounded-3xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Illustrative · {example.industry}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-heading">{example.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground">{example.before}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{example.after}</p>
              <p className="mt-4 text-sm text-muted">{example.figure}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          <Link href="/industries/clinics" className="text-accent hover:underline">
            Clinics
          </Link>
          {" · "}
          <Link href="/industries/schools" className="text-accent hover:underline">
            Schools
          </Link>
          {" · "}
          <Link href="/industries/saccos" className="text-accent hover:underline">
            SACCOs
          </Link>
          {" · "}
          <Link href="/industries/real-estate" className="text-accent hover:underline">
            Real estate
          </Link>
          {" · "}
          <Link href="/industries/retail" className="text-accent hover:underline">
            Retail
          </Link>
        </p>
      </div>
    </section>
  );
}
