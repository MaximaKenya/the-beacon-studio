/**
 * The Beacon Studio — brand communications kit.
 *
 * One source for every outbound touchpoint: the HTML email shell, per-mailbox
 * signatures, SMS and WhatsApp sign-offs, and the document letterhead.
 * Sister apps (ConfiRent, CadenceApp, LookFinesse, ConfiLearn, Convoria,
 * ConfiTrade) pass `appName` and get "ConfiRent by The Beacon Studio" with the
 * same layout. Automation messages to a client's own customers pass `client`
 * and carry the client's name with a small "Powered by The Beacon Studio" line.
 *
 * Pure functions only: no network, no env secrets. Safe in client and server.
 * Copy guide for other apps: docs/BRAND_COMMS.md.
 */
import { siteConfig } from "@/data/site";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

export const BRAND_NAME = "The Beacon Studio";
export const BRAND_DOMAIN = "thebeaconstudio.co.ke";
/** Canonical public origin. Logos in email are always hosted here (never the Heroku URL). */
export const BRAND_SITE_URL = "https://thebeaconstudio.co.ke";
export const BRAND_LOGO_URL = `${BRAND_SITE_URL}/email/beacon-mark.png`;

export const BRAND_COLORS = {
  /** Light mode accent (teal). */
  teal: "#0c6e64",
  tealSoft: "#e8f6f3",
  tealBright: "#7ee0d2",
  /** Dark mode accent (purple). */
  purple: "#241838",
  purpleDeep: "#140e24",
  purpleCard: "#2a1d42",
  lavender: "#c9bddc",
  ink: "#1b2a33",
  muted: "#5c6b73",
  pageLight: "#eef5f4",
  cardLight: "#ffffff",
} as const;

export const SISTER_APPS = ["ConfiRent", "CadenceApp", "LookFinesse", "ConfiLearn", "Convoria", "ConfiTrade"] as const;
export type SisterApp = (typeof SISTER_APPS)[number];

export type BrandMailbox = "hello" | "support" | "billing" | "admin";

export const MAILBOX_ROLES: Record<BrandMailbox, { title: string; useFor: string }> = {
  hello: { title: "Client Relations", useFor: "General questions, partnerships and demos." },
  support: { title: "Technical Support", useFor: "Technical help, automation issues and portal access." },
  billing: { title: "Billing & Accounts", useFor: "Invoices, payments, plans, trial and renewal questions." },
  admin: { title: "Accounts & Data Protection", useFor: "Account, security and data-protection (privacy/data) requests." },
};

export function brandMailboxAddress(id: BrandMailbox): string {
  return `${id}@${BRAND_DOMAIN}`;
}

/**
 * Contact details. Real values come from src/data/site.ts.
 * Placeholders stay config-driven (env) and are omitted when unset — see GO_LIVE.md.
 */
export type BrandContact = {
  phone: string;
  phoneDisplay: string;
  whatsappUrl: string;
  city: string;
  /** TODO(GO_LIVE): street/postal address. BRAND_POSTAL_ADDRESS env. Empty = city only. */
  postalAddress: string;
  /** TODO(GO_LIVE): company registration number. BRAND_REGISTRATION_NO env. */
  registrationNo: string;
  /** TODO(GO_LIVE): KRA PIN for invoices. BRAND_KRA_PIN env. */
  kraPin: string;
  /** TODO(GO_LIVE): LinkedIn URL. BRAND_LINKEDIN_URL env. site.ts value is a placeholder. */
  linkedinUrl: string;
  /** TODO(GO_LIVE): privacy policy page. BRAND_PRIVACY_URL env. Until set, links to an admin@ privacy request. */
  privacyUrl: string;
};

function isPlaceholder(value: string | undefined): boolean {
  return !value || /yourusername|example\.com|placeholder/i.test(value);
}

