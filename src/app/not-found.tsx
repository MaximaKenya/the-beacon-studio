import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { siteConfig } from "@/data/site";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-32 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          <Home className="h-4 w-4" aria-hidden />
          Back to {siteConfig.brand.name}
        </Link>
        <Link
          href="/#work"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/30 hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          View work
        </Link>
      </div>
    </section>
  );
}
