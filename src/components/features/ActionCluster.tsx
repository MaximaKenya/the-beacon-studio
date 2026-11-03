"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Calendar, MessageCircle, MessageSquare, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FinalMark } from "@/components/brand/FinalMark";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";
import { phoneHref, trackCallClick, whatsappHref, whatsappPrefill } from "@/lib/contact-actions";
import {
  ASSISTANT_COMPACT_LABEL,
  CLUSTER_ACTION_LABELS,
  clusterActions,
  clusterPlacement,
  type ClusterActionId,
} from "@/components/features/action-cluster";

const ACTION_ICONS: Record<ClusterActionId, LucideIcon> = {
  chat: MessageSquare,
  whatsapp: MessageCircle,
  call: Phone,
  book: Calendar,
};

const NARROW_QUERY = "(max-width: 767px)";

function ActionGlyph({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} aria-hidden />;
}

/**
 * The only floating control on marketing pages. The lighthouse pill opens
 * Chat with AI, WhatsApp, Call, and Book a call. It stays off screen while
 * the chat panel, booking modal, or splash is open.
 */
export function ActionCluster() {
  const pathname = usePathname();
  const { chatOpen, bookingOpen, openChat, openBooking } = useFeatures();
  const [menuOpen, setMenuOpen] = useState(false);
  const [splashOpen, setSplashOpen] = useState(
    () => typeof document !== "undefined" && document.documentElement.hasAttribute("data-home-splash-open")
  );
  const [bottomBar, setBottomBar] = useState(
    () => typeof document !== "undefined" && document.documentElement.hasAttribute("data-bottom-bar")
  );
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(NARROW_QUERY).matches
  );
  const [cornerBlocked, setCornerBlocked] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const blockedRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal");

  useEffect(() => {
    const root = document.documentElement;
    const query = window.matchMedia(NARROW_QUERY);
    const read = () => {
      setSplashOpen(root.hasAttribute("data-home-splash-open"));
      setBottomBar(root.hasAttribute("data-bottom-bar"));
      setNarrow(query.matches);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-home-splash-open", "data-bottom-bar"],
    });
    query.addEventListener("change", read);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", read);
    };
  }, []);

  useEffect(() => {
    if (blockedRoute) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bar = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--page-bottom-bar")
      );
      const zoneHeight = (Number.isFinite(bar) ? bar : 0) + 96;
      const zone = {
        left: window.innerWidth - 300,
        top: window.innerHeight - zoneHeight,
        right: window.innerWidth,
        bottom: window.innerHeight,
      };
      const blocked = Array.from(document.querySelectorAll<HTMLElement>("[data-clear-cluster]")).some(
        (el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width < 8 || rect.height < 8) return false;
          return rect.left < zone.right && rect.right > zone.left && rect.top < zone.bottom && rect.bottom > zone.top;
        }
      );
      setCornerBlocked((current) => (current === blocked ? current : blocked));
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [blockedRoute, pathname]);

  const placement = clusterPlacement({
    chatOpen,
    bookingOpen,
    splashOpen,
    bottomBar,
    narrow,
    cornerBlocked,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (menuOpen) root.setAttribute("data-action-menu", "");
    else root.removeAttribute("data-action-menu");
    return () => root.removeAttribute("data-action-menu");
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root || root.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);

  if (placement === "hidden" && menuOpen) setMenuOpen(false);

  if (blockedRoute || placement === "hidden") return null;

  const actions = clusterActions({
    assistant: siteConfig.assistant.enabled,
    phone: Boolean(siteConfig.phone),
    booking: siteConfig.booking.enabled,
  });
  const name = siteConfig.assistant.name;

  function run(action: ClusterActionId) {
    setMenuOpen(false);
    if (action === "chat") {
      openChat();
      return;
    }
    if (action === "book") {
      openBooking();
      trackEvent("booking_cta_click", { source: "action-cluster" });
      return;
    }
    if (action === "call") trackCallClick("action-cluster");
    if (action === "whatsapp") trackEvent("cta_click", { type: "whatsapp", source: "action-cluster" });
  }

  return (
    <div
      ref={rootRef}
      data-action-cluster=""
      data-placement={placement}
      className="fixed z-[148] flex flex-col-reverse items-end gap-2"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom:
          placement === "lifted"
            ? "calc(var(--page-bottom-bar, 0px) + max(0.75rem, env(safe-area-inset-bottom)))"
            : "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <button
        type="button"
        className="action-pill inline-flex h-11 items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 sm:h-14 sm:gap-2.5 sm:pl-2 sm:pr-4"
        aria-label={menuOpen ? `Close ${name} menu` : `Open ${name} menu`}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-controls={menuOpen ? menuId : undefined}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <span className="flex h-8 w-8 items-center justify-center sm:h-10 sm:w-10">
          <FinalMark size={38} className="h-8 w-8 sm:h-[38px] sm:w-[38px]" />
        </span>
        {/* Phones get the short label so the launcher stays clear of carousel controls and card buttons. */}
        <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-heading sm:hidden" aria-hidden>
          {ASSISTANT_COMPACT_LABEL}
        </span>
        <span className="hidden whitespace-nowrap text-sm font-semibold tracking-tight text-heading sm:inline">{name}</span>
      </button>

      {menuOpen && (
        <ul id={menuId} role="menu" aria-label={name} className="action-menu-in flex flex-col items-end gap-2">
          {actions.map((action) => {
            const label = CLUSTER_ACTION_LABELS[action];
            const className =
              "action-pill inline-flex h-11 items-center gap-2.5 rounded-full px-3.5 text-sm font-medium text-heading";
            const icon = <ActionGlyph icon={ACTION_ICONS[action]} />;
            if (action === "whatsapp") {
              return (
                <li key={action}>
                  <a
                    role="menuitem"
                    href={whatsappHref(whatsappPrefill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    onClick={() => run(action)}
                  >
                    {icon}
                    {label}
                  </a>
                </li>
              );
            }
            if (action === "call") {
              return (
                <li key={action}>
                  <a role="menuitem" href={phoneHref()} className={className} onClick={() => run(action)}>
                    {icon}
                    {label}
                  </a>
                </li>
              );
            }
            return (
              <li key={action}>
                <button type="button" role="menuitem" className={className} onClick={() => run(action)}>
                  {icon}
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
