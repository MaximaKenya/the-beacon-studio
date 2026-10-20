"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";
import { whatsappHref, whatsappPrefill } from "@/lib/contact-actions";

export function MobileAuditBar() {
  const pathname = usePathname();
  const { openBooking } = useFeatures();

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal")
  ) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      <div className="sleek-card flex items-center gap-2 rounded-2xl p-2">
        <button
          type="button"
          onClick={() => {
            trackEvent("cta_click", { type: "book", source: "mobile_bar" });
            openBooking("automation-audit");
          }}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-background"
        >
          Free audit
        </button>
        <a
          href={whatsappHref(whatsappPrefill)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("cta_click", { type: "whatsapp", source: "mobile_bar" })}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#25D366] text-sm font-semibold text-white"
          aria-label={`WhatsApp ${siteConfig.phoneDisplay}`}
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
