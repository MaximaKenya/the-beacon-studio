import type { ReactNode } from "react";
import Link from "next/link";
import { BeaconWordmark } from "@/components/brand/BeaconWordmark";
import { siteConfig } from "@/data/site";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/80 via-background to-teal-50/40">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="transition-opacity hover:opacity-90" aria-label="Home">
            <BeaconWordmark size="sm" variant="compact" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted sm:inline">
              Client portal
            </span>
            <Link
              href="/portal/login"
              className="text-xs font-medium text-accent hover:underline"
            >
              Account
            </Link>
            <Link href="/" className="text-xs text-muted hover:text-foreground">
              {siteConfig.brand.shortName} site
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 lg:px-8">{children}</main>
    </div>
  );
}
