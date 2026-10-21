"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { ProgressPie } from "@/components/portal/ProgressPie";
import { formatNairobi } from "@/lib/time";
import type { ProjectRecord } from "@/lib/projects";

export function ClientProjectBoard({
  projects,
  selectedId,
  onSelect,
}: {
  projects: ProjectRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="space-y-4" aria-labelledby="client-projects-heading">
      <h2 id="client-projects-heading" className="font-display text-lg font-semibold text-foreground">
        Your projects
      </h2>
      <ul className="space-y-4">
        {projects.map((project) => {
          const selected = project.id === selectedId;
          return (
            <li key={project.id}>
              <article className={`sleek-card rounded-3xl p-5 sm:p-6 ${selected ? "choice-selected" : ""}`}>
                <button type="button" onClick={() => onSelect(project.id)} className="w-full text-left">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">{project.title}</h3>
                      <p className="mt-1 text-sm capitalize text-muted">
                        Status: <span className="text-accent">{project.status}</span>
                        {project.startDate ? ` · started ${project.startDate.slice(0, 10)}` : ""}
                        {project.targetDate ? ` · target ${project.targetDate.slice(0, 10)}` : ""}
                      </p>
                    </div>
                    <ProgressPie percent={project.progressPercent} size={96} />
                  </div>
                </button>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/70">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${project.progressPercent}%` }} />
                </div>
                <ul className="mt-4 space-y-2">
                  {project.milestones.map((milestone) => (
                    <li key={milestone.id} className="flex items-start gap-3 text-sm">
                      {milestone.done ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="text-foreground">{milestone.title}</span>
                        {milestone.note && <span className="mt-0.5 block text-xs text-muted">{milestone.note}</span>}
                      </span>
                      <span className="text-xs text-muted">
                        {milestone.percent}%
                        {milestone.dueDate ? ` · ${milestone.dueDate.slice(0, 10)}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
                <h4 className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">Updates</h4>
                <ol className="mt-2 space-y-3">
                  {project.updates.length === 0 && <li className="text-sm text-muted">No updates yet.</li>}
                  {project.updates.map((update) => (
                    <li key={update.id}>
                      <p className="text-sm text-foreground">{update.message}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatNairobi(update.at)} · {update.by}
                      </p>
                    </li>
                  ))}
                </ol>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
