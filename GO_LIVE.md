# Go-live checklist — The Beacon Studio

What must be true before calling the site live for clients. Full setup: `INTEGRATIONS.md`, `DEPLOYMENT.md`.

**Live today:** https://the-beacon-studio-0def818a6eaf.herokuapp.com/

## Automations buffet

Client and admin steps live in `AUTOMATIONS.md`. Short version:

- Signup starts a **30-day trial** (`TRIAL_DAYS` in `src/lib/automations/trial.ts`). No card. Paystack checkout is hidden until `PAYSTACK_SECRET_KEY` is set.
- Heroku Scheduler should keep calling `POST /api/automations/tick` hourly with `CRON_SECRET`. The admin Action Center shows the last successful tick and warns after 2 hours.
- SMS needs `AT_USERNAME` and `AT_API_KEY`. WhatsApp needs `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_ID`. Until then, phone messages wait and the Action Center badges them.
- A Heroku variable named `PAYSTACK_FORWARD_CONFIRENT` was flagged as a possible misspelling. The router looks up `PAYSTACK_FORWARD_` plus slug `CONFIRENT`. Confirm it on Heroku before renaming. Do not change it from the app.

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
| **Groq** (Beacon AI chat, `POST /api/ai/chat`) | `GROQ_API_KEY`, optional `GROQ_MODEL` | Widget still opens. Replies fall back to WhatsApp. Default model is `llama-3.3-70b-versatile`. Free and developer Groq tiers retired that id on 2026-08-16; the route then retries `openai/gpt-oss-120b`. Set `GROQ_MODEL` to pin one model. |
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
7. Beacon AI (button above WhatsApp) answers from the site facts, or shows the WhatsApp fallback when `GROQ_API_KEY` is missing. A name plus email or phone in the chat lands in `/admin`.
8. Mobile + light/dark

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
- `POST /api/paystack/webhook` — company-wide router (below)

In the Paystack dashboard set the webhook URL to `https://<domain>/api/paystack/webhook` and enable the `charge.success` event. Turn on KES (card + mobile money) and USD card if international clients should pay in dollars.

### Company-wide webhook router

One Paystack account can serve every product. `POST /api/paystack/webhook` is the shared receiver.

1. Read the raw body. Do not parse it before the signature check.
2. Require header `x-paystack-signature`. It must equal HMAC SHA512 of that raw body, keyed with `PAYSTACK_SECRET_KEY`. A mismatch returns 401 and is not forwarded.
3. Route the event:
   - `data.metadata.app` wins when it is set.
   - Otherwise use the reference prefix (the letters before the first `-`).
4. Beacon Studio stays on this app. Every Beacon Studio transaction is created with reference `BS-<payment id>` and `metadata.app` = `beacon-studio`. A reference with no prefix is treated as Beacon Studio so older checkouts still record.
5. Every other product is forwarded. The router returns 200 to Paystack immediately, then POSTs the **same raw body** and the **original** `x-paystack-signature` header to the URL in `PAYSTACK_FORWARD_<SLUG>`. The forward and its HTTP status are written to the server log (`[paystack/router]`).

| Prefix | `metadata.app` | Env var |
|---|---|---|
| `BS-` | `beacon-studio` | handled here, not forwarded |
| `CR-` | `confirent` | `PAYSTACK_FORWARD_CONFIRENT` |
| `CA-` | `cadenceapp` | `PAYSTACK_FORWARD_CADENCEAPP` |
| `LF-` | `lookfinesse` | `PAYSTACK_FORWARD_LOOKFINESSE` |
| `CL-` | `confilearn` | `PAYSTACK_FORWARD_CONFILEARN` |
| `CT-` | `confitrade` | `PAYSTACK_FORWARD_CONFITRADE` |
| `TY-` | `triviayard` | `PAYSTACK_FORWARD_TRIVIAYARD` |
| `CV-` | `convoria` | `PAYSTACK_FORWARD_CONVORIA` |

Example: `PAYSTACK_FORWARD_CONFIRENT=https://confirent.co.ke/api/paystack/webhook`

If a forward URL is unset, the event is logged and not sent. Paystack still gets 200 so it does not retry forever. An unknown prefix is logged as unrouted and also gets 200.

## Ready-made automations

The buffet lives at `/automations`. Checkout uses the same Paystack account, always with reference `BS-<id>` and `metadata.app` = `beacon-studio`.

Reminders, digests, and renewals run from `GET` or `POST /api/automations/tick`. The same request also sends booking emails: a reminder about 24 hours before the call, another inside the last hour, one follow-up after the call, and one note when a booking was started and not finished (about 2 hours later, with an unsubscribe link).

### GitHub Actions secret

Add this repository secret under Settings → Secrets and variables → Actions. The name has to be exact:

**`CRON_SECRET`**

Use the same value as the live app's `CRON_SECRET` environment variable. `.github/workflows/automations-tick.yml` reads `secrets.CRON_SECRET` and sends `Authorization: Bearer <that value>` to `POST https://thebeaconstudio.co.ke/api/automations/tick`. The workflow runs at minute 5 of every hour (`5 * * * *`) and can also be started by hand (`workflow_dispatch`). The run fails if the secret is missing. Do not commit the value.

The daily Vercel cron stays in `vercel.json` (`0 6 * * *` on `/api/automations/tick`). Leave it. It is too coarse for the 1-hour reminder on its own. It is safe beside the hourly run: each reminder is claimed before it is sent, and Resend uses a stable idempotency key (`booking-reminder-24h/<id>`, `booking-reminder-1h/<id>`, `booking-followup/<id>`, `booking-abandoned/<id>`), so the two schedules do not send the same email twice.

There is no in-process timer. Heroku Scheduler, if you still use it, can call the same URL:

```bash
curl -X POST https://thebeaconstudio.co.ke/api/automations/tick -H "Authorization: Bearer $CRON_SECRET"
```

`RESEND_API_KEY` has to be set or the tick leaves the reminder unsent and tries again on a later run.

`GROQ_API_KEY` powers qualification, FAQ answers, drafts, and field suggestions. `RESEND_API_KEY` and `RESEND_FROM_EMAIL` send the emails. SMS is optional (`AT_API_KEY`, `AT_USERNAME`, `AT_SENDER_ID`); without them the studio sends email and a `wa.me` link.

**Bank transfer / invoice** is always on the checkout panel. It writes a pending payment (`provider: bank`), a lead in the admin inbox, and a mailbox thread. No bank account number is invented in the email — you reply with details.

**Stripe** (`STRIPE_SECRET_KEY`) and **Daraja** (full `MPESA_*` set) keep their existing routes. Their buttons render only when those keys exist.

## Revenue features (packs, trial nurture, ROI, packages, referrals)

- Industry packs: `/packs/{clinic,school,sacco,landlord,retail,services}`; `/automations?pack=ID` pre-selects. Prices come from `quoteBundle`.
- ROI calculator: `/automation-roi`. "Email me this plan" saves a lead (`kind: roi`) and emails the user and `ADMIN_EMAIL` when `RESEND_API_KEY` is set.
- Fixed-price packages live in `site.ts` (`group: "package"`). Payment uses the 30% deposit or invoice path. Paystack stays off until `PAYSTACK_SECRET_KEY` is set.
- Referrals: `?ref=CODE` sets the `bs_ref` cookie (60 days). New client gets +30 trial days; the referrer earns 1 free month after the first paid month. Data lives in `referrals.json`. Terms are at `/referrals`.
- Trial opt-out links are signed with `PORTAL_SECRET` (falls back to `ADMIN_PASSWORD`). Set one of them before go-live.
