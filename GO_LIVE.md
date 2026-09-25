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
| Founder intro video | `site.ts` meet-me embed | Still a placeholder |
| Trust / client logos | trust strip | Placeholders until you have real marks |

## Optional but recommended (graceful fallbacks without keys)

| Integration | Env vars | Without it |
|---|---|---|
| **Resend** (contact, subscribe, book, portal OTP) | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Forms save to `data/*.json` only; OTP on-screen |
| **Stripe** (card deposits) | `STRIPE_SECRET_KEY` (+ optional Price IDs / publishable key) | Pay UI → coming soon + mailto/book |
| **M-Pesa Daraja** (STK Push) | `MPESA_*` | Same coming-soon fallbacks |
| **OpenAI** (Glow + brief helper) | `OPENAI_API_KEY` | On-site knowledge base only |
| Stripe webhook / M-Pesa callback | Point at your domain `/api/payments/...` | Needed once keys are live |

## Product suite

| Product | Live URL | Notes |
|---|---|---|
| LookFinesse | https://lookfinesseke-0cf56b906a55.herokuapp.com/ | Operational |
| TriviaYard | https://triviayard-9cf8a6eb71ba.herokuapp.com/ | Operational |
| ConfiLearn | GitHub only | Needs public deploy + screenshots |
| CadenceApp | GitHub only | Needs public deploy + screenshots |
| ConfiRent | Stub | Needs repo + deploy |

ConfiTrade stays out of the public suite.

## Platform / ops

- **Heroku ephemeral disk:** `data/*.json` (intakes, bookings, subscribers, analytics, payments) does not survive dyno restarts. For real clients, add durable storage or treat Resend email as source of truth.
- **Node 20.x:** engines pin `20.x` (EOL warnings). Plan a Node 22 bump when convenient.
- **OG / favicon:** confirm share preview and beacon mark.

## Smoke tests before announcing

1. Home → Open LookFinesse / TriviaYard
2. Start a Project → intake saves (or emails if Resend set)
3. Book a Call, Contact, Subscribe
4. `/admin` login with `ADMIN_PASSWORD`
5. Pricing Pay buttons (coming soon until Stripe/M-Pesa)
6. Client portal OTP flow
7. Mobile + light/dark

When placeholders and secrets above are filled, soft-launch to your network, then public post with suite + Start a Project CTA.
