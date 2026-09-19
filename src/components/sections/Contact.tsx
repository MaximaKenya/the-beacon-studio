"use client";

import { Mail, MessageSquare, Phone } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/ui/ContactForm";
import { AnimatedIcon, IconWrapper } from "@/components/ui/AnimatedIcon";
import { mailtoHref, phoneHref, trackCallClick, trackEmailClick } from "@/lib/contact-actions";

export function Contact() {
  return (
    <section id="contact" className="relative border-t border-border bg-surface/20 py-24 lg:py-32">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal variant="fade-down">
          <SectionHeading
            label="Contact"
            title="Start a project"
            description={`Tell us what you're building — ${siteConfig.brand.name} will get back within 1–2 business days (EAT).`}
          />
        </ScrollReveal>

        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <ScrollReveal delay={0.1} variant="slide-right">
            <div className="space-y-8">
              <div className="flex gap-4">
                <IconWrapper accent="cyan" size="md">
                  <AnimatedIcon icon={Mail} size="md" animation="subtle" />
                </IconWrapper>
                <div>
                  <h3 className="font-display font-semibold text-foreground">Email</h3>
                  <a
                    href={mailtoHref("Project inquiry")}
                    onClick={() => trackEmailClick("contact")}
                    className="mt-1 text-sm text-muted transition-colors hover:text-accent"
                  >
                    {siteConfig.email}
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <IconWrapper accent="coral" size="md">
                  <AnimatedIcon icon={Phone} size="md" animation="subtle" />
                </IconWrapper>
                <div>
                  <h3 className="font-display font-semibold text-foreground">Call</h3>
                  <a
                    href={phoneHref()}
                    onClick={() => trackCallClick("contact")}
                    className="mt-1 text-sm text-muted transition-colors hover:text-accent"
                  >
                    {siteConfig.phoneDisplay}
                  </a>
                  <p className="mt-1 text-xs text-muted">Kenya · click to call</p>
                </div>
              </div>

              <div className="flex gap-4">
                <IconWrapper accent="violet" size="md">
                  <AnimatedIcon icon={MessageSquare} size="md" animation="subtle" />
                </IconWrapper>
                <div>
                  <h3 className="font-display font-semibold text-foreground">Response time</h3>
                  <p className="mt-1 text-sm text-muted">
                    Typically within 1–2 business days · Africa/Nairobi (EAT).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={phoneHref()}
                  onClick={() => trackCallClick("contact_cta")}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  <Phone className="h-4 w-4" />
                  Call now
                </a>
                <a
                  href={mailtoHref("Hello Beacon")}
                  onClick={() => trackEmailClick("contact_cta")}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
                >
                  <Mail className="h-4 w-4 text-accent" />
                  Email
                </a>
              </div>

              <p className="text-sm leading-relaxed text-muted">
                Prefer social? Find {siteConfig.founder.shortName} on{" "}
                {siteConfig.social
                  .filter((s) => s.icon !== "email")
                  .map((s, i, arr) => (
                    <span key={s.name}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent-hover"
                      >
                        {s.name}
                      </a>
                      {i < arr.length - 1 ? (i === arr.length - 2 ? " or " : ", ") : ""}
                    </span>
                  ))}
                .
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} variant="scale-in">
            <div className="rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-sm sm:p-8">
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
