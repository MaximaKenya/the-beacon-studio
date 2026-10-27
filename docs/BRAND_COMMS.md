# Branded communications

All outbound comms come from one module: `src/lib/brand-comms.ts`. You can preview it at **/admin/brand-preview**, which is admin only.

## Brand rules
- Use the full name **The Beacon Studio** and the lighthouse mark (`public/email/beacon-mark.png`).
- Teal in light mode and purple in dark mode (`prefers-color-scheme`). Use frosted soft cards and shadows, with no outlines.
- Contact details come from `src/data/site.ts`: phone 0706 397 373, WhatsApp wa.me/254706397373, plus the mailboxes below.
- Placeholders are config-driven (`BRAND_POSTAL_ADDRESS`, `BRAND_REGISTRATION_NO`, `BRAND_KRA_PIN`, `BRAND_LINKEDIN_URL`, `BRAND_PRIVACY_URL`). An unset value is hidden, never invented. See GO_LIVE.md.

## Mailboxes
| Mailbox | Use for |
|---|---|
| hello@ | General questions, partnerships, demos |
| support@ | Technical help, automation issues, portal access |
| billing@ | Invoices, payments, plans, trial and renewal questions |
| admin@ | Account, security, data-protection requests |

## API
| Need | Function |
|---|---|
| Any email | `renderEmailShell({heading, preheader, paragraphs, card, actions, signature, appName, client})` returns `{html, text}`. Inside this app, use `renderBrandEmail` (`src/lib/brand-email.ts`). |
| Signature | `emailSignatureHtml(mailbox)`, `emailSignatureText(mailbox)`, `withSignature(text, mailbox)` |
| SMS | `withSmsSignoff(text, opts)`: GSM-7 only, sign-off of 70 characters or fewer, `smsSegments()` for part counts |
| WhatsApp | `withWhatsappSignoff(text, opts)` adds a "Regards," block with `*bold*` name, phone, email and site |
| Letterhead | `renderLetterhead({title, bodyHtml, reference, preparedFor, preparedBy})` gives A4 print HTML. `letterheadLines()` serves jsPDF. |
| Welcome | `welcomeEmail({...})`. `sendTrialWelcome` sends it once per signup (`trial.welcomed` flag + Resend idempotency key). |

## Co-branding
- **Sister apps:** pass `appName` (ConfiRent, CadenceApp, LookFinesse, ConfiLearn, Convoria, ConfiTrade). This renders "ConfiRent by The Beacon Studio".
- **A client's customers:** pass `client` (from `clientBrandFromConfig(businessName, instance.config)`, with optional `brandName`, `brandLogoUrl`, `brandColor`, `brandEmail` and `brandPhone`). The client's brand leads, with a small "Powered by The Beacon Studio" line.

## Where it is applied
- **All `renderBrandEmail` and `brandedEmail` callers:** bookings, portal magic links, ROI, lifecycle/trial and automations.
- **Lead and contact alerts.**
- **Admin Mail tab:** the signature is added by default, stays editable, and swaps when the From mailbox changes.
- **Invoice, quote and receipt HTML/PDFs:** letterhead, contact strip, "Prepared by", and page X of Y.
- **Automation SMS and WhatsApp:** the client sign-off.

## Sister apps
Copy `brand-comms.ts`; its only import is `siteConfig` (phone, email, social) from `src/data/site.ts`, so swap that for the app's own config or inline the values. Then set `appName`. Offline copies live in `/workspace/Brand-Kit/` on the build box.
