"use client";

import { ArrowUpRight, FileText } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FloatingShapes } from "@/components/ui/FloatingShapes";

export function NotesPreview() {
  const notes = siteConfig.notes;

  if (!notes.length) return null;

  return (
    <section id="notes" className="section-wash-projects relative overflow-hidden py-24 lg:py-32">
      <FloatingShapes
        shapes={[
          { type: "squiggle", top: "20%", left: "5%", size: 32, color: "var(--accent-violet)", duration: 8 },
          { type: "star", top: "75%", left: "88%", size: 16, color: "var(--accent-amber)", duration: 6 },
        ]}
      />
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="Notes"
            title="From the lab"
            description="Thoughts, experiments, and write-ups — more coming soon."
          />
        </ScrollReveal>

        <div className="grid gap-5 md:grid-cols-3">
          {notes.map((note, i) => (
            <ScrollReveal key={note.id} delay={i * 0.1}>
              <article className="gradient-border group flex h-full flex-col rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-violet/10">
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-violet/30 bg-accent-violet/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-violet">
                    <FileText className="h-3 w-3" aria-hidden />
                    {note.tag}
                  </span>
                  <time className="font-mono text-[10px] text-muted">{note.date}</time>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-accent">
                  {note.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{note.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-60">
                  Coming soon
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </span>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
