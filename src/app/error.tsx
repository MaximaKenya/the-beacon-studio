"use client";

import Link from "next/link";
import { BeaconMark } from "@/components/brand/BeaconMark";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="sleek-card w-full max-w-lg rounded-3xl px-8 py-10 text-center">
        <BeaconMark size={72} className="mx-auto" />
        <p className="mt-6 text-sm font-medium text-accent">Something went wrong</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-heading">This page hit a snag</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The rest of the site is fine. Try again, or head somewhere useful.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-surface-elevated px-5 text-sm font-semibold text-foreground"
          >
            Home
          </Link>
          <Link
            href="/book"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-surface-elevated px-5 text-sm font-semibold text-foreground"
          >
            Book a call
          </Link>
        </div>
      </div>
    </section>
  );
}
