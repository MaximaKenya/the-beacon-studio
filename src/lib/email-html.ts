import { siteConfig } from "@/data/site";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Plain text for display. Inbound HTML is never rendered. */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function textToHtml(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br/>");
}

export function brandedEmail(opts: { heading: string; greeting: string; bodyText: string }): {
  html: string;
  text: string;
} {
  const name = siteConfig.brand.name;
  const phone = siteConfig.phoneDisplay;
  const tel = siteConfig.phone.replace(/\s+/g, "");
  const wa = `https://wa.me/${siteConfig.phone.replace(/\D/g, "")}`;
  const text = `${opts.greeting}\n\n${opts.bodyText}\n\n— ${name}\n${phone}\nWhatsApp: ${wa}`;
  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Georgia,serif;color:#1b2a33;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;">
        <tr><td style="background:#0c6e64;padding:22px 28px;">
          <p style="margin:0;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#d7f3ee;">${escapeHtml(name)}</p>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:600;color:#ffffff;">${escapeHtml(opts.heading)}</h1>
        </td></tr>
        <tr><td style="padding:28px;font-size:16px;line-height:1.6;color:#1b2a33;">
          <p style="margin:0 0 16px;">${escapeHtml(opts.greeting)}</p>
          <div style="margin:0;">${textToHtml(opts.bodyText)}</div>
        </td></tr>
        <tr><td style="padding:0 28px 28px;font-size:13px;line-height:1.5;color:#5c6b73;">
          <p style="margin:0;">${escapeHtml(name)} · Nairobi</p>
          <p style="margin:6px 0 0;"><a href="tel:${escapeHtml(tel)}" style="color:#0c6e64;text-decoration:none;">${escapeHtml(phone)}</a>
            · <a href="${escapeHtml(wa)}" style="color:#0c6e64;text-decoration:none;">WhatsApp</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  return { html, text };
}
