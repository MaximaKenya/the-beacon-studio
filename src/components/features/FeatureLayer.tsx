"use client";

import { usePathname } from "next/navigation";
import { NewsletterPopup } from "@/components/features/NewsletterPopup";
import { BookingModal } from "@/components/features/BookingModal";
import { ChatWidget } from "@/components/features/ChatWidget";
import { FloatingBookCTA } from "@/components/features/FloatingBookCTA";
import { KeyboardShortcuts } from "@/components/features/KeyboardShortcuts";
import { SmartCTABar } from "@/components/features/SmartCTABar";
import { TerminalEasterEgg } from "@/components/features/TerminalEasterEgg";
import { ProductDrawer } from "@/components/features/ProductDrawer";
import { ProjectIntakeWizard } from "@/components/features/ProjectIntakeWizard";
import { ExitIntentCall } from "@/components/features/ExitIntentCall";
import { ProductComparePicker } from "@/components/features/ProductComparePicker";
import { SavedQuoteReminder } from "@/components/features/SavedQuoteReminder";
import { PortalProgressTeaser } from "@/components/features/PortalProgressTeaser";
import type { ReactNode } from "react";

export function FeatureLayer({ children }: { children: ReactNode }) {
  const pathname = usePathname();
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
          <SmartCTABar />
          <TerminalEasterEgg />
          <KeyboardShortcuts />
          <ExitIntentCall />
          <ProductComparePicker />
          <SavedQuoteReminder />
          <PortalProgressTeaser />
        </>
      )}
    </>
  );
}
