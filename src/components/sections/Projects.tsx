import { siteConfig } from "@/data/site";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/ui/ProjectCard";

export function Projects() {
  return (
    <section id="work" className="section-wash-projects relative overflow-hidden py-28 lg:py-40">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal variant="slide-left">
          <SectionHeading
            label="Work"
            title="Selected work"
            description="Product milestones and client builds."
          />
        </ScrollReveal>

        <ScrollReveal stagger className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {siteConfig.projects.map((project, index) => (
            <StaggerChild key={project.id}>
              <ProjectCard project={project} index={index} />
            </StaggerChild>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
