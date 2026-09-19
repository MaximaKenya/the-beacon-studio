"use client";

import { siteConfig } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useFeatures } from "@/providers/FeatureProvider";

export function SectionNav() {
  const sectionIds = siteConfig.navigation.map((s) => s.id);
  const active = useActiveSection(sectionIds);
  const reducedMotion = useReducedMotion();
  const { openBooking } = useFeatures();

  if (reducedMotion) return null;

  return (
    <nav
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
      aria-label="Section navigation"
    >
      {siteConfig.navigation.map((section) => {
        const isActive = active === section.id;
        const label = (
          <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-md border border-border bg-surface/90 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {section.label}
          </span>
        );
        const dot = (
          <span
            className={`block rounded-full transition-all duration-300 ${
              isActive
                ? "h-2.5 w-2.5 bg-accent shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                : "h-2 w-2 bg-border group-hover:bg-muted group-hover:scale-125"
            }`}
          />
        );

        if (section.id === "book") {
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => openBooking()}
              className="group relative flex items-center justify-end"
              aria-label={section.label}
            >
              {label}
              {dot}
            </button>
          );
        }

        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="group relative flex items-center justify-end"
            aria-label={section.label}
            aria-current={isActive ? "true" : undefined}
          >
            {label}
            {dot}
          </a>
        );
      })}
    </nav>
  );
}
