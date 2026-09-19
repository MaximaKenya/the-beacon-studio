"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Mail, MessageCircle, Phone, Rocket } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { phoneHref, trackCallClick } from "@/lib/contact-actions";

type CTA = "book" | "chat" | "intake" | "call";

function getCTAForScroll(): CTA {
  if (typeof window === "undefined") return "book";
  const y = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const pct = h > 0 ? y / h : 0;

  if (pct < 0.25) return "chat";
  if (pct < 0.5) return "intake";
  if (pct < 0.75) return "book";
  return "call";
}

export function SmartCTABar() {
  const { openBooking, openChat, openIntake, chatOpen, bookingOpen, newsletterOpen, intakeOpen } =
    useFeatures();
  const reducedMotion = useReducedMotion();
  const [cta, setCta] = useState<CTA>("chat");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setCta(getCTAForScroll());
      setVisible(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const anyModalOpen = chatOpen || bookingOpen || newsletterOpen || intakeOpen;
  const show = visible && !anyModalOpen;

  const config: Record<
    CTA,
    { label: string; icon: typeof Calendar; action: () => void }
  > = {
    book: {
      label: "Get a launch plan",
      icon: Calendar,
      action: () => {
        openBooking();
        trackEvent("smart_cta", { type: "book" });
      },
    },
    chat: {
      label: `Chat with ${siteConfig.assistant.name}`,
      icon: MessageCircle,
      action: () => {
        openChat();
        trackEvent("smart_cta", { type: "chat" });
      },
    },
    intake: {
      label: "Start your build",
      icon: Rocket,
      action: () => {
        openIntake();
        trackEvent("smart_cta", { type: "intake" });
      },
    },
    call: {
      label: "Call us",
      icon: Phone,
      action: () => {
        trackCallClick("smart_cta");
        window.location.href = phoneHref();
      },
    },
  };

  const current = config[cta];
  const Icon = current.icon;

  if (!siteConfig.booking.enabled && cta === "book") {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          {...(reducedMotion
            ? {}
            : {
                initial: { y: 80, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                exit: { y: 80, opacity: 0 },
              })}
          className="fixed bottom-0 left-0 right-0 z-[145] border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-xl sm:hidden"
        >
          <button
            type="button"
            onClick={current.action}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background shadow-lg"
          >
            <AnimatedIcon icon={Icon} size="sm" animation="subtle" className="text-background" />
            {current.label}
          </button>
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-2 flex w-full items-center justify-center gap-1.5 text-xs text-muted"
            onClick={() => trackEvent("smart_cta", { type: "mailto" })}
          >
            <Mail className="h-3 w-3" />
            Or email {siteConfig.email}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
