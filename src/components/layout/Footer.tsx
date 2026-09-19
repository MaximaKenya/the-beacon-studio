"use client";

import { usePathname } from "next/navigation";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { siteConfig } from "@/data/site";
import { BeaconWordmark } from "@/components/brand/BeaconWordmark";
import { SuiteLine } from "@/components/brand/SuiteLine";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";
import { mailtoHref, phoneHref, trackCallClick, trackEmailClick } from "@/lib/contact-actions";

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  twitter: Mail,
} as const;

export function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const { openNewsletter, openIntake } = useFeatures();

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal")
  ) {
    return null;
  }
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <BeaconWordmark size="md" variant="full" />
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.brand.name} — {siteConfig.brand.lockup}.
            </p>
            <div className="mt-4">
              <SuiteLine size="sm" align="left" />
            </div>
            <p className="mt-2 max-w-xs text-[11px] leading-relaxed text-muted/80">
              {siteConfig.brand.disambiguation}
            </p>
            <ul className="mt-5 flex items-center gap-2" aria-label="Social links">
              {siteConfig.social.map((link) => {
                const Icon = iconMap[link.icon];
                return (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target={link.icon === "email" ? undefined : "_blank"}
                      rel={link.icon === "email" ? undefined : "noopener noreferrer"}
                      onClick={() => {
                        if (link.icon === "email") trackEmailClick("footer_social");
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/30 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={link.name}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                );
              })}
              <li>
                <a
                  href={phoneHref()}
                  onClick={() => trackCallClick("footer")}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/30 hover:text-accent"
                  aria-label="Call"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </li>
              <li>
                <a
                  href={mailtoHref("Hello Beacon")}
                  onClick={() => trackEmailClick("footer")}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent/30 hover:text-accent"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted">
              <a
                href={phoneHref()}
                onClick={() => trackCallClick("footer_text")}
                className="hover:text-accent"
              >
                {siteConfig.phoneDisplay}
              </a>
              {" · "}
              <a
                href={mailtoHref()}
                onClick={() => trackEmailClick("footer_text")}
                className="hover:text-accent"
              >
                {siteConfig.email}
              </a>
            </p>
            <p className="mt-6 text-xs text-muted">
              © {year} {siteConfig.brand.legalName}. {siteConfig.footer.note}
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Products</p>
            <ul className="mt-3 space-y-2">
              {siteConfig.products.map((p) => (
                <li key={p.id}>
                  <a
                    href={`/products/${p.id}`}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Studio</p>
            <ul className="mt-3 space-y-2">
              {[
                { href: "#services", label: "Services" },
                { href: "#engagement", label: "Engage" },
                { href: "#estimator", label: "Timeline estimate" },
                { href: "#work", label: "Work" },
                { href: "#book", label: "Book a call" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => openIntake()}
                  className="text-sm text-muted transition-colors hover:text-accent"
                >
                Start your build
              </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Company</p>
            <ul className="mt-3 space-y-2">
              {[
                { href: "#about", label: "About" },
                { href: "#shipped", label: "Changelog" },
                { href: "#stack", label: "Stack" },
                { href: "#contact", label: "Contact" },
                { href: "/portal/login", label: "Client portal" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {siteConfig.newsletter.enabled && (
              <button
                type="button"
                onClick={() => {
                  openNewsletter();
                  trackEvent("newsletter_open", { source: "footer" });
                }}
                className="mt-4 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                Subscribe to updates
              </button>
            )}
            <ul className="mt-6 flex flex-wrap items-center gap-4">
              {siteConfig.footer.legal.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-xs text-muted hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
