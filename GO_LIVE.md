# Go-live checklist — The Beacon Studio

What must be true before calling the site live for clients. Full setup: `INTEGRATIONS.md`, `DEPLOYMENT.md`.

**Live today:** https://the-beacon-studio-0def818a6eaf.herokuapp.com/

## Required for an honest public launch

| Item | Where | Notes |
|---|---|---|
| Real studio email + phone | `src/data/site.ts` | Still `hello@example.com` / placeholder phone |
| LinkedIn (and Twitter if used) | `site.ts` social / SEO | Still `yourusername` placeholders |
| `seo.siteUrl` + custom domain | `site.ts` + DNS → Heroku | Defaults to Heroku app URL until domain is ready |
| `ADMIN_PASSWORD` | Heroku config vars | **Required** — missing on Heroku today |
| `PORTAL_SECRET` | Heroku config vars | Missing; falls back to admin password in local/dev only |
| Founder intro video | `site.ts` meet-me embed | Still a placeholder. Not shown on the homepage. |

## Optional but recommended (graceful fallbacks without keys)

| Integration | Env vars | Without it |
|---|---|---|
| **Resend** (contact, subscribe, book, portal OTP) | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Forms save to `data/*.json` only; OTP on-screen |
| **Stripe** (card deposits) | `STRIPE_SECRET_KEY` (+ optional Price IDs / publishable key) | Pay UI → coming soon + mailto/book |
| **M-Pesa Daraja** (STK Push) | `MPESA_*` | Same coming-soon fallbacks |
| **OpenAI** (Glow + brief helper) | `OPENAI_API_KEY` | On-site knowledge base only |
| Stripe webhook / M-Pesa callback | Point at your domain `/api/payments/...` | Needed once keys are live |

## Product suite

Public products are only these four. TriviaYard and ConfiTrade are not listed, linked, or described on the site.

| Product | Public link | Status |
|---|---|---|
| ConfiRent | https://www.confirent.co.ke | Live (soft launch) |
| CadenceApp | https://www.cadenceapp.co.ke | Beta / early access |
| LookFinesse | No live URL. Public repo: https://github.com/MaximaKenya/lookfinesse | Coming soon — Get notified / contact |
| ConfiLearn | No live URL and no public repo | Coming soon — Get notified / contact |

Do not publish private repository URLs. The old LookFinesse and TriviaYard Heroku URLs are not used.

## Platform / ops

- **Durable storage:** set `DATABASE_URL` (see below). Without it, `data/*.json` lives on the dyno disk and Heroku wipes it on restart.
- **Node 22.x:** `package.json` engines pin `22.x`.
- **OG / favicon:** confirm share preview and beacon mark.

## Durable storage (Postgres)

Contacts, intakes, bookings, projects, messages, reviews, portal threads, payments, subscribers, quotations, receipts, portal codes, and analytics all go through `src/lib/storage.ts`. When `DATABASE_URL` is set they are stored in Postgres. When it is unset (local dev) the same API keeps using `data/*.json`.

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
5. Pricing Pay buttons (coming soon until Stripe/M-Pesa)
6. Client portal OTP flow
7. Mobile + light/dark

When placeholders and secrets above are filled, soft-launch to your network, then public post with suite + Start a Project CTA.
