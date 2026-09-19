"use client";

import { Radio, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function NowPlayingFeed() {
  const reducedMotion = useReducedMotion();
  const items = siteConfig.nowPlaying;

  return (
    <section aria-label="Now playing activity feed" className="border-b border-border bg-surface/30 py-5">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="h-4 w-4 text-accent-warm animate-pulse" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent-warm">
            Now playing
          </span>
        </div>
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          {items.map((item, i) => (
            <li key={item.id}>
              {reducedMotion ? (
                <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs text-foreground">
                  <Sparkles className="h-3 w-3 text-accent" aria-hidden />
                  <span className="text-muted">{item.type}:</span> {item.label}
                </span>
              ) : (
                <motion.span
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs text-foreground backdrop-blur-sm"
                >
                  <Sparkles className="h-3 w-3 text-accent" aria-hidden />
                  <span className="font-medium text-muted">{item.type}</span>
                  {item.label}
                </motion.span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
