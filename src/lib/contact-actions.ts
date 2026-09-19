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
