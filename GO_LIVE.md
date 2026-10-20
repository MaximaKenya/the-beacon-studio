# Go-live checklist — The Beacon Studio

What must be true before calling the site live for clients. Full setup: `INTEGRATIONS.md`, `DEPLOYMENT.md`.

**Live today:** https://the-beacon-studio-0def818a6eaf.herokuapp.com/

## Required for an honest public launch

| Item | Where | Notes |
|---|---|---|
| Real studio email | `src/data/site.ts` | Phone is set. Email is still `hello@example.com` |
| LinkedIn (and Twitter if used) | `site.ts` social / SEO | Still `yourusername` placeholders |
| `seo.siteUrl` + custom domain | `site.ts` + DNS → Heroku | Defaults to Heroku app URL until domain is ready |
| `ADMIN_PASSWORD` | Heroku config vars | **Required** — missing on Heroku today |
| `PORTAL_SECRET` | Heroku config vars | Missing; falls back to admin password in local/dev only |
| Founder intro video | `site.ts` meet-me embed | Still a placeholder. Not shown on the homepage. |

## Optional but recommended (graceful fallbacks without keys)

| Integration | Env vars | Without it |
|---|---|---|
| **Resend** (mailbox, form confirmations, portal OTP, inbox replies) | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO`, `RESEND_WEBHOOK_SECRET` | Forms still save. Admin mailbox shows **Email not configured**. No confirmation email |
| **Paystack** (primary deposits) | `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, optional `PAYSTACK_USD_KES_RATE` | Checkout explains Paystack is not configured. Bank transfer / invoice still works |
| **Stripe** (hidden unless configured) | `STRIPE_SECRET_KEY` (+ optional Price IDs / publishable key) | Button is not shown |
| **M-Pesa Daraja** (hidden unless configured) | `MPESA_*` | Button is not shown. Paystack KES still covers M-Pesa when Paystack is live |
| **OpenAI** (Glow + brief helper) | `OPENAI_API_KEY` | On-site knowledge base only |
| Stripe webhook / M-Pesa callback | Point at your domain `/api/payments/...` | Needed once keys are live |

## Product suite

Public products are only these four. TriviaYard and ConfiTrade are not listed, linked, or described on the site.

| Product | Public link | Status |
|---|---|---|
| ConfiRent | https://www.confirent.co.ke | Live (soft launch) |
| CadenceApp | https://www.cadenceapp.co.ke | Beta / early access |
| LookFinesse | No live URL and no public repo | Coming soon — Get notified / contact |
| ConfiLearn | No live URL and no public repo | Coming soon — Get notified / contact |

Do not publish private repository URLs. The old LookFinesse and TriviaYard Heroku URLs are not used.

## Platform / ops

- **Durable storage:** set `DATABASE_URL` (see below). Without it, `data/*.json` lives on the dyno disk and Heroku wipes it on restart. Set the Resend vars below so each form gets a mailbox thread and a branded confirmation.
- **Admin:** `https://YOUR_APP/admin` (not linked in the public menu). Log in with `ADMIN_PASSWORD`. Mailbox is the email tab. Inbox is leads, bookings, and portal messages. Also set `PORTAL_SECRET` in production so portal sessions are not signed with the admin password. Reviews stay private until you approve them in the inbox.
- **Node 22.x:** `package.json` engines pin `22.x`.
- **OG / favicon:** confirm share preview and beacon mark.

## Durable storage (Postgres)

Contacts, intakes, bookings, projects, messages, reviews, portal threads, payments, subscribers, quotations, receipts, portal codes, analytics, and the mailbox (`mailbox.json`) all go through `src/lib/storage.ts`. When `DATABASE_URL` is set they are stored in Postgres. When it is unset (local dev) the same API keeps using `data/*.json`.

Neon free tier is the target. Use the **pooled** connection string (hostname contains `-pooler`) and leave `sslmode=require`. The app opens TLS for every non-local host and verifies Neon’s public certificate. The Node 22 dyno keeps a small client pool (`PG_POOL_MAX`, default 5) in front of that pooler.

Tables are created automatically (`app_documents`, one `json` document per filename) on startup and on first use. The statement is idempotent.

```bash
# Neon → Connect → pooled connection string
heroku config:set DATABASE_URL="postgresql://USER:PASSWORD@ep-….pooler.region.aws.neon.tech/neondb?sslmode=require"

# One-time import of whatever data/*.json is on this machine (re-runnable)
DATABASE_URL="postgresql://…" npm run db:migrate-files
```

Run the import from a checkout or one-off dyno that still has the JSON you want to keep. It upserts each file by name.

Check the backend:

- `GET /api/health` → `{ "ok": true, "storage": "postgres", "database": "up" }` (503 when Postgres is configured but unreachable; `"storage": "file"` when `DATABASE_URL` is unset)
- `/admin` shows the same backend on the login card and the ops header

`DATABASE_SSL_REJECT_UNAUTHORIZED=false` is only for a host whose CA is not in Node’s trust store. Leave it unset for Neon.

