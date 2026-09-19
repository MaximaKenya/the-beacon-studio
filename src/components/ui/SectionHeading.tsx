"use client";

type SectionHeadingProps = {
  label: string;
  title: string;
  description?: string;
  accent?: string;
};

export function SectionHeading({ label, title, description, accent }: SectionHeadingProps) {
  return (
    <div className="relative mb-14 max-w-2xl">
      <div className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-accent">
        <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />
        {label}
      </div>

      <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
        {accent && (
          <span className="ml-2 inline-block text-accent-warm" aria-hidden>
            {accent}
          </span>
        )}
      </h2>

      {description && (
        <p className="mt-5 text-base leading-relaxed text-muted lg:text-lg">{description}</p>
      )}
    </div>
  );
}
