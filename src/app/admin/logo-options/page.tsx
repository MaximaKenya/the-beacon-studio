import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import Link from "next/link";
import { CONCEPT_A, type ConceptVariant } from "@/components/brand/conceptA";
import { CONCEPT_A_MOTION, ConceptALockup, ConceptAMark } from "@/components/brand/ConceptAMark";
import { CONCEPT_B, type ConceptBVariant } from "@/components/brand/conceptB";
import { CONCEPT_B_MOTION, ConceptBLockup, ConceptBMark } from "@/components/brand/ConceptBMark";
import { FINAL_MOTION, FinalLockup, FinalMark } from "@/components/brand/FinalMark";
import { ARTISTIC_PATHS } from "@/components/brand/artisticPaths";
import { ArtisticMark } from "@/components/brand/artisticMarks";
import { LOGO_OPTIONS } from "@/components/brand/logoOptions";

const wordmark = Fraunces({
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  title: "Logo options",
  description: "The Beacon Studio lighthouse: smoothed wave and starburst, lockups, and the live mark.",
  robots: { index: false, follow: false },
};

const SMALL = [16, 32, 64] as const;
const EARLIER_SIZES = [16, 32, 64, 128] as const;

const FINAL_FILES = [
  ["icon", "final-icon.svg"],
  ["animated", "final-animated.svg"],
  ["horizontal dark", "final-horizontal-dark.svg"],
  ["horizontal light", "final-horizontal-light.svg"],
  ["stacked dark", "final-stacked-dark.svg"],
  ["stacked light", "final-stacked-light.svg"],
  ["mono", "final-flat.svg"],
  ["favicon", "final-favicon.svg"],
] as const;

const FIELD: CSSProperties = {
  background: "#1E0A32",
  color: "#f6f3ff",
};

const PURPLE: CSSProperties = {
  background: "#16082e",
  color: "#f6f3ff",
};

const TEAL: CSSProperties = {
  background: "#e5f7f4",
  color: "#14312e",
};

const DARK: CSSProperties = {
  background: "#140e24",
  color: "#f6f3ff",
  ["--accent" as string]: "#45baab",
  ["--mark-grad-from" as string]: "#d4c4f7",
  ["--mark-grad-to" as string]: "#45baab",
};

const LIGHT: CSSProperties = {
  background: "#f4fbfa",
  color: "#1b2a33",
  ["--accent" as string]: "#0c6e64",
  ["--mark-grad-from" as string]: "#0c6e64",
  ["--mark-grad-to" as string]: "#7ecfc4",
};

const CONCEPT_FILES = ["icon", "horizontal", "stacked", "flat", "favicon", "animated"] as const;

export default function LogoOptionsPage() {
  return (
    <div className="px-4 pb-16 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Brand</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-heading">
          Logo options
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          This is the live mark. The tower is the approved auto-trace. The wave and the starburst
          rays are the same shapes with the jagged edges drawn as clean curves. The header, footer,
          portal, and emails use it. Earlier studies stay below.
        </p>

        <style>{FINAL_MOTION}</style>
        <style>{CONCEPT_B_MOTION}</style>
        <style>{CONCEPT_A_MOTION}</style>
        <section id="final-candidate" className="mt-10">
          <h2 className="font-display text-xl font-semibold text-heading">Final candidate</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            On the large mark the lighthouse rises in, the lantern ignites, and the rays bloom with
            the glow. Then the glow breathes, the rays twinkle, and the wave shimmers. Reduced
            motion shows the finished still mark.
          </p>
          <p className="mt-3 text-xs text-muted">
            {FINAL_FILES.map(([label, file], index) => (
              <span key={file}>
                {index > 0 ? " · " : null}
                <Link href={`/logo-options/${file}`} className="text-accent underline-offset-2 hover:underline">
                  {label}
                </Link>
              </span>
            ))}
          </p>
          <div id="final-compare" className="mt-4 grid gap-3 lg:grid-cols-2">
            <div
              className="flex flex-col items-center rounded-[var(--radius-md)] px-4 py-5"
              style={FIELD}
            >
              <p className="self-start text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                Source
              </p>
              {/* Unmodified source photograph. next/image would recompress it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-options/final-source.jpg"
                alt="Chosen study: spiral lighthouse, teal starburst, two-curl wave, deep purple field"
                className="mt-3 w-full max-w-[420px]"
              />
            </div>
            <div
              className="flex flex-col items-center rounded-[var(--radius-md)] px-4 py-5"
              style={FIELD}
            >
              <p className="self-start text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                Vector
              </p>
              <FinalMark size={400} animated className="mt-3" />
            </div>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="rounded-[var(--radius-md)] px-4 py-4" style={FIELD}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                Horizontal, dark
              </p>
              <div className="mt-3">
                <FinalLockup layout="horizontal" markSize={112} wordmarkClassName={wordmark.className} />
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] px-4 py-4" style={TEAL}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                Horizontal, light
              </p>
              <div className="mt-3">
                <FinalLockup layout="horizontal" markSize={112} wordmarkClassName={wordmark.className} />
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] px-4 py-4" style={FIELD}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                Stacked, dark
              </p>
              <div className="mt-3 flex justify-center">
                <FinalLockup layout="stacked" markSize={150} wordmarkClassName={wordmark.className} />
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] px-4 py-4" style={TEAL}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                Stacked, light
              </p>
              <div className="mt-3 flex justify-center">
                <FinalLockup layout="stacked" markSize={150} wordmarkClassName={wordmark.className} />
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-md)] px-4 py-4" style={TEAL}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">Mono</p>
              {/* currentColor resolves to black inside a standalone SVG image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-options/final-flat.svg" alt="One-color lighthouse silhouette" className="mt-3 h-44" />
            </div>
            <div className="flex flex-col rounded-[var(--radius-md)] px-4 py-4" style={FIELD}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">Favicon</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-options/final-favicon.svg" alt="Rounded app icon" className="mt-3 h-28 w-28" />
            </div>
          </div>
        </section>

        <section id="concept-b" className="mt-14">
          <h2 className="font-display text-xl font-semibold text-heading">Concept B</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            The same flowing tower, the same violet-to-teal gradient, and the same base wave.
            B1 through B4 change only the short light at the lantern. On the large marks that light
            pulses.
          </p>
          <div className="mt-5 flex flex-col gap-8">
            {CONCEPT_B.map((variant) => (
              <article
                key={variant.id}
                className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {variant.id.toUpperCase()}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-heading">
                  {variant.name}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{variant.story}</p>
                <p className="mt-3 text-xs text-muted">
                  {CONCEPT_FILES.map((file, index) => (
                    <span key={file}>
                      {index > 0 ? " · " : null}
                      <Link
                        href={`/logo-options/${variant.id}-${file}.svg`}
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        {file}
                      </Link>
                    </span>
                  ))}
                </p>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <ConceptBHero label="Dark purple" style={PURPLE} variant={variant} />
                  <ConceptBHero label="Light teal" style={TEAL} variant={variant} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <ConceptBFlat label="Flat on purple" style={PURPLE} variant={variant} />
                  <ConceptBFlat label="Flat on teal" style={TEAL} variant={variant} />
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-[var(--radius-md)] px-4 py-4" style={PURPLE}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                      Horizontal
                    </p>
                    <div className="mt-3">
                      <ConceptBLockup
                        variant={variant}
                        layout="horizontal"
                        markSize={96}
                        wordmarkClassName={wordmark.className}
                      />
                    </div>
                  </div>
                  <div className="rounded-[var(--radius-md)] px-4 py-4" style={TEAL}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                      Stacked
                    </p>
                    <div className="mt-3 flex justify-center">
                      <ConceptBLockup
                        variant={variant}
                        layout="stacked"
                        markSize={120}
                        wordmarkClassName={wordmark.className}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="concept-a" className="mt-14">
          <h2 className="font-display text-xl font-semibold text-heading">Concept A</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Violet to teal, on deep purple. The horizontal ray is shorter than the original study.
            On the large marks the lantern fades in, the beam draws, and both keep a quiet pulse.
          </p>
          <div className="mt-5 flex flex-col gap-8">
            {CONCEPT_A.map((variant) => (
              <article
                key={variant.id}
                className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {variant.id.toUpperCase()}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-heading">
                  {variant.name}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{variant.story}</p>
                <p className="mt-3 text-xs text-muted">
                  {CONCEPT_FILES.map((file, index) => (
                    <span key={file}>
                      {index > 0 ? " · " : null}
                      <Link
                        href={`/logo-options/${variant.id}-${file}.svg`}
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        {file}
                      </Link>
                    </span>
                  ))}
                </p>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <ConceptHero label="Dark purple" style={PURPLE} variant={variant} />
                  <ConceptHero label="Light teal" style={TEAL} variant={variant} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <ConceptFlat label="Flat on purple" style={PURPLE} variant={variant} />
                  <ConceptFlat label="Flat on teal" style={TEAL} variant={variant} />
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-[var(--radius-md)] px-4 py-4" style={PURPLE}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                      Horizontal
                    </p>
                    <div className="mt-3">
                      <ConceptALockup
                        variant={variant}
                        layout="horizontal"
                        markSize={96}
                        wordmarkClassName={wordmark.className}
                      />
                    </div>
                  </div>
                  <div className="rounded-[var(--radius-md)] px-4 py-4" style={TEAL}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
                      Stacked
                    </p>
                    <div className="mt-3 flex justify-center">
                      <ConceptALockup
                        variant={variant}
                        layout="stacked"
                        markSize={120}
                        wordmarkClassName={wordmark.className}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="artistic-studies" className="mt-14">
          <h2 className="font-display text-xl font-semibold text-heading">Artistic studies</h2>
          <div className="mt-5 flex flex-col gap-8">
            {ARTISTIC_PATHS.map((mark) => (
              <article
                key={mark.id}
                className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5"
              >
                <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,16rem)_1fr_1fr]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      {mark.number}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-heading">
                      {mark.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{mark.story}</p>
                    <p className="mt-3 text-xs text-muted">
                      <Link href={mark.file} className="text-accent underline-offset-2 hover:underline">
                        gradient
                      </Link>
                      {" · "}
                      <Link
                        href={mark.flatFile}
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        flat
                      </Link>
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <FlatRow label="Dark" style={DARK} mark={mark} />
                      <FlatRow label="Light" style={LIGHT} mark={mark} />
                    </div>
                  </div>
                  <Hero label="Dark" style={DARK} mark={mark} />
                  <Hero label="Light" style={LIGHT} mark={mark} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-heading">Earlier studies</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            The first four lighthouse drawings. They stay here for comparison.
          </p>
          <p className="mt-3 text-sm text-muted">
            {LOGO_OPTIONS.map((option, index) => (
              <span key={option.id}>
                {index > 0 ? " · " : null}
                <Link href={option.file} className="text-accent underline-offset-2 hover:underline">
                  {option.id}
                </Link>
              </span>
            ))}
            {" · "}
            <Link
              href="/logo-options/favicon.svg"
              className="text-accent underline-offset-2 hover:underline"
            >
              favicon
            </Link>
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {LOGO_OPTIONS.map(({ id, name, blurb, Mark }, index) => (
              <article
                key={id}
                className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  0{index + 1}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-heading">{name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{blurb}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <EarlierSwatch label="Dark" style={DARK} Mark={Mark} />
                  <EarlierSwatch label="Light" style={LIGHT} Mark={Mark} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ConceptBHero({
  label,
  style,
  variant,
}: {
  label: string;
  style: CSSProperties;
  variant: ConceptBVariant;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-md)] px-4 py-5" style={style}>
      <p className="self-start text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <ConceptBMark variant={variant} size={280} animated className="mt-2" />
    </div>
  );
}

function ConceptBFlat({
  label,
  style,
  variant,
}: {
  label: string;
  style: CSSProperties;
  variant: ConceptBVariant;
}) {
  return (
    <div className="rounded-[var(--radius-md)] px-3 py-3" style={style}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        {SMALL.map((size) => (
          <div key={size} className="flex flex-col items-center gap-1">
            <ConceptBMark variant={variant} size={size} tone="flat" />
            <span className="text-[10px] tabular-nums opacity-70">{size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConceptHero({
  label,
  style,
  variant,
}: {
  label: string;
  style: CSSProperties;
  variant: ConceptVariant;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-md)] px-4 py-5" style={style}>
      <p className="self-start text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <ConceptAMark variant={variant} size={280} animated className="mt-2" />
    </div>
  );
}

function ConceptFlat({
  label,
  style,
  variant,
}: {
  label: string;
  style: CSSProperties;
  variant: ConceptVariant;
}) {
  return (
    <div className="rounded-[var(--radius-md)] px-3 py-3" style={style}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        {SMALL.map((size) => (
          <div key={size} className="flex flex-col items-center gap-1">
            <ConceptAMark variant={variant} size={size} tone="flat" />
            <span className="text-[10px] tabular-nums opacity-70">{size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero({
  label,
  style,
  mark,
}: {
  label: string;
  style: CSSProperties;
  mark: (typeof ARTISTIC_PATHS)[number];
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-md)] px-4 py-5" style={style}>
      <p className="self-start text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <ArtisticMark mark={mark} size={280} tone="gradient" className="mt-2" />
    </div>
  );
}

function FlatRow({
  label,
  style,
  mark,
}: {
  label: string;
  style: CSSProperties;
  mark: (typeof ARTISTIC_PATHS)[number];
}) {
  return (
    <div className="rounded-[var(--radius-md)] px-2 py-2" style={style}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-1">
        {SMALL.map((size) => (
          <div key={size} className="flex flex-col items-center gap-1">
            <ArtisticMark mark={mark} size={size} tone="flat" />
            <span className="text-[10px] tabular-nums opacity-70">{size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EarlierSwatch({
  label,
  style,
  Mark,
}: {
  label: string;
  style: CSSProperties;
  Mark: (typeof LOGO_OPTIONS)[number]["Mark"];
}) {
  return (
    <div className="rounded-[var(--radius-md)] px-3 py-3" style={style}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        {EARLIER_SIZES.map((size) => (
          <div key={size} className="flex flex-col items-center gap-1.5">
            <Mark size={size} />
            <span className="text-[10px] tabular-nums opacity-70">{size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
