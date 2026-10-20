"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const NewsletterPopup = dynamic(() =>
  import("@/components/features/NewsletterPopup").then((mod) => mod.NewsletterPopup)
);
const BookingModal = dynamic(() =>
  import("@/components/features/BookingModal").then((mod) => mod.BookingModal)
);
const ChatWidget = dynamic(() => import("@/components/features/ChatWidget").then((mod) => mod.ChatWidget));
const FloatingBookCTA = dynamic(() =>
  import("@/components/features/FloatingBookCTA").then((mod) => mod.FloatingBookCTA)
);
const WhatsAppButton = dynamic(() =>
  import("@/components/features/WhatsAppButton").then((mod) => mod.WhatsAppButton)
);
const BeaconAiChat = dynamic(() =>
  import("@/components/features/BeaconAiChat").then((mod) => mod.BeaconAiChat)
);
const MobileAuditBar = dynamic(() =>
  import("@/components/features/MobileAuditBar").then((mod) => mod.MobileAuditBar)
);
const ExitOffer = dynamic(() => import("@/components/features/ExitOffer").then((mod) => mod.ExitOffer));
const KeyboardShortcuts = dynamic(() =>
  import("@/components/features/KeyboardShortcuts").then((mod) => mod.KeyboardShortcuts)
);
const TerminalEasterEgg = dynamic(() =>
  import("@/components/features/TerminalEasterEgg").then((mod) => mod.TerminalEasterEgg)
);
const ProductDrawer = dynamic(() =>
  import("@/components/features/ProductDrawer").then((mod) => mod.ProductDrawer)
);
const ProjectIntakeWizard = dynamic(() =>
  import("@/components/features/ProjectIntakeWizard").then((mod) => mod.ProjectIntakeWizard)
);
const SavedQuoteReminder = dynamic(() =>
  import("@/components/features/SavedQuoteReminder").then((mod) => mod.SavedQuoteReminder)
);

/** Motion-heavy overlays, loaded after the first paint. */
export function DeferredOverlays({ hideMarketing }: { hideMarketing: boolean }) {
  const pathname = usePathname();
  const hidden =
    hideMarketing ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal");

  return (
    <>
      <ChatWidget />
      {!hidden && (
        <>
          <NewsletterPopup />
          <BookingModal />
          <ProductDrawer />
          <ProjectIntakeWizard />
          <FloatingBookCTA />
          <WhatsAppButton />
          <BeaconAiChat />
          <MobileAuditBar />
          <ExitOffer />
          <TerminalEasterEgg />
          <KeyboardShortcuts />
          <SavedQuoteReminder />
        </>
      )}
    </>
  );
}
