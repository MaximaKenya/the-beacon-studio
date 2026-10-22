"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const NewsletterPopup = dynamic(() =>
  import("@/components/features/NewsletterPopup").then((mod) => mod.NewsletterPopup)
);
const BookingModal = dynamic(() =>
  import("@/components/features/BookingModal").then((mod) => mod.BookingModal)
);
const BeaconAiChat = dynamic(() =>
  import("@/components/features/BeaconAiChat").then((mod) => mod.BeaconAiChat)
);
const ActionCluster = dynamic(() =>
  import("@/components/features/ActionCluster").then((mod) => mod.ActionCluster)
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
      {!hidden && (
        <>
          <NewsletterPopup />
          <BookingModal />
          <ProductDrawer />
          <ProjectIntakeWizard />
          <BeaconAiChat />
          <ActionCluster />
          <ExitOffer />
          <TerminalEasterEgg />
          <KeyboardShortcuts />
          <SavedQuoteReminder />
        </>
      )}
    </>
  );
}
