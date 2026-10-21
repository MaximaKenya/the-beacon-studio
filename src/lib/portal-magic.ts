import { randomBytes } from "crypto";
import { renderBrandEmail, publicSiteUrl } from "@/lib/brand-email";
import { mutateJsonFile } from "@/lib/storage";

const FILE = "portal-magic.json";
const FIFTEEN_MIN = 15 * 60 * 1000;

export type PortalMagicLink = {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
};

export function applyMagicConsume(
  links: PortalMagicLink[],
  token: string,
  nowMs: number
): { links: PortalMagicLink[]; email: string | null } {
  const next = links.map((link) => ({ ...link }));
  const hit = next.find((link) => link.token === token);
  if (!hit || hit.usedAt || Date.parse(hit.expiresAt) <= nowMs) {
    return { links: next, email: null };
  }
  hit.usedAt = new Date(nowMs).toISOString();
  return { links: next, email: hit.email };
}

export async function issueMagicLink(email: string, nowMs = Date.now()): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const normalized = email.trim().toLowerCase();
  await mutateJsonFile<PortalMagicLink[]>(FILE, [], (links) => {
    const kept = links.filter((link) => link.usedAt || link.email !== normalized);
    kept.push({
      token,
      email: normalized,
      createdAt: new Date(nowMs).toISOString(),
      expiresAt: new Date(nowMs + FIFTEEN_MIN).toISOString(),
    });
    return kept.filter((link) => Date.parse(link.expiresAt) > nowMs - 24 * 60 * 60 * 1000);
  });
  return token;
}

export async function consumeMagicLink(token: string, nowMs = Date.now()): Promise<string | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;
  let email: string | null = null;
  await mutateJsonFile<PortalMagicLink[]>(FILE, [], (links) => {
    const result = applyMagicConsume(links, trimmed, nowMs);
    email = result.email;
    return result.links;
  });
  return email;
}

export function portalMagicUrl(token: string): string {
  return `${publicSiteUrl()}/api/portal/magic?token=${encodeURIComponent(token)}`;
}

export function composePortalSignIn(input: { email: string; code: string; magicUrl: string }): {
  html: string;
  text: string;
} {
  return renderBrandEmail({
    heading: "Your portal sign-in link",
    preview: "One link to open the client portal. A code is included if you need it.",
    greeting: "Hello,",
    paragraphs: [
      "Use the button to open your client portal. The link works once and expires in 15 minutes.",
      `If the link does not open, enter this code instead: ${input.code}. It is for ${input.email} and expires in 15 minutes.`,
    ],
    actions: [{ label: "Open the portal", href: input.magicUrl }],
  });
}