## Smoke tests before announcing

1. Home → Visit ConfiRent and CadenceApp. LookFinesse and ConfiLearn show Get notified, not a dead link.
2. Start a Project → intake saves (or emails if Resend set)
3. Book a Call, Contact, Subscribe
4. `/admin` login with `ADMIN_PASSWORD`
5. Pricing checkout: USD price, KES equivalent, Paystack, and bank-transfer invoice request
6. Client portal OTP flow
7. Mobile + light/dark

When placeholders and secrets above are filled, soft-launch to your network, then public post with suite + Start a Project CTA.

## Phone

| Use | Value |
|---|---|
| Display | `0706 397 373` |
| `tel:` / E.164 | `+254706397373` |
| WhatsApp | `https://wa.me/254706397373` |

Set in `src/data/site.ts` (`phone`, `phoneDisplay`). WhatsApp links are built from that number.

## Email (Resend)

Env vars:

| Var | Example | Role |
|---|---|---|
| `RESEND_API_KEY` | `re_...` | Send and fetch inbound bodies |
| `RESEND_FROM_EMAIL` | `hello@<domain>` | Verified from address. `The Beacon Studio <hello@<domain>>` is also fine |
| `RESEND_REPLY_TO` | `hello@<domain>` | Reply-To on outbound mail so answers hit inbound |
| `RESEND_WEBHOOK_SECRET` | `whsec_...` | Verifies `POST /api/email/inbound` |

Webhook in the Resend dashboard:

- URL: `https://<domain>/api/email/inbound`
- Event: `email.received`
- Copy the signing secret into `RESEND_WEBHOOK_SECRET`

Without `RESEND_API_KEY` or `RESEND_FROM_EMAIL`, `/admin` → Mailbox shows **Email not configured**. Form submissions still create a thread in storage. Inbound webhooks are rejected until the signing secret is set.

### DNS for `<domain>`

Add the domain in Resend first (sending + receiving). Copy any value the dashboard shows if it differs — the DKIM public key is unique, and the MX host depends on the region (`<region>`, usually `us-east-1`).

**Sending — SPF**

| Type | Host | Value | Priority |
|---|---|---|---|
| MX | `send.<domain>` | `feedback-smtp.<region>.amazonses.com` | 10 |
| TXT | `send.<domain>` | `v=spf1 include:amazonses.com ~all` | — |

**Sending — DKIM**

| Type | Host | Value |
|---|---|---|
| TXT | `resend._domainkey.<domain>` | `p=<public key from Resend → Domains>` |

**DMARC** (add this yourself; start with monitoring)

| Type | Host | Value |
|---|---|---|
| TXT | `_dmarc.<domain>` | `v=DMARC1; p=none; rua=mailto:dmarc@<domain>; fo=1; adkim=s; aspf=s` |

**Inbound MX** — enable Receiving on the domain. This record must have the lowest priority number or mail will not reach Resend. If `<domain>` already receives mail (Google Workspace, Microsoft 365), put this on a subdomain such as `mail.<domain>` and send from that host instead of replacing the root MX.

| Type | Host | Value | Priority |
|---|---|---|---|
| MX | `<domain>` or `mail.<domain>` | `inbound-smtp.<region>.amazonaws.com` | 10 |

For `us-east-1` that host is `inbound-smtp.us-east-1.amazonaws.com`. Use the hostname Resend prints on the domain page.

Check propagation with `dig TXT send.<domain>`, `dig TXT resend._domainkey.<domain>`, and `dig MX <domain>`.

## Payments (Paystack)

Prices on the site stay in USD. Checkout shows the KES equivalent and lets the client pay:

- **KES** — M-Pesa and card (`channels: card, mobile_money`)
- **USD** — card, when the Paystack account has USD enabled. If Paystack rejects USD, the checkout message says so and KES still works.

| Var | Role |
|---|---|
| `PAYSTACK_SECRET_KEY` | Initialize, verify, and webhook HMAC |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key for the same account |
| `PAYSTACK_USD_KES_RATE` | Optional. Default `130`. Also used for Daraja STK when `MPESA_KES_RATE` is unset |

Endpoints:

- `POST /api/paystack/initialize` — starts a transaction and returns the Paystack URL
- `GET /api/paystack/callback` — verifies the reference, then returns the visitor to pricing
- `POST /api/paystack/webhook` — raw body, header `x-paystack-signature`, HMAC SHA512 of the body with `PAYSTACK_SECRET_KEY`

In the Paystack dashboard set the webhook URL to `https://<domain>/api/paystack/webhook` and enable the `charge.success` event. Turn on KES (card + mobile money) and USD card if international clients should pay in dollars.

**Bank transfer / invoice** is always on the checkout panel. It writes a pending payment (`provider: bank`), a lead in the admin inbox, and a mailbox thread. No bank account number is invented in the email — you reply with details.

**Stripe** (`STRIPE_SECRET_KEY`) and **Daraja** (full `MPESA_*` set) keep their existing routes. Their buttons render only when those keys exist.
