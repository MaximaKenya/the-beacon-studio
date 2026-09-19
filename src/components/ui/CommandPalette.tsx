"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Command,
  Copy,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Search,
  Bot,
  Calendar,
  Rocket,
  Boxes,
  Activity,
} from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";

type CommandPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null
);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within provider");
  return ctx;
}

type CommandItem = {
  id: string;
  label: string;
  group: string;
  icon: ReactNode;
  action: () => void;
  keywords?: string;
};

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const {
    openChat,
    openBooking,
    openNewsletter,
    openIntake,
  } = useFeatures();

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
    } catch {
      window.location.href = `mailto:${siteConfig.email}`;
    }
    setOpen(false);
  }, []);

  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = siteConfig.navigation.map((section) => ({
      id: `nav-${section.id}`,
      label: `Go to ${section.label}`,
      group: "Navigation",
      icon: <Command className="h-4 w-4" aria-hidden />,
      action: () => {
        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
        setOpen(false);
      },
      keywords: section.label.toLowerCase(),
    }));

    const socialItems: CommandItem[] = siteConfig.social.map((link) => ({
      id: `social-${link.name}`,
      label: `Open ${link.name}`,
      group: "Social",
      icon:
        link.icon === "github" ? (
          <Github className="h-4 w-4" aria-hidden />
        ) : link.icon === "linkedin" ? (
          <Linkedin className="h-4 w-4" aria-hidden />
        ) : (
          <Mail className="h-4 w-4" aria-hidden />
        ),
      action: () => {
        window.open(link.href, link.icon === "email" ? "_self" : "_blank");
        setOpen(false);
      },
      keywords: link.name.toLowerCase(),
    }));

    const productItems: CommandItem[] = siteConfig.products.map((product) => ({
      id: `product-${product.id}`,
      label: `Open ${product.name}`,
      group: "Products",
      icon: <Boxes className="h-4 w-4" aria-hidden />,
      action: () => {
        window.location.href = `/products/${product.id}`;
        setOpen(false);
      },
      keywords: `${product.name} ${product.tags.join(" ")} product suite`.toLowerCase(),
    }));

    return [
      ...navItems,
      ...productItems,
      {
        id: "copy-email",
        label: "Copy email address",
        group: "Actions",
        icon: <Copy className="h-4 w-4" aria-hidden />,
        action: copyEmail,
        keywords: "email contact mail",
      },
      ...(siteConfig.intake.enabled
        ? [
            {
              id: "start-project",
              label: "Start a Project",
              group: "Actions",
              icon: <Rocket className="h-4 w-4" aria-hidden />,
              action: () => {
                openIntake();
                setOpen(false);
              },
              keywords: "intake project hire start brief",
            } satisfies CommandItem,
          ]
        : []),
      ...(siteConfig.assistant.enabled
        ? [
            {
              id: "open-chat",
              label: `Ask ${siteConfig.assistant.name}`,
              group: "Actions",
              icon: <Bot className="h-4 w-4" aria-hidden />,
              action: () => {
                openChat();
                setOpen(false);
              },
              keywords: `chat ai assistant help ${siteConfig.assistant.name}`.toLowerCase(),
            } satisfies CommandItem,
          ]
        : []),
      ...(siteConfig.booking.enabled
        ? [
            {
              id: "open-booking",
              label: "Book a call",
              group: "Actions",
              icon: <Calendar className="h-4 w-4" aria-hidden />,
              action: () => {
                openBooking();
                setOpen(false);
              },
              keywords: "book schedule call meeting calendar",
            } satisfies CommandItem,
          ]
        : []),
      ...(siteConfig.newsletter.enabled
        ? [
            {
              id: "open-newsletter",
              label: "Subscribe to newsletter",
              group: "Actions",
              icon: <Mail className="h-4 w-4" aria-hidden />,
              action: () => {
                openNewsletter();
                setOpen(false);
              },
              keywords: "newsletter subscribe updates",
            } satisfies CommandItem,
          ]
        : []),
      {
        id: "suite-status",
        label: "View suite status",
        group: "Studio",
        icon: <Activity className="h-4 w-4" aria-hidden />,
        action: () => {
          document.getElementById("constellation")?.scrollIntoView({ behavior: "smooth" });
          setOpen(false);
        },
        keywords: "status operational suite health",
      },
      {
        id: "go-estimator",
        label: "Open timeline estimator",
        group: "Studio",
        icon: <Rocket className="h-4 w-4" aria-hidden />,
        action: () => {
          document.getElementById("estimator")?.scrollIntoView({ behavior: "smooth" });
          setOpen(false);
        },
        keywords: "estimate timeline weeks scope roi",
      },
      ...socialItems,
    ];
  }, [copyEmail, openChat, openBooking, openNewsletter, openIntake]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords?.includes(q) ||
        item.group.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)
        );
      }
      if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].action();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, activeIndex]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach((item) => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }, [filtered]);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center bg-background/60 px-4 pt-[15vh] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass-panel w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl shadow-black/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${siteConfig.brand.name} — products, actions…`}
                className="flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
                autoFocus
                aria-label="Search commands"
              />
              <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
                ESC
              </kbd>
            </div>

            <div className="max-h-[320px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  No results found.
                </p>
              ) : (
                Object.entries(grouped).map(([group, groupItems]) => (
                  <div key={group} className="mb-2">
                    <p className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                      {group}
                    </p>
                    <ul role="listbox">
                      {groupItems.map((item) => {
                        const globalIndex = filtered.indexOf(item);
                        const isActive = globalIndex === activeIndex;
                        return (
                          <li key={item.id} role="option" aria-selected={isActive}>
                            <button
                              type="button"
                              onClick={item.action}
                              onMouseEnter={() => setActiveIndex(globalIndex)}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                isActive
                                  ? "bg-accent/10 text-accent"
                                  : "text-foreground hover:bg-surface-elevated"
                              }`}
                            >
                              <span className="text-muted">{item.icon}</span>
                              {item.label}
                              {item.group === "Social" && (
                                <ExternalLink
                                  className="ml-auto h-3 w-3 text-muted"
                                  aria-hidden
                                />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[10px] text-muted">
              <span>
                <kbd className="rounded border border-border px-1 font-mono">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="rounded border border-border px-1 font-mono">↵</kbd> select
              </span>
              <span className="ml-auto font-mono">⌘K / Ctrl+K</span>
            </div>
          </div>
        </div>
      )}
    </CommandPaletteContext.Provider>
  );
}
