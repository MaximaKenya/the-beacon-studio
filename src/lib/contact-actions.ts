import { siteConfig } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

export function phoneHref(): string {
  return `tel:${siteConfig.phone.replace(/\s+/g, "")}`;
}

export function mailtoHref(subject?: string): string {
  if (!subject) return `mailto:${siteConfig.email}`;
  return `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}`;
}

export function trackCallClick(source: string) {
  trackEvent("cta_click", { type: "call", source });
}

export function trackEmailClick(source: string) {
  trackEvent("cta_click", { type: "mailto", source });
}

/**
 * WhatsApp click-to-chat for the number configured in site.ts.
 * TODO(go-live): siteConfig.phone is still the placeholder +254 700 000 000.
 * Replace phone and phoneDisplay in src/data/site.ts before launch.
 * This link always uses that configured value.
 */
export function whatsappHref(message?: string): string {
  const digits = siteConfig.phone.replace(/\D/g, "");
  const url = `https://wa.me/${digits}`;
  if (!message) return url;
  return `${url}?text=${encodeURIComponent(message)}`;
}

export const whatsappPrefill =
  "Hi Beacon, I would like a free 20-minute audit.";
