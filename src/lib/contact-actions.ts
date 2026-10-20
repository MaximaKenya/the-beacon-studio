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

/** WhatsApp click-to-chat. +254706397373 → https://wa.me/254706397373 */
export function whatsappHref(message?: string): string {
  const digits = siteConfig.phone.replace(/\D/g, "");
  const url = `https://wa.me/${digits}`;
  if (!message) return url;
  return `${url}?text=${encodeURIComponent(message)}`;
}

export const whatsappPrefill =
  "Hi Beacon, I would like a free 20-minute audit.";
