"use client";

import { Sparkles } from "lucide-react";

const PROMPTS = [
  (name: string) => `What is ${name}?`,
  (name: string) => `Who is ${name} for?`,
  (name: string) => `How do I get access to ${name}?`,
];

export function AskGlowPrompt({
  productName,
  onAsk,
}: {
  productName: string;
  onAsk: (question: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden />
        <p className="font-display text-sm font-semibold text-foreground">Ask Glow</p>
      </div>
      <p className="mt-1 text-xs text-muted">Quick product questions — answered on-site.</p>
      <ul className="mt-4 space-y-2">
        {PROMPTS.map((fn) => {
          const q = fn(productName);
          return (
            <li key={q}>
              <button
                type="button"
                onClick={() => onAsk(q)}
                className="w-full rounded-lg border border-border/70 bg-background/50 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-accent/40 hover:bg-accent/5"
              >
                {q}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
