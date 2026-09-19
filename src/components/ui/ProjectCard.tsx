"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState, type MouseEvent } from "react";
import { ArrowUpRight, Github, Sparkles } from "lucide-react";
import type { Project } from "@/data/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

type ProjectCardProps = {
  project: Project;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const isComingSoon = project.comingSoon ?? false;
  const cardRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) scale3d(1.015, 1.015, 1.015)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    setHovering(false);
  };

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] as const }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleMouseLeave}
      className="gradient-border group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/50 backdrop-blur-sm transition-[transform,box-shadow] duration-300 ease-out hover:shadow-2xl hover:shadow-accent-warm/15"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-surface-elevated to-background">
        {project.image ? (
          <>
            <Image
              src={project.image}
              alt={`${project.title} project cover`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-all duration-500 ${
                hovering && project.previewVideo ? "scale-105 opacity-0" : "group-hover:scale-105"
              }`}
              loading="lazy"
            />
            {project.previewVideo && hovering && !reducedMotion && (
              <video
                src={project.previewVideo}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
                aria-label={`Preview video for ${project.title}`}
              />
            )}
            {!project.previewVideo && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-accent/25 via-transparent to-accent-warm/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            )}
          </>
        ) : (
          <div className={`flex h-full flex-col items-center justify-center gap-4 text-muted ${isComingSoon ? "shimmer" : ""}`}>
            {isComingSoon ? (
              <>
                <div className="skeleton-pulse flex w-3/4 flex-col gap-2">
                  <div className="h-3 rounded bg-border/60" />
                  <div className="h-3 w-5/6 rounded bg-border/40" />
                  <div className="h-3 w-2/3 rounded bg-border/30" />
                </div>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent/80">
                  <AnimatedIcon icon={Sparkles} size="xs" animation="none" />
                  Coming Soon
                </div>
              </>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-surface-elevated">
                <AnimatedIcon icon={Sparkles} size="lg" animation="none" className="text-accent/70" />
              </div>
            )}
          </div>
        )}
        {isComingSoon && (
          <div className="absolute right-3 top-3 rounded-full border border-accent-warm/40 bg-background/85 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-warm backdrop-blur-sm">
            In Progress
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold text-foreground">{project.title}</h3>
        {project.kind && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
            {project.kind === "client" ? "Client work" : project.kind === "product" ? "Product" : "Internal"}
          </p>
        )}
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies used">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md border border-border bg-background/50 px-2.5 py-1 font-mono text-xs text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-3">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Live Demo
              <AnimatedIcon icon={ArrowUpRight} size="sm" animation="draw" className="text-accent group-hover/link:text-accent-hover" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted">
              Live Demo
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </span>
          )}
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              aria-label={`${project.title} on GitHub`}
            >
              <AnimatedIcon icon={Github} size="sm" animation="subtle" />
              Source
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted">
              <Github className="h-4 w-4" strokeWidth={1.75} />
              Source
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
