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
| LookFinesse | No live URL and no public repo | Coming soon — Get notified / contact |
| ConfiLearn | No live URL and no public repo | Coming soon — Get notified / contact |

Do not publish private repository URLs. The old LookFinesse and TriviaYard Heroku URLs are not used.

## Platform / ops

- **Heroku ephemeral disk:** submissions live only in `data/*.json` (`src/lib/storage.ts`). There is no database client in this repo. Those files do not survive a dyno restart or redeploy. Durable storage is not implemented. To keep them, add Heroku Postgres and a future `DATABASE_URL` adapter. Until then, set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` so each submission and each admin reply is emailed. Email is the durable copy.
- **Admin inbox:** `https://YOUR_APP/admin` (not linked in the public menu). Log in with `ADMIN_PASSWORD`. Also set `PORTAL_SECRET` in production so portal sessions are not signed with the admin password. Reviews stay private until you approve them in the inbox.
- **Node 22.x:** `package.json` engines pin `22.x`.
- **OG / favicon:** confirm share preview and beacon mark.

## Smoke tests before announcing

1. Home → Visit ConfiRent and CadenceApp. LookFinesse and ConfiLearn show Get notified, not a dead link.
2. Start a Project → intake saves (or emails if Resend set)
3. Book a Call, Contact, Subscribe
4. `/admin` login with `ADMIN_PASSWORD`
5. Pricing Pay buttons (coming soon until Stripe/M-Pesa)
6. Client portal OTP flow
7. Mobile + light/dark

When placeholders and secrets above are filled, soft-launch to your network, then public post with suite + Start a Project CTA.