export function brandContact(env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {}): BrandContact {
  const digits = siteConfig.phone.replace(/\D/g, "");
  const linkedinSite = siteConfig.social.find((item) => item.icon === "linkedin")?.href;
  const linkedinEnv = env.NEXT_PUBLIC_BRAND_LINKEDIN_URL || env.BRAND_LINKEDIN_URL;
  return {
    phone: siteConfig.phone,
    phoneDisplay: siteConfig.phoneDisplay,
    whatsappUrl: `https://wa.me/${digits}`,
    city: siteConfig.location,
    postalAddress: (env.NEXT_PUBLIC_BRAND_POSTAL_ADDRESS || env.BRAND_POSTAL_ADDRESS || "").trim(),
    registrationNo: (env.NEXT_PUBLIC_BRAND_REGISTRATION_NO || env.BRAND_REGISTRATION_NO || "").trim(),
    kraPin: (env.NEXT_PUBLIC_BRAND_KRA_PIN || env.BRAND_KRA_PIN || "").trim(),
    privacyUrl: safeUrl(env.NEXT_PUBLIC_BRAND_PRIVACY_URL || env.BRAND_PRIVACY_URL) || `mailto:admin@${BRAND_DOMAIN}?subject=Privacy%20or%20data%20request`,
    linkedinUrl: !isPlaceholder(linkedinEnv) ? String(linkedinEnv) : !isPlaceholder(linkedinSite) ? String(linkedinSite) : "",
  };
}

/** "Nairobi, Kenya" or "<postal address>, Nairobi, Kenya". */
export function brandAddressLine(contact = brandContact()): string {
  return contact.postalAddress ? `${contact.postalAddress}, ${contact.city}` : contact.city;
}

/* ------------------------------------------------------------------ */
/* Co-branding                                                         */
/* ------------------------------------------------------------------ */

export type ClientBrand = {
  /** The client's business name (e.g. "Acme Dental"). */
  name: string;
  logoUrl?: string;
  /** Hex accent, e.g. "#1d4ed8". Falls back to the studio teal. */
  color?: string;
  email?: string;
  phone?: string;
};

export type CoBrand = {
  /** Sister app. Shows "ConfiRent by The Beacon Studio". */
  appName?: SisterApp | string;
  /** A client's own branding for messages to that client's customers. */
  client?: ClientBrand;
};

/** "The Beacon Studio", "ConfiRent by The Beacon Studio", or the client's name. */
export function brandDisplayName(co: CoBrand = {}): string {
  if (co.client?.name?.trim()) return co.client.name.trim();
  if (co.appName?.trim()) return `${co.appName.trim()} by ${BRAND_NAME}`;
  return BRAND_NAME;
}

export const POWERED_BY = `Powered by ${BRAND_NAME}`;

function safeColor(value: string | undefined, fallback: string): string {
  return value && /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim() : fallback;
}

