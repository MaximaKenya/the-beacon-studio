"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BeaconWordmark } from "@/components/brand/BeaconWordmark";
import { siteConfig } from "@/data/site";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-[60] bg-background/88 shadow-[0_12px_36px_rgba(8,4,20,0.22)] backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin" className="shrink-0 transition-opacity hover:opacity-90" aria-label="Admin home">
              <BeaconWordmark size="sm" variant="compact" />
            </Link>
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
              Admin
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-surface/80 px-3 text-sm font-medium text-foreground transition-colors hover:text-accent"
            aria-label={`Back to ${siteConfig.brand.name} website`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Back to site</span>
            <span className="sm:hidden">Site</span>
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
