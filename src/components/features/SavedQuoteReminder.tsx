"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, FileText, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useFeatures } from "@/providers/FeatureProvider";
import { safeJsonParse } from "@/lib/safe-json";
import { downloadQuotationPdf } from "@/lib/pdf-docs";
import type { QuotationRecord } from "@/lib/documents";
import { trackEvent } from "@/lib/analytics";

const KEY = "beacon-saved-quote";
const DISMISS_KEY = "beacon-saved-quote-dismissed";

type Saved = {
  portalPath?: string;
  quotationId?: string;
  savedAt: string;
  name?: string;
  quotation?: QuotationRecord;
};

/** Persist quote reminder after intake (localStorage) for soft resume CTA. */
export function rememberQuote(payload: {
  portalPath?: string;
  quotationId?: string;
  name?: string;
  quotation?: QuotationRecord;
}) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...payload, savedAt: new Date().toISOString() })
    );
    sessionStorage.removeItem(DISMISS_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Soft, dismissible reminder when a quotation was saved/generated.
 * Offers resume portal, download quote, or continue intake — never blocks.
 */
export function SavedQuoteReminder() {
  const pathname = usePathname();
  const { openIntake, intakeOpen, bookingOpen, newsletterOpen, chatOpen } =
    useFeatures();
  const [saved, setSaved] = useState<Saved | null>(null);
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const raw = localStorage.getItem(KEY);
    const data = safeJsonParse<Saved | null>(raw, null);
    if (!data?.savedAt) return;

    // Soft delay so it doesn't compete with page load / other prompts
    const t = window.setTimeout(() => {
      setSaved(data);
      setVisible(true);
      trackEvent("saved_quote_reminder_shown");
    }, 2800);

    return () => window.clearTimeout(t);
  }, []);

  const overlayOpen = intakeOpen || bookingOpen || newsletterOpen || chatOpen;
  const hideOnRoute =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal");

  if (!saved || !visible || overlayOpen || hideOnRoute) return null;

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    trackEvent("saved_quote_reminder_dismiss");
  }

  async function onDownload() {
    if (!saved?.quotation) return;
    setDownloading(true);
    try {
      await downloadQuotationPdf(saved.quotation);
      trackEvent("saved_quote_reminder_download");
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }

  const greeting = saved.name ? `${saved.name.split(" ")[0]}, y` : "Y";

  return (
    <div
      className="fixed bottom-24 right-4 z-[145] max-w-xs rounded-2xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur-md sm:right-6"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 rounded-lg p-1 text-muted hover:text-foreground"
        aria-label="Dismiss reminder"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex gap-3 pr-4">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <div>
          <p className="text-sm font-medium text-foreground">
            {greeting}our quote is waiting
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Resume the portal, grab the PDF, or continue intake — whenever you're ready.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
            {saved.portalPath && (
              <Link
                href={saved.portalPath}
                onClick={() => trackEvent("saved_quote_reminder_portal")}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Open portal →
              </Link>
            )}
            {saved.quotation && (
              <button
                type="button"
                disabled={downloading}
                onClick={() => void onDownload()}
                className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-accent disabled:opacity-60"
              >
                <Download className="h-3 w-3" />
                {downloading ? "Preparing…" : "Download quote"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                dismiss();
                openIntake();
                trackEvent("saved_quote_reminder_intake");
              }}
              className="text-xs font-medium text-muted hover:text-foreground"
            >
              Continue intake
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