function safeUrl(value: string | undefined): string {
  return value && /^https:\/\/[^\s"'<>]+$/i.test(value.trim()) ? value.trim() : "";
}

/** Client branding read from an automation's saved config (all optional). */
export function clientBrandFromConfig(businessName: string, config: Record<string, unknown> = {}): ClientBrand {
  const str = (key: string) => (typeof config[key] === "string" ? String(config[key]).trim() : "");
  return {
    name: str("brandName") || businessName,
    ...(safeUrl(str("brandLogoUrl")) ? { logoUrl: safeUrl(str("brandLogoUrl")) } : {}),
    ...(str("brandColor") ? { color: safeColor(str("brandColor"), BRAND_COLORS.teal) } : {}),
    ...(str("brandEmail") ? { email: str("brandEmail") } : {}),
    ...(str("brandPhone") ? { phone: str("brandPhone") } : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function esc(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(text: string): string {
  return esc(text).replace(/\n/g, "<br/>");
}

const FONT = "'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

/* ------------------------------------------------------------------ */
/* Signatures                                                          */
/* ------------------------------------------------------------------ */

export type SignatureOptions = CoBrand & {
  /** Optional person, e.g. "Max". Defaults to the team. */
  person?: string;
  contact?: BrandContact;
};

export function emailSignatureText(mailbox: BrandMailbox, opts: SignatureOptions = {}): string {
  const contact = opts.contact || brandContact();
  const role = MAILBOX_ROLES[mailbox];
  const who = opts.person?.trim() ? `${opts.person.trim()} · ${role.title}` : role.title;
  return [
    "--",
    who,
    brandDisplayName({ appName: opts.appName }),
    `${brandMailboxAddress(mailbox)} · ${contact.phoneDisplay}`,
    `WhatsApp: ${contact.whatsappUrl}`,
    `${BRAND_SITE_URL.replace("https://", "")} · ${brandAddressLine(contact)}`,
  ].join("\n");
}

export function emailSignatureHtml(mailbox: BrandMailbox, opts: SignatureOptions = {}): string {
  const contact = opts.contact || brandContact();
  const role = MAILBOX_ROLES[mailbox];
  const address = brandMailboxAddress(mailbox);
  const tel = contact.phone.replace(/\s+/g, "");
  const who = opts.person?.trim() ? `${esc(opts.person.trim())} · ${esc(role.title)}` : esc(role.title);
  const link = `color:${BRAND_COLORS.teal};text-decoration:none;`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" class="bc-sig" style="margin:18px 0 0;font-family:${FONT};">
  <tr>
    <td style="padding:0 14px 0 0;vertical-align:top;"><img src="${BRAND_LOGO_URL}" width="40" height="40" alt="${esc(BRAND_NAME)}" style="display:block;border:0;border-radius:12px;width:40px;height:40px;"></td>
    <td style="vertical-align:top;">
      <p class="bc-text" style="margin:0;font-size:14px;line-height:1.4;font-weight:700;color:${BRAND_COLORS.ink};">${who}</p>
      <p class="bc-muted" style="margin:2px 0 6px;font-size:13px;line-height:1.4;color:${BRAND_COLORS.muted};">${esc(brandDisplayName({ appName: opts.appName }))}</p>
      <p class="bc-muted" style="margin:0;font-size:12px;line-height:1.6;color:${BRAND_COLORS.muted};">
        <a href="mailto:${address}" class="bc-link" style="${link}">${address}</a> ·
        <a href="tel:${esc(tel)}" class="bc-link" style="${link}">${esc(contact.phoneDisplay)}</a> ·
        <a href="${esc(contact.whatsappUrl)}" class="bc-link" style="${link}">WhatsApp</a><br/>
        <a href="${BRAND_SITE_URL}" class="bc-link" style="${link}">${BRAND_DOMAIN}</a> · ${esc(brandAddressLine(contact))}
      </p>
    </td>
  </tr>
</table>`;
}

function signatureStart(text: string): number {
  const padded = `\n${text.replace(/\s+$/, "")}`;
  const index = padded.lastIndexOf("\n--\n");
  if (index < 0) return -1;
  const tail = padded.slice(index + 4);
  const lines = tail.split("\n");
  // A studio signature is the final short block naming the studio domain.
  if (lines.length > 7 || !/@thebeaconstudio\.co\.ke/i.test(tail) || /forwarded message/i.test(tail)) return -1;
  return Math.max(0, index - 1);
}

/** True when text ends with a studio signature block. */
export function hasSignature(text: string): boolean {
  return signatureStart(text) >= 0;
}

/** Remove a trailing studio signature, e.g. before swapping mailboxes in the composer. */
export function stripSignature(text: string): string {
  const start = signatureStart(text);
  return start < 0 ? text : text.slice(0, start).replace(/\s+$/, "");
}

/** Append (or swap) the mailbox signature. Idempotent. */
export function withSignature(text: string, mailbox: BrandMailbox, opts: SignatureOptions = {}): string {
  const body = stripSignature(text).replace(/\s+$/, "");
  return `${body}\n\n${emailSignatureText(mailbox, opts)}`;
}

/* ------------------------------------------------------------------ */
/* SMS + WhatsApp                                                       */
/* ------------------------------------------------------------------ */

const GSM7 =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM7_EXT = "^{}\\[~]|€";

export function isGsm7(text: string): boolean {
  for (const ch of text) if (!GSM7.includes(ch) && !GSM7_EXT.includes(ch)) return false;
  return true;
}

/** GSM-7 length (extension chars count twice). */
export function gsm7Length(text: string): number {
  let n = 0;
  for (const ch of text) n += GSM7_EXT.includes(ch) ? 2 : 1;
  return n;
}

/** Number of SMS parts the text needs (GSM-7: 160 / 153; UCS-2: 70 / 67). */
export function smsSegments(text: string): number {
  if (isGsm7(text)) {
    const len = gsm7Length(text);
    return len <= 160 ? 1 : Math.ceil(len / 153);
  }
  const len = text.length; // UTF-16 code units: emoji take 2
  return len <= 70 ? 1 : Math.ceil(len / 67);
}

export const SMS_SIGNOFF_MAX = 70;

/** Replace characters outside GSM-7 so a message stays cheap (e.g. curly quotes, en dash). */
export function toGsm7(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00b7/g, "-")
    .replace(/[^\n\r\x20-\x7e£¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ¤¡ÄÖÑÜ§¿äöñüà€]/g, "");
}

/**
 * Short SMS "regards" line, GSM-7 only, <= 70 chars.
 * Studio: "- The Beacon Studio, support@thebeaconstudio.co.ke".
 * Falls back to "- <name> +254706397373" when the mailbox does not fit.
 */
export function smsSignoff(opts: CoBrand & { mailbox?: BrandMailbox; contact?: BrandContact } = {}): string {
  const contact = opts.contact || brandContact();
  if (opts.client?.name) {
    const name = toGsm7(opts.client.name).slice(0, 30);
    const phone = opts.client.phone ? ` ${toGsm7(opts.client.phone)}` : "";
    return `- ${name}${phone}`.slice(0, SMS_SIGNOFF_MAX);
  }
  const name = opts.appName ? `${toGsm7(String(opts.appName))} by ${BRAND_NAME}` : BRAND_NAME;
  const withMail = `- ${name}, ${brandMailboxAddress(opts.mailbox || "support")}`;
  if (withMail.length <= SMS_SIGNOFF_MAX) return withMail;
  return `- ${name} ${contact.phone}`.slice(0, SMS_SIGNOFF_MAX);
}

/** Message + sign-off, kept GSM-7. Does not double-append. */
export function withSmsSignoff(message: string, opts: Parameters<typeof smsSignoff>[0] = {}): string {
  const signoff = smsSignoff(opts);
  const body = toGsm7(message).trim();
  if (body.endsWith(signoff)) return body;
  return `${body}\n${signoff}`;
}

/** WhatsApp regards block. Uses WhatsApp *bold* and _italic_ markers. */
export function whatsappSignoff(opts: CoBrand & { mailbox?: BrandMailbox; contact?: BrandContact } = {}): string {
  const contact = opts.contact || brandContact();
  if (opts.client?.name) {
    const lines = ["Regards,", `*${opts.client.name.trim()}*`];
    if (opts.client.phone) lines.push(`📞 ${opts.client.phone}`);
    if (opts.client.email) lines.push(`✉️ ${opts.client.email}`);
    lines.push(`_${POWERED_BY}_`);
    return lines.join("\n");
  }
  const mailbox = opts.mailbox || "support";
  return [
    "Regards,",
    `*${brandDisplayName({ appName: opts.appName })}*`,
    `📞 ${contact.phoneDisplay} (call or WhatsApp)`,
    `✉️ ${brandMailboxAddress(mailbox)}`,
    `🌐 ${BRAND_DOMAIN}`,
  ].join("\n");
}

export function withWhatsappSignoff(message: string, opts: Parameters<typeof whatsappSignoff>[0] = {}): string {
  const signoff = whatsappSignoff(opts);
  const body = message.trim();
  if (body.endsWith(signoff)) return body;
  return `${body}\n\n${signoff}`;
}

/* ------------------------------------------------------------------ */
/* Email shell                                                          */
/* ------------------------------------------------------------------ */

export type ShellAction = { label: string; href: string };
export type ShellRow = { label: string; value: string };

export type EmailShellInput = CoBrand & {
  heading: string;
  /** Inbox preview text (preheader). */
  preheader?: string;
  greeting?: string;
  paragraphs: string[];
  card?: ShellRow[];
  /** First action is the primary CTA button; the rest are secondary links. */
  actions?: ShellAction[];
  /** Mailbox signature appended under the body. */
  signature?: BrandMailbox;
  signaturePerson?: string;
  unsubscribeUrl?: string;
  unsubscribeNote?: string;
  /** Site origin for privacy and portal links. Defaults to BRAND_SITE_URL. */
  siteUrl?: string;
  contact?: BrandContact;
};

function ctaButton(action: ShellAction, color: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 12px;">
  <tr><td bgcolor="${color}" class="bc-btn" style="border-radius:14px;background:${color};">
    <a href="${esc(action.href)}" class="bc-btn-a" style="display:inline-block;padding:13px 22px;font-family:${FONT};font-size:15px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;border-radius:14px;">${esc(action.label)}</a>
  </td></tr>
</table>`;
}

function secondaryLink(action: ShellAction, color: string): string {
  return `<p style="margin:0 0 8px;font-family:${FONT};font-size:14px;line-height:1.5;"><a href="${esc(action.href)}" class="bc-link" style="color:${color};font-weight:600;text-decoration:none;">${esc(action.label)} &rarr;</a></p>`;
}

function rowsCard(rows: ShellRow[]): string {
  const body = rows
    .map(
      (row) => `<tr>
        <td class="bc-muted" style="padding:7px 12px 7px 0;font-family:${FONT};font-size:13px;line-height:1.4;color:${BRAND_COLORS.muted};vertical-align:top;width:130px;">${esc(row.label)}</td>
        <td class="bc-text" style="padding:7px 0;font-family:${FONT};font-size:15px;line-height:1.45;color:${BRAND_COLORS.ink};">${esc(row.value)}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bc-soft" style="margin:6px 0 20px;background:${BRAND_COLORS.tealSoft};border-radius:18px;">
  <tr><td style="padding:10px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${body}</table></td></tr>
</table>`;
}

/**
 * Responsive, table-based, inline-CSS email. Light = teal on frosted white,
 * dark (Apple Mail, Outlook.com, Gmail apps that honour prefers-color-scheme) = purple.
 * No outlines or borders; soft cards only.
 */
export function renderEmailShell(input: EmailShellInput): { html: string; text: string } {
  const contact = input.contact || brandContact();
  const client = input.client?.name ? input.client : undefined;
  const accent = safeColor(client?.color, BRAND_COLORS.teal);
  const display = brandDisplayName(input);
  const logo = client ? safeUrl(client.logoUrl) : BRAND_LOGO_URL;
  const preheader = input.preheader || input.heading;
  const paragraphs = input.paragraphs.filter((item) => item && item.trim());
  const actions = input.actions || [];
  const [primary, ...rest] = actions;
  const greeting = input.greeting ?? "Hello,";
  const tel = contact.phone.replace(/\s+/g, "");
  const privacy = contact.privacyUrl;
  const link = `color:${accent};text-decoration:none;`;

  const htmlParagraphs = paragraphs
    .map((item) => `<p class="bc-text" style="margin:0 0 14px;font-family:${FONT};font-size:16px;line-height:1.65;color:${BRAND_COLORS.ink};">${nl2br(item)}</p>`)
    .join("");

  const signatureHtml = input.signature ? emailSignatureHtml(input.signature, { appName: input.appName, person: input.signaturePerson, contact }) : "";
  const unsubscribe = input.unsubscribeUrl
    ? `<a href="${esc(input.unsubscribeUrl)}" class="bc-link" style="${link}">Unsubscribe</a> ${esc(input.unsubscribeNote || "from these emails.")} · `
    : "";

  const footer = client
    ? `<p style="margin:0;">${esc(client.name)}${client.email ? ` · <a href="mailto:${esc(client.email)}" class="bc-link" style="${link}">${esc(client.email)}</a>` : ""}${client.phone ? ` · ${esc(client.phone)}` : ""}</p>
       <p style="margin:8px 0 0;">${unsubscribe}<a href="${BRAND_SITE_URL}" class="bc-link" style="color:${BRAND_COLORS.muted};text-decoration:none;font-size:11px;">${esc(POWERED_BY)}</a></p>`
    : `<p style="margin:0;font-weight:700;" class="bc-text">${esc(display)}</p>
       <p style="margin:4px 0 0;">${esc(brandAddressLine(contact))}</p>
       <p style="margin:4px 0 0;"><a href="tel:${esc(tel)}" class="bc-link" style="${link}">${esc(contact.phoneDisplay)}</a> · <a href="${esc(contact.whatsappUrl)}" class="bc-link" style="${link}">WhatsApp</a> · <a href="mailto:${brandMailboxAddress("hello")}" class="bc-link" style="${link}">${brandMailboxAddress("hello")}</a></p>
       <p style="margin:4px 0 0;">Help: <a href="mailto:${brandMailboxAddress("support")}" class="bc-link" style="${link}">${brandMailboxAddress("support")}</a> · Billing: <a href="mailto:${brandMailboxAddress("billing")}" class="bc-link" style="${link}">${brandMailboxAddress("billing")}</a></p>
       <p style="margin:10px 0 0;">${unsubscribe}<a href="${esc(privacy)}" class="bc-link" style="${link}">Privacy</a>${contact.linkedinUrl ? ` · <a href="${esc(contact.linkedinUrl)}" class="bc-link" style="${link}">LinkedIn</a>` : ""}${contact.registrationNo ? ` · Reg. ${esc(contact.registrationNo)}` : ""}</p>`;

  const header = logo
    ? `<img src="${esc(logo)}" width="44" height="44" alt="${esc(display)}" style="display:block;border:0;border-radius:13px;width:44px;height:44px;">`
    : `<div style="width:44px;height:44px;border-radius:13px;background:${accent};color:#fff;font-family:${FONT};font-size:20px;font-weight:700;line-height:44px;text-align:center;">${esc((client?.name || "B").slice(0, 1).toUpperCase())}</div>`;

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(input.heading)}</title>
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
  a { text-decoration:none; }
  @media (max-width:600px) { .bc-pad { padding-left:20px !important; padding-right:20px !important; } .bc-h1 { font-size:22px !important; } }
  @media (prefers-color-scheme: dark) {
    body, .bc-bg { background:${BRAND_COLORS.purpleDeep} !important; }
    .bc-card { background:${BRAND_COLORS.purpleCard} !important; }
    .bc-head { background:${BRAND_COLORS.purple} !important; }
    .bc-soft { background:#35264f !important; }
    .bc-text, .bc-text p { color:#f6f1ff !important; }
    .bc-muted { color:${BRAND_COLORS.lavender} !important; }
    .bc-link { color:${client ? "#e6dcff" : BRAND_COLORS.tealBright} !important; }
    .bc-btn { background:${client ? accent : "#7c5cd6"} !important; }
  }
  [data-ogsc] .bc-bg { background:${BRAND_COLORS.purpleDeep} !important; }
  [data-ogsc] .bc-card { background:${BRAND_COLORS.purpleCard} !important; }
  [data-ogsc] .bc-text { color:#f6f1ff !important; }
</style>
</head>
<body class="bc-bg" style="margin:0;padding:0;background:${BRAND_COLORS.pageLight};">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bc-bg" style="background:${BRAND_COLORS.pageLight};padding:28px 10px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bc-card" style="max-width:580px;background:${BRAND_COLORS.cardLight};border-radius:26px;box-shadow:0 18px 48px rgba(12,110,100,0.10);">
    <tr><td class="bc-head bc-pad" bgcolor="${BRAND_COLORS.purple}" style="background:${BRAND_COLORS.purple};padding:24px 32px;border-radius:26px 26px 0 0;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:middle;padding-right:12px;">${header}</td>
        <td style="vertical-align:middle;font-family:${FONT};font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#9ef0e4;font-weight:700;">${esc(display)}</td>
      </tr></table>
      <h1 class="bc-h1" style="margin:16px 0 0;font-family:${SERIF};font-size:26px;line-height:1.3;font-weight:600;color:#ffffff;">${esc(input.heading)}</h1>
    </td></tr>
    <tr><td class="bc-pad" style="padding:28px 32px 8px;">
      ${greeting ? `<p class="bc-text" style="margin:0 0 14px;font-family:${FONT};font-size:16px;line-height:1.6;color:${BRAND_COLORS.ink};">${esc(greeting)}</p>` : ""}
      ${htmlParagraphs}
      ${input.card?.length ? rowsCard(input.card) : ""}
      ${primary ? ctaButton(primary, accent) : ""}
      ${rest.map((item) => secondaryLink(item, accent)).join("")}
      ${signatureHtml}
    </td></tr>
    <tr><td class="bc-muted bc-pad" style="padding:18px 32px 28px;font-family:${FONT};font-size:12px;line-height:1.6;color:${BRAND_COLORS.muted};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bc-soft" style="background:${BRAND_COLORS.tealSoft};border-radius:18px;"><tr><td class="bc-muted" style="padding:14px 18px;font-family:${FONT};font-size:12px;line-height:1.6;color:${BRAND_COLORS.muted};">
      ${footer}
      </td></tr></table>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    input.heading,
    "",
    greeting,
    "",
    ...paragraphs.flatMap((item) => [item, ""]),
    ...(input.card || []).map((row) => `${row.label}: ${row.value}`),
    ...(input.card?.length ? [""] : []),
    ...actions.map((action) => `${action.label}: ${action.href}`),
    ...(actions.length ? [""] : []),
    ...(input.signature ? [emailSignatureText(input.signature, { appName: input.appName, person: input.signaturePerson, contact }), ""] : []),
    ...(client
      ? [client.name, client.email || "", client.phone || "", POWERED_BY]
      : [display, brandAddressLine(contact), `${contact.phoneDisplay} · WhatsApp ${contact.whatsappUrl}`, brandMailboxAddress("hello"), `Privacy: ${privacy}`]),
    input.unsubscribeUrl ? `Unsubscribe: ${input.unsubscribeUrl}` : "",
  ]
    .filter((line, index, all) => line !== "" || (index > 0 && all[index - 1] !== ""))
    .join("\n")
    .trim();

  return { html, text };
}

/* ------------------------------------------------------------------ */
/* Welcome email                                                        */
/* ------------------------------------------------------------------ */

export const WELCOME_TRIAL_DAYS = 30;

export function welcomeEmail(input: CoBrand & {
  name?: string;
  businessName?: string;
  trialDays?: number;
  daysLeft?: number;
  included?: string[];
  siteUrl?: string;
  unsubscribeUrl?: string;
}): { subject: string; html: string; text: string } {
  const site = (input.siteUrl || BRAND_SITE_URL).replace(/\/$/, "");
  const total = input.trialDays ?? WELCOME_TRIAL_DAYS;
  const left = Math.max(0, Math.min(total, input.daysLeft ?? total));
  const display = brandDisplayName({ appName: input.appName });
  const first = input.name?.trim().split(/\s+/)[0];
  const subject = `Welcome to ${display} · ${left} of ${total} trial days left`;
  const mail = renderEmailShell({
    appName: input.appName,
    heading: `Welcome${first ? `, ${first}` : ""}. Your ${total}-day trial is on.`,
    preheader: `${left} days free, no card needed. Here is who to email for what.`,
    greeting: first ? `Hi ${first},` : "Hello,",
    paragraphs: [
      `${input.businessName ? `${input.businessName} is now set up on ${display}. ` : ""}You have ${left} of ${total} free days left. No card is needed, and nothing is charged when the trial ends.`,
      ...(input.included?.length ? [`Included: ${input.included.join(", ")}.`] : []),
      "Getting started:\n1. Open your portal and fill in each automation's settings.\n2. Add your customer list or connect your form.\n3. Run a test, check the preview, then switch it on.",
      "Which address to use:",
    ],
    card: (Object.keys(MAILBOX_ROLES) as BrandMailbox[]).map((id) => ({ label: brandMailboxAddress(id), value: MAILBOX_ROLES[id].useFor })),
    actions: [
      { label: "Open your portal", href: `${site}/portal` },
      { label: "See how it works", href: `${site}/how-it-works` },
    ],
    signature: "hello",
    siteUrl: site,
    ...(input.unsubscribeUrl ? { unsubscribeUrl: input.unsubscribeUrl, unsubscribeNote: "from trial tips. Reminders and receipts still arrive." } : {}),
  });
  return { subject, ...mail };
}

/* ------------------------------------------------------------------ */
/* Letterhead                                                           */
/* ------------------------------------------------------------------ */

export type LetterheadInput = CoBrand & {
  title: string;
  /** Pre-escaped HTML body. */
  bodyHtml: string;
  reference?: string;
  date?: string;
  preparedBy?: string;
  preparedFor?: string;
  contact?: BrandContact;
  /** Optional screen-only toolbar (hidden in print), e.g. Download / Print buttons. */
  toolbarHtml?: string;
  /** Optional trailing HTML, e.g. a small script. */
  tailHtml?: string;
  /** Logo src override (e.g. a relative path when served from the same origin). */
  logoSrc?: string;
};

/** Text lines for PDF generators (jspdf etc.). */
export function letterheadLines(opts: CoBrand & { contact?: BrandContact } = {}) {
  const contact = opts.contact || brandContact();
  return {
    name: brandDisplayName(opts),
    logoUrl: BRAND_LOGO_URL,
    contactStrip: `${brandMailboxAddress("hello")}  ·  ${contact.phoneDisplay}  ·  ${BRAND_DOMAIN}  ·  ${brandAddressLine(contact)}`,
    registration: contact.registrationNo ? `Reg. No. ${contact.registrationNo}` : "Reg. No. pending",
    kraPin: contact.kraPin ? `KRA PIN ${contact.kraPin}` : "",
    footer: (page: number, pages: number) => `${BRAND_NAME} · ${contact.registrationNo ? `Reg. No. ${contact.registrationNo} · ` : ""}Page ${page} of ${pages}`,
  };
}

/** Full A4 print-ready HTML document with the studio letterhead. */
export function renderLetterhead(input: LetterheadInput): string {
  const contact = input.contact || brandContact();
  const lines = letterheadLines({ ...input, contact });
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(input.title)} · ${esc(lines.name)}</title>
<style>
  @page { size: A4; margin: 22mm 18mm 24mm; @bottom-center { content: "${esc(BRAND_NAME)} · Page " counter(page) " of " counter(pages); font: 9px ${FONT}; color: ${BRAND_COLORS.muted}; } }
  :root { --accent: ${BRAND_COLORS.teal}; --ink: ${BRAND_COLORS.ink}; --muted: ${BRAND_COLORS.muted}; --soft: ${BRAND_COLORS.tealSoft}; --page: ${BRAND_COLORS.pageLight}; --card: #fff; }
  @media (prefers-color-scheme: dark) { :root { --accent: #b9a3ff; --ink: #f6f1ff; --muted: ${BRAND_COLORS.lavender}; --soft: #35264f; --page: ${BRAND_COLORS.purpleDeep}; --card: ${BRAND_COLORS.purpleCard}; } }
  @media print { :root { --accent: ${BRAND_COLORS.teal}; --ink: #111; --muted: #555; --soft: ${BRAND_COLORS.tealSoft}; --page: #fff; --card: #fff; } .lh-sheet { box-shadow:none !important; margin:0 !important; } }
  html, body { margin:0; background:var(--page); color:var(--ink); font-family:${FONT}; }
  .lh-sheet { max-width: 794px; margin: 28px auto; background:var(--card); border-radius:26px; padding:36px 44px 28px; box-shadow:0 18px 50px rgba(12,110,100,.10); }
  .lh-head { display:flex; align-items:center; gap:16px; }
  .lh-head img { width:52px; height:52px; border-radius:15px; }
  .lh-name { font-family:${SERIF}; font-size:22px; font-weight:600; margin:0; }
  .lh-kicker { font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--accent); font-weight:700; margin:2px 0 0; }
  .lh-strip { margin:18px 0 26px; padding:10px 16px; border-radius:16px; background:var(--soft); font-size:12px; color:var(--muted); }
  .lh-meta { display:flex; justify-content:space-between; gap:18px; font-size:13px; color:var(--muted); margin-bottom:18px; }
  .lh-title { font-family:${SERIF}; font-size:26px; margin:0 0 16px; }
  .lh-body { font-size:14px; line-height:1.65; }
  .lh-body table { width:100%; border-collapse:collapse; }
  .lh-body td, .lh-body th { padding:9px 4px; text-align:left; }
  .lh-body tr:nth-child(even) td { background:var(--soft); }
  .lh-sign { margin-top:30px; font-size:13px; color:var(--muted); }
  .lh-foot { margin-top:34px; padding-top:12px; font-size:10.5px; color:var(--muted); display:flex; justify-content:space-between; gap:12px; border-radius:14px; background:var(--soft); padding:10px 16px; }
  .lh-page::after { content: "Page " counter(page); }
  .lh-tools { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 18px; }
  .lh-tools a, .lh-tools button { border:0; border-radius:999px; padding:10px 16px; background:var(--accent); color:#fff; font:700 13px ${FONT}; text-decoration:none; cursor:pointer; }
  @media print { .lh-tools { display:none; } }
</style></head>
<body><div class="lh-sheet">
  <header class="lh-head">
    <img src="${esc(input.logoSrc || BRAND_LOGO_URL)}" alt="${esc(BRAND_NAME)} lighthouse">
    <div><p class="lh-name">${esc(lines.name)}</p><p class="lh-kicker">${esc(siteConfig.brand.lockup || "products and custom software")}</p></div>
  </header>
  <div class="lh-strip">${esc(lines.contactStrip)}</div>
  ${input.toolbarHtml ? `<div class="lh-tools">${input.toolbarHtml}</div>` : ""}
  <div class="lh-meta">
    <div>${input.preparedFor ? `Prepared for<br/><strong style="color:var(--ink)">${esc(input.preparedFor)}</strong>` : ""}</div>
    <div style="text-align:right">${input.reference ? `Ref. ${esc(input.reference)}<br/>` : ""}${esc(input.date || new Date().toISOString().slice(0, 10))}</div>
  </div>
  <h1 class="lh-title">${esc(input.title)}</h1>
  <main class="lh-body">${input.bodyHtml}</main>
  <p class="lh-sign">Prepared by<br/><strong style="color:var(--ink)">${esc(input.preparedBy || `${BRAND_NAME} team`)}</strong></p>
  <footer class="lh-foot"><span>${esc(lines.registration)}${lines.kraPin ? ` · ${esc(lines.kraPin)}` : ""} · ${esc(brandAddressLine(contact))}</span><span>${input.client?.name ? esc(POWERED_BY) : esc(BRAND_DOMAIN)} · <span class="lh-page"></span></span></footer>
</div>${input.tailHtml || ""}</body></html>`;
}
