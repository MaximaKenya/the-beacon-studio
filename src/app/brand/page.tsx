import type { Metadata } from "next";
import Link from "next/link";
import { BeaconMark } from "@/components/brand/BeaconMark";
import { BeaconWordmark } from "@/components/brand/BeaconWordmark";
import { MARK_CONCEPTS } from "@/components/brand/markConcepts";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Brand mark",
  description:
    "The Beacon Studio lighthouse mark, for light and dark backgrounds.",
  robots: { index: false, follow: false },
};

export default function BrandPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Brand</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        The Beacon Studio mark
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        The mark is a standalone lighthouse: a tapered tower, a lamp, a daymark band, and one
        light beam. It uses the text color for the tower and the accent for the light, so the
        same SVG works on light and dark backgrounds. Solid shapes only, so it stays clear at
        favicon size.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-lg font-semibold text-foreground">Live lockups</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              Icon only
            </p>
            <BeaconMark size={48} />
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              Wordmark
            </p>
            <BeaconWordmark size="md" variant="full" />
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              Mono
            </p>
            <BeaconMark size={48} variant="mono" />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-[var(--background)] p-5">
            <BeaconMark size={40} />
            <span className="text-sm text-muted">On page background</span>
          </div>
          <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-foreground p-5 text-[var(--background)]">
            <BeaconMark size={40} className="text-[var(--background)]" />
            <span className="text-sm opacity-80">Inverted surface</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-8 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
          <div className="flex flex-col items-center gap-2">
            <BeaconMark size={24} />
            <span className="text-[10px] uppercase tracking-wide text-muted">24px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <BeaconMark size={48} />
            <span className="text-[10px] uppercase tracking-wide text-muted">48px</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <BeaconMark size={128} />
            <span className="text-[10px] uppercase tracking-wide text-muted">128px</span>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-lg font-semibold text-foreground">Concepts</h2>
        <p className="mt-2 text-sm text-muted">
          Four earlier directions. The lighthouse above is the mark used across the site.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {MARK_CONCEPTS.map(({ id, name, blurb, Mark }) => (
            <article
              key={id}
              className="rounded-[var(--radius-lg)] border border-border bg-surface p-5"
            >
              <div className="flex h-28 items-center justify-center rounded-[var(--radius-md)] bg-[var(--background)]">
                <Mark size={64} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">{name}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{blurb}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-lg font-semibold text-foreground">Canva / print export</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>
            Color mark:{" "}
            <Link href="/brand/beacon-mark.svg" className="text-accent underline-offset-2 hover:underline">
              /brand/beacon-mark.svg
            </Link>
          </li>
          <li>
            Mono mark:{" "}
            <Link
              href="/brand/beacon-mark-mono.svg"
              className="text-accent underline-offset-2 hover:underline"
            >
              /brand/beacon-mark-mono.svg
            </Link>
          </li>
          <li>
            Wordmark lockup:{" "}
            <Link
              href="/brand/beacon-wordmark.svg"
              className="text-accent underline-offset-2 hover:underline"
            >
              /brand/beacon-wordmark.svg
            </Link>
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          In Canva: Upload → select the SVG → place on dark or light. Prefer the color mark for
          digital; mono for one-ink print. Files also live in{" "}
          <code className="text-foreground">public/brand/</code>.
        </p>
      </section>

      <section className="mt-14 rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Honest quality note
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The lighthouse is the mark used on the site, in the portals, and in email. The four
          cards above are earlier directions, including Beacon Dot. This SVG does{" "}
          <strong className="text-foreground">not</strong> beat a skilled human brand designer.
          For a mark you would put next to Linear or Notion without hesitation, commission a
          designer on Fiverr / 99designs / Dribbble for roughly{" "}
          <strong className="text-foreground">$100–300</strong> with this SVG as the brief.
          On Canva covers, the wordmark lockup (
          <code className="text-foreground">beacon-wordmark.svg</code>) carries the name with
          the lighthouse.
        </p>
      </section>

      <p className="mt-12 text-xs text-muted">
        {siteConfig.brand.name} · {siteConfig.brand.lockup}
      </p>
    </main>
  );
}
