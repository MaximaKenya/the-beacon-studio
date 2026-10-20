"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type FeatureContextValue = {
  newsletterOpen: boolean;
  bookingOpen: boolean;
  chatOpen: boolean;
  chatInitialMessage: string | null;
  shortcutsOpen: boolean;
  intakeOpen: boolean;
  intakeProjectType: string | null;
  bookingMeetingType: string | null;
  bookingNote: string | null;
  productDrawerOpen: boolean;
  selectedProductId: string | null;
  openNewsletter: () => void;
  closeNewsletter: () => void;
  openBooking: (meetingTypeId?: string, note?: string) => void;
  closeBooking: () => void;
  openChat: (initialMessage?: string) => void;
  closeChat: () => void;
  setShortcutsOpen: (open: boolean) => void;
  openIntake: (projectTypeId?: string) => void;
  closeIntake: () => void;
  openProductDrawer: (productId: string) => void;
  closeProductDrawer: () => void;
};

const FeatureContext = createContext<FeatureContextValue | null>(null);

export function useFeatures() {
  const ctx = useContext(FeatureContext);
  if (!ctx) throw new Error("useFeatures must be used within FeatureProvider");
  return ctx;
}

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intakeProjectType, setIntakeProjectType] = useState<string | null>(null);
  const [bookingMeetingType, setBookingMeetingType] = useState<string | null>(null);
  const [bookingNote, setBookingNote] = useState<string | null>(null);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const closeOverlays = useCallback(() => {
    setNewsletterOpen(false);
    setBookingOpen(false);
    setChatOpen(false);
    setChatInitialMessage(null);
    setIntakeOpen(false);
    setIntakeProjectType(null);
    setBookingMeetingType(null);
    setBookingNote(null);
    setProductDrawerOpen(false);
    setSelectedProductId(null);
  }, []);

  const openNewsletter = useCallback(() => {
    closeOverlays();
    setNewsletterOpen(true);
  }, [closeOverlays]);
  const closeNewsletter = useCallback(() => setNewsletterOpen(false), []);

  const openBooking = useCallback(
    (meetingTypeId?: string, note?: string) => {
      closeOverlays();
      setBookingMeetingType(meetingTypeId ?? null);
      setBookingNote(note?.trim() ? note.trim() : null);
      setBookingOpen(true);
    },
    [closeOverlays]
  );
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const openChat = useCallback(
    (initialMessage?: string) => {
      closeOverlays();
      setChatInitialMessage(initialMessage ?? null);
      setChatOpen(true);
    },
    [closeOverlays]
  );
  const closeChat = useCallback(() => {
    setChatOpen(false);
    setChatInitialMessage(null);
  }, []);

  const openIntake = useCallback(
    (projectTypeId?: string) => {
      closeOverlays();
      setIntakeProjectType(projectTypeId ?? null);
      setIntakeOpen(true);
    },
    [closeOverlays]
  );
  const closeIntake = useCallback(() => setIntakeOpen(false), []);

  const openProductDrawer = useCallback(
    (productId: string) => {
      closeOverlays();
      setSelectedProductId(productId);
      setProductDrawerOpen(true);
    },
    [closeOverlays]
  );
  const closeProductDrawer = useCallback(() => {
    setProductDrawerOpen(false);
    setSelectedProductId(null);
  }, []);

  return (
    <FeatureContext.Provider
      value={{
        newsletterOpen,
        bookingOpen,
        chatOpen,
        chatInitialMessage,
        shortcutsOpen,
        intakeOpen,
        intakeProjectType,
        bookingMeetingType,
        bookingNote,
        productDrawerOpen,
        selectedProductId,
        openNewsletter,
        closeNewsletter,
        openBooking,
        closeBooking,
        openChat,
        closeChat,
        setShortcutsOpen,
        openIntake,
        closeIntake,
        openProductDrawer,
        closeProductDrawer,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
}
