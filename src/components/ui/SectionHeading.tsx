"use client";

type SectionHeadingProps = {
  label: string;
  title: string;
  description?: string;
  accent?: string;
  /** Landing pages pass h1. Homepage sections stay h2 under the hero. */
  as?: "h1" | "h2";
};

export function SectionHeading({
  label,
  title,
  description,
  accent,
  as = "h2",
}: SectionHeadingProps) {
  const Title = as;
  return (
    <div className="relative mb-10 max-w-2xl">
      <div className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-accent">
        <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />
        {label}
      </div>

      <Title className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
        {accent && (
          <span className="ml-2 inline-block text-accent-warm" aria-hidden>
            {accent}
          </span>
        )}
      </Title>

      {description && (
        <p className="mt-5 max-w-xl text-base leading-loose text-muted lg:text-lg">{description}</p>
      )}
    </div>
  );
}
