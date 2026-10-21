import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ARTISTIC_PATHS } from "@/components/brand/artisticPaths";
import { ArtisticMark } from "@/components/brand/artisticMarks";
import { LOGO_OPTIONS } from "@/components/brand/logoOptions";

export const metadata: Metadata = {
  title: "Logo options",
  description: "Artistic mark studies for The Beacon Studio. The live mark is unchanged.",
  robots: { index: false, follow: false },
};

const SMALL = [16, 32, 64] as const;
const EARLIER_SIZES = [16, 32, 64, 128] as const;

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

export default function LogoOptionsPage() {
  return (
    <div className="px-4 pb-16 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Brand</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-heading">
          Logo options
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Six artistic studies. Each is one gesture — a stroke, a spiral, a ripple — drawn with a
          changing weight. The large marks use a brand gradient. The small row is the flat
          single-color version, the one a favicon would use. The mark on the live site stays as it
          is until one of these is chosen.
        </p>

        <section id="artistic-studies" className="mt-10">
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
