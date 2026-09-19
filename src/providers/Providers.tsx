"use client";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { FeatureProvider } from "@/providers/FeatureProvider";
import { CommandPaletteProvider } from "@/components/ui/CommandPalette";
import { FeatureLayer } from "@/components/features/FeatureLayer";
import { PageTransition } from "@/components/ui/PageTransition";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { SectionNav } from "@/components/ui/SectionNav";
import { AnalyticsBeacon } from "@/components/features/AnalyticsBeacon";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <FeatureProvider>
        <CommandPaletteProvider>
          <FeatureLayer>
            <AnalyticsBeacon />
            <GrainOverlay />
            <ScrollProgress />
            <SectionNav />
            <PageTransition>{children}</PageTransition>
          </FeatureLayer>
        </CommandPaletteProvider>
      </FeatureProvider>
    </ThemeProvider>
  );
}
