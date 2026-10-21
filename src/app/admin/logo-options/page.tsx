import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LOGO_OPTIONS } from "@/components/brand/logoOptions";

export const metadata: Metadata = {
  title: "Logo options",
  description: "Four lighthouse mark candidates for The Beacon Studio. The live mark is unchanged.",
  robots: { index: false, follow: false },
};

const SIZES = [16, 32, 64, 128] as const;

const DARK: CSSProperties = {
  background: "#140e24",
  color: "#f6f3ff",
  ["--accent" as string]: "#45baab",
};

const LIGHT: CSSProperties = {
  background: "#f4fbfa",
  color: "#1b2a33",
  ["--accent" as string]: "#0c6e64",
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
          Four lighthouse candidates. Each uses the text color for the tower and the accent for
          the lamp and the single beam, so the same drawing works on the purple dark theme and
          the teal light theme. The mark on the live site stays as it is until one of these is
          chosen.
        </p>
        <p className="mt-3 text-sm text-muted">
          SVG files:{" "}
          {LOGO_OPTIONS.map((option, index) => (
            <span key={option.id}>
              {index > 0 ? " · " : null}
              <Link href={option.file} className="text-accent underline-offset-2 hover:underline">
                {option.id}
              </Link>
            </span>
          ))}
          {" · "}
          <Link href="/logo-options/favicon.svg" className="text-accent underline-offset-2 hover:underline">
            favicon
          </Link>
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {LOGO_OPTIONS.map(({ id, name, blurb, Mark }) => (
            <article key={id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5">
              <h2 className="font-display text-lg font-semibold text-heading">{name}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{blurb}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Swatch label="Dark" style={DARK} Mark={Mark} />
                <Swatch label="Light" style={LIGHT} Mark={Mark} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Swatch({
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
        {SIZES.map((size) => (
          <div key={size} className="flex flex-col items-center gap-1.5">
            <Mark size={size} />
            <span className="text-[10px] tabular-nums opacity-70">{size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
