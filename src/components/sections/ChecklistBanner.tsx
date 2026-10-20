import Link from "next/link";
import { CHECKLIST_TITLE } from "@/lib/checklist";

export function ChecklistBanner() {
  return (
    <section className="relative py-8" aria-labelledby="checklist-banner-heading">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="sleek-card flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Free download</p>
            <h2 id="checklist-banner-heading" className="mt-2 font-display text-2xl font-semibold text-heading">
              {CHECKLIST_TITLE}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Ten checks before you automate one job. Leave an email and download the HTML or PDF. It is saved as a lead so we can follow up.
            </p>
          </div>
          <Link
            href="/checklist"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background"
          >
            Get the checklist
          </Link>
        </div>
      </div>
    </section>
  );
}
