"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BeaconWordmark } from "@/components/brand/BeaconWordmark";
import { siteConfig } from "@/data/site";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-x-0 top-0 z-[60] border-b border-border/60 bg-background/90 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
            aria-label={`Back to ${siteConfig.brand.name} website`}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Back to site</span>
            <span className="sm:hidden">Site</span>
          </Link>
          <Link href="/" className="transition-opacity hover:opacity-90" aria-label="Home">
            <BeaconWordmark size="sm" variant="compact" />
          </Link>
          <Link
            href="/admin"
            className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-foreground"
          >
            Admin
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
