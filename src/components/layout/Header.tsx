"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Mail, Menu, Phone, Search, X } from "lucide-react";
import { siteConfig } from "@/data/site";
import { BeaconWordmark } from "@/components/brand/BeaconWordmark";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useCommandPalette } from "@/components/ui/CommandPalette";
import { useFeatures } from "@/providers/FeatureProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { mailtoHref, phoneHref, trackCallClick, trackEmailClick } from "@/lib/contact-actions";

/** Primary nav stays single-line; overflow items live in More */
const PRIMARY_NAV_IDS = new Set(["products", "services", "pricing", "about", "book"]);

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const sectionIds = siteConfig.navigation.map((s) => s.id);
  const activeSection = useActiveSection(sectionIds);
  const { setOpen: setCommandOpen } = useCommandPalette();
  const { openBooking, openIntake } = useFeatures();

  const primaryNav = siteConfig.navigation.filter((l) => PRIMARY_NAV_IDS.has(l.id));
  const moreNav = siteConfig.navigation.filter((l) => !PRIMARY_NAV_IDS.has(l.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const close = () => setMoreOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [moreOpen]);

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal")
  ) {
    return null;
  }

  const navLinkClass = (isActive: boolean) =>
    `group relative whitespace-nowrap rounded-lg px-2 py-1.5 text-[13px] transition-colors md:px-2.5 md:text-sm ${
      isActive ? "text-accent" : "text-muted hover:text-foreground"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-16 lg:px-8">
        <a
          href="#hero"
          className="shrink-0 transition-opacity hover:opacity-90"
          aria-label={`${siteConfig.brand.name} home`}
        >
          <BeaconWordmark size="sm" variant="compact" />
        </a>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
          aria-label="Main navigation"
        >
          {primaryNav.map((link) => {
            const isActive = activeSection === link.id;
            if (link.id === "book") {
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => openBooking()}
                  className={navLinkClass(isActive)}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-px h-px bg-accent" aria-hidden />
                  )}
                </button>
              );
            }

            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={navLinkClass(isActive)}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-px bg-accent" aria-hidden />
                )}
              </a>
            );
          })}

          {moreNav.length > 0 && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={`${navLinkClass(moreNav.some((l) => l.id === activeSection))} inline-flex items-center gap-0.5`}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                More
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>
              {moreOpen && (
                <div
                  role="menu"
                  className="absolute left-1/2 top-full z-50 mt-2 min-w-[10rem] -translate-x-1/2 rounded-xl border border-border bg-surface/95 p-1.5 shadow-lg backdrop-blur-xl"
                >
                  {moreNav.map((link) => (
                    <a
                      key={link.id}
                      role="menuitem"
                      href={`#${link.id}`}
                      onClick={() => setMoreOpen(false)}
                      className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-muted hover:bg-background hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a
            href={phoneHref()}
            onClick={() => trackCallClick("header")}
            className="hidden h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent/30 hover:text-accent xl:inline-flex"
            aria-label={`Call ${siteConfig.phoneDisplay}`}
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
          <a
            href={mailtoHref("Hello Beacon")}
            onClick={() => trackEmailClick("header")}
            className="hidden h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent/30 hover:text-accent xl:inline-flex"
            aria-label={`Email ${siteConfig.email}`}
          >
            <Mail className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="hidden items-center gap-1.5 rounded-lg border border-border bg-surface/50 px-2 py-1.5 text-sm text-muted transition-colors hover:border-accent/30 hover:text-foreground sm:inline-flex"
            aria-label="Open command palette"
          >
            <AnimatedIcon icon={Search} size="sm" animation="subtle" />
            <span className="font-mono text-[11px]">⌘K</span>
          </button>

          <ThemeToggle />

          <div className="hidden items-center gap-1.5 md:flex">
            <a
              href="/portal/login"
              className="inline-flex whitespace-nowrap rounded-lg border border-border/70 px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/30 hover:text-accent lg:text-[13px]"
            >
              Portal
            </a>
            <button
              type="button"
              onClick={() => openIntake()}
              className="inline-flex whitespace-nowrap rounded-lg bg-accent/10 px-2.5 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 lg:text-[13px]"
            >
              Start project
            </button>
            <button
              type="button"
              onClick={() => openBooking()}
              className="inline-flex whitespace-nowrap rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-background transition-colors hover:bg-accent-hover lg:text-[13px]"
            >
              Book
            </button>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-muted transition-colors hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <AnimatedIcon icon={X} size="lg" animation="subtle" />
            ) : (
              <AnimatedIcon icon={Menu} size="lg" animation="subtle" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border/50 bg-background/95 px-6 py-6 backdrop-blur-xl lg:hidden"
          aria-label="Mobile navigation"
        >
          <ul className="flex flex-col gap-1">
            {siteConfig.navigation.map((link) => (
              <li key={link.id}>
                {link.id === "book" ? (
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-3 text-left text-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
                    onClick={() => {
                      setMobileOpen(false);
                      openBooking();
                    }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    href={`#${link.id}`}
                    className="block rounded-lg px-3 py-3 text-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
            <li className="mt-2 flex flex-wrap gap-2 border-t border-border/50 pt-4">
              <a
                href="/portal/login"
                className="inline-flex whitespace-nowrap rounded-lg border border-border px-3 py-2 text-sm font-medium text-accent"
                onClick={() => setMobileOpen(false)}
              >
                Portal
              </a>
              <button
                type="button"
                className="inline-flex whitespace-nowrap rounded-lg bg-accent/10 px-3 py-2 text-sm font-medium text-accent"
                onClick={() => {
                  setMobileOpen(false);
                  openIntake();
                }}
              >
                Start project
              </button>
              <button
                type="button"
                className="inline-flex whitespace-nowrap rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-background"
                onClick={() => {
                  setMobileOpen(false);
                  openBooking();
                }}
              >
                Book
              </button>
            </li>
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
                onClick={() => {
                  setMobileOpen(false);
                  setCommandOpen(true);
                }}
              >
                <AnimatedIcon icon={Search} size="md" animation="subtle" />
                Command palette
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
