import { siteConfig } from "@/data/site";
import { escapeHtml, textToHtml } from "@/lib/email-html";

export type BrandEmailAction = { label: string; href: string };
export type BrandEmailRow = { label: string; value: string };

export type BrandEmailInput = {
  heading: string;
  preview?: string;
  greeting: string;
  paragraphs: string[];
  card?: BrandEmailRow[];
  actions?: BrandEmailAction[];
  unsubscribeUrl?: string;
  /** Text after the Unsubscribe link. Defaults to the booking follow-up line. */
  unsubscribeNote?: string;
};

export function publicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || siteConfig.seo.siteUrl).replace(/\/$/, "");
}

function button(action: BrandEmailAction): string {
  const href = escapeHtml(action.href);
  const label = escapeHtml(action.label);
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 10px;">
    <tr><td bgcolor="#0c6e64" style="border-radius:12px;background:#0c6e64;">
      <a href="${href}" style="display:inline-block;padding:12px 18px;font-family:Georgia,serif;font-size:15px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;">${label}</a>
    </td></tr>
  </table>`;
}

function cardTable(rows: BrandEmailRow[]): string {
  const body = rows
    .map(
      (row) => `<tr>
        <td class="email-muted" style="padding:8px 12px 8px 0;font-size:13px;line-height:1.4;color:#5c6b73;vertical-align:top;width:132px;">${escapeHtml(row.label)}</td>
        <td class="email-text" style="padding:8px 0;font-size:15px;line-height:1.45;color:#1b2a33;">${escapeHtml(row.value)}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-card" style="margin:8px 0 20px;background:#f7fffe;border-radius:16px;">
    <tr><td style="padding:8px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${body}</table>
    </td></tr>
  </table>`;
}

/**
 * One table-based letter for every client email.
 * Inline styles cover Outlook. The dark-mode block covers Apple Mail and Gmail.
 */
export function renderBrandEmail(input: BrandEmailInput): { html: string; text: string } {
  const origin = publicSiteUrl();
  const name = siteConfig.brand.name;
  const phone = siteConfig.phoneDisplay;
  const tel = siteConfig.phone.replace(/\s+/g, "");
  const wa = `https://wa.me/${siteConfig.phone.replace(/\D/g, "")}`;
  const logo = `${origin}/email/beacon-mark.png`;
  const preview = input.preview || input.heading;
  const paragraphs = input.paragraphs.filter((item) => item.trim());
  const htmlParagraphs = paragraphs
    .map((item) => `<p class="email-text" style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#1b2a33;">${textToHtml(item)}</p>`)
    .join("");
  const actions = (input.actions || []).map(button).join("");
  const card = input.card?.length ? cardTable(input.card) : "";
  const unsubNote = input.unsubscribeNote || "from follow-ups about this call.";
  const unsub = input.unsubscribeUrl
    ? `<p class="email-muted" style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#5c6b73;"><a href="${escapeHtml(input.unsubscribeUrl)}" class="email-link" style="color:#0c6e64;">Unsubscribe</a> ${escapeHtml(unsubNote)}</p>`
    : "";
  const text = [
    preview,
    "",
    input.greeting,
    "",
    ...paragraphs,
    "",
    ...(input.card || []).map((row) => `${row.label}: ${row.value}`),
    "",
    ...(input.actions || []).map((action) => `${action.label}: ${action.href}`),
    "",
    name,
    siteConfig.location,
    phone,
    siteConfig.email,
    `WhatsApp: ${wa}`,
    input.unsubscribeUrl ? `Unsubscribe: ${input.unsubscribeUrl}` : "",
  ]
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n")
    .trim();

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(input.heading)}</title>
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body, .email-bg { background:#f3f7f6; }
    .email-card { background:#ffffff; }
    @media (prefers-color-scheme: dark) {
      body, .email-bg { background:#140e24 !important; }
      .email-card { background:#241838 !important; }
      .email-header { background:#1a1030 !important; }
      .email-text, .email-text p { color:#f6f1ff !important; }
      .email-muted { color:#c9bddc !important; }
      .email-link { color:#7ee0d2 !important; }
    }
  </style>
</head>
<body class="email-bg" style="margin:0;padding:0;background:#f3f7f6;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preview)}&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-bg" style="background:#f3f7f6;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-card" style="max-width:560px;background:#ffffff;border-radius:22px;">
        <tr><td class="email-header" bgcolor="#241838" style="background:#241838;padding:22px 28px;border-radius:22px 22px 0 0;">
          <img src="${escapeHtml(logo)}" width="48" height="48" alt="${escapeHtml(name)}" style="display:block;border:0;border-radius:12px;width:48px;height:48px;">
          <p style="margin:12px 0 0;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#9ef0e4;">${escapeHtml(name)}</p>
          <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-size:24px;line-height:1.3;font-weight:600;color:#ffffff;">${escapeHtml(input.heading)}</h1>
        </td></tr>
        <tr><td style="padding:28px 28px 8px;font-family:Georgia,serif;">
          <p class="email-text" style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#1b2a33;">${escapeHtml(input.greeting)}</p>
          ${htmlParagraphs}
          ${card}
          ${actions}
        </td></tr>
        <tr><td class="email-muted" style="padding:8px 28px 28px;font-family:Georgia,serif;font-size:13px;line-height:1.5;color:#5c6b73;">
          <p style="margin:0;">${escapeHtml(name)}</p>
          <p style="margin:6px 0 0;">${escapeHtml(siteConfig.location)}</p>
          <p style="margin:6px 0 0;"><a href="tel:${escapeHtml(tel)}" class="email-link" style="color:#0c6e64;text-decoration:none;">${escapeHtml(phone)}</a>
            · <a href="${escapeHtml(wa)}" class="email-link" style="color:#0c6e64;text-decoration:none;">WhatsApp</a>
            · <a href="mailto:${escapeHtml(siteConfig.email)}" class="email-link" style="color:#0c6e64;text-decoration:none;">${escapeHtml(siteConfig.email)}</a></p>
          ${unsub}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  return { html, text };
}
