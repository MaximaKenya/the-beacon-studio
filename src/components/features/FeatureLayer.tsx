"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFeatures } from "@/providers/FeatureProvider";
import { NewsletterPopup } from "@/components/features/NewsletterPopup";
import { BookingModal } from "@/components/features/BookingModal";
import { ChatWidget } from "@/components/features/ChatWidget";
import { FloatingBookCTA } from "@/components/features/FloatingBookCTA";
import { KeyboardShortcuts } from "@/components/features/KeyboardShortcuts";
import { TerminalEasterEgg } from "@/components/features/TerminalEasterEgg";
import { ProductDrawer } from "@/components/features/ProductDrawer";
import { ProjectIntakeWizard } from "@/components/features/ProjectIntakeWizard";
import { SavedQuoteReminder } from "@/components/features/SavedQuoteReminder";
import type { ReactNode } from "react";

export function FeatureLayer({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { openBooking } = useFeatures();

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#book") openBooking();
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [openBooking]);
  const hideMarketingOverlays =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal");

  return (
    <>
      {children}
      {/* Glow FAB available on every page (including /admin and /portal) */}
      <ChatWidget />
      {!hideMarketingOverlays && (
        <>
          <NewsletterPopup />
          <BookingModal />
          <ProductDrawer />
          <ProjectIntakeWizard />
          <FloatingBookCTA />
          <TerminalEasterEgg />
          <KeyboardShortcuts />
          <SavedQuoteReminder />
        </>
      )}
    </>
  );
}
