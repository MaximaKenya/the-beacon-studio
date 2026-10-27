import { siteConfig } from "@/data/site";
import { renderEmailShell, type BrandMailbox, type CoBrand } from "@/lib/brand-comms";

export type BrandEmailAction = { label: string; href: string };
export type BrandEmailRow = { label: string; value: string };

export type BrandEmailInput = CoBrand & {
  heading: string;
  preview?: string;
  greeting: string;
  paragraphs: string[];
  card?: BrandEmailRow[];
  actions?: BrandEmailAction[];
  unsubscribeUrl?: string;
  /** Text after the Unsubscribe link. Defaults to the booking follow-up line. */
  unsubscribeNote?: string;
  /** Append the HTML + text signature for this mailbox. */
  signature?: BrandMailbox;
};

export function publicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.seo.siteUrl).replace(/\/$/, "");
}

/**
 * Every studio email goes through the brand-comms shell (src/lib/brand-comms.ts):
 * responsive, inline CSS, dark-mode purple / light-mode teal, hosted logo, preheader,
 * CTA button, and a footer with address, contact, unsubscribe and privacy links.
 */
export function renderBrandEmail(input: BrandEmailInput): { html: string; text: string } {
  return renderEmailShell({
    heading: input.heading,
    preheader: input.preview || input.heading,
    greeting: input.greeting,
    paragraphs: input.paragraphs,
    ...(input.card ? { card: input.card } : {}),
    ...(input.actions ? { actions: input.actions } : {}),
    ...(input.unsubscribeUrl ? { unsubscribeUrl: input.unsubscribeUrl, unsubscribeNote: input.unsubscribeNote || "from follow-ups about this call." } : {}),
    ...(input.signature ? { signature: input.signature } : {}),
    ...(input.appName ? { appName: input.appName } : {}),
    ...(input.client ? { client: input.client } : {}),
    siteUrl: publicSiteUrl(),
  });
}
