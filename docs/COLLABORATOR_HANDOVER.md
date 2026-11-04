# Collaborator handover — Beacon Creek website

For the collaborator account (**@joyfuljingles101**). You do the code work with your own credits. Beacon Creek reviews it, Max approves it, and Beacon Creek deploys it.

## 1. Context

- **Company:** Beacon Creek, a registered business (BN-KDS39ZPY, certificate dated 3 Nov 2026). The domain **thebeaconstudio.co.ke** stays as it is.
- **Stack:** Next.js 16 (webpack), React 19, Node 22.x. The site is hosted on the Heroku app `the-beacon-studio`. When `NEXT_PUBLIC_ASSET_BASE` is set at build time, static assets come from a CDN (see `next.config.ts`).
- **Key files:** `src/data/site.ts` (site config, `seo.siteUrl`), `README.md`, `GO_LIVE.md`, `INTEGRATIONS.md`, `DEPLOYMENT.md`, `AUTOMATIONS.md`, `docs/MESSAGING_HUB.md`, `docs/BRAND_COMMS.md`.
- **Public products:** ConfiRent, CadenceApp, LookFinesse, ConfiLearn. TriviaYard and ConfiTrade must not appear on the public site.

### Run and test

```bash
npm ci
cp .env.example .env.local   # use dummy/local values only — never real keys
npm run dev                  # http://localhost:3000
npm run lint                 # expect 0 errors; 5 known warnings (see P2-1)
npm test                     # tsx unit tests
npm run build                # must pass before any PR
```

Without `DATABASE_URL`, local storage falls back to `data/*.json`. When an integration key is missing, the feature falls back to a safe default, so you do not need live credentials for anything here.

## 2. Prioritised checklist

| ID | Pri | Item | Files | Acceptance | Risk |
|---|---|---|---|---|---|
| P1-1 | P1 | `/products` returns **404** in production. Only `/products/[id]` exists, but navigation and users expect an index page. | `src/app/products/` (add `page.tsx`), `src/app/sitemap.ts` | `/products` returns 200 and lists the 4 public products, and the sitemap includes it | Low |
| P1-2 | P1 | Review the open Dependabot major bumps: #42 setup-node 7, #43 checkout 7, #44 lucide-react 1.x, #45 eslint 10, #46 TypeScript 7, #48 framer-motion 14 | `package.json`, `.github/workflows/*` | For each PR: build, lint and tests pass. Write a short review comment covering breaking changes and say whether it is safe. Do not merge. | Medium (TS 7 and eslint 10 can break the build) |
| P1-3 | P1 | Old PR #2 (Heroku wing URLs and `seo.siteUrl`) is stale. `siteUrl` is now `https://thebeaconstudio.co.ke`. | PR #2, `src/data/site.ts` | Comment on the PR recommending close or rebase. Do not merge it yourself. | Low |
| P1-4 | P1 | Homepage HTML is about **411 KB** and the server responds in about 2.3 s | `src/app/page.tsx`, `src/components/home/*` | HTML under 150 KB. Heavy sections are lazy-loaded or moved to server components. Lighthouse performance score 85 or higher on mobile. | Medium (visual regressions) |
| P2-1 | P2 | 5 lint warnings from `window.location.href` | `src/components/ui/CommandPalette.tsx` (lines 89, 91, 121, 243), `src/components/automations/BuffetBuilder.tsx` (line 86) | Uses `useRouter().push()` for internal routes and `npm run lint` shows 0 warnings | Low |
| P2-2 | P2 | `/brand` and the logo concept pages still show the old lighthouse logo | `src/app/brand/page.tsx`, `src/app/admin/logo-options/page.tsx`, `src/components/brand/LighthouseSpinner.tsx`, `markConcepts.tsx`, `logoOptions.tsx` | Only the Signal A mark is shown and no lighthouse artwork appears on public pages | Low. Keep the files until Max confirms they can be deleted. |
| P2-3 | P2 | Large assets: `public/logo-options/` is 2.6 MB (`edit2-trace.svg` is 300 KB), and `public/products/confilearn` is 2.5 MB | `public/` | Images converted to WebP/AVIF through `next/image`. Unused logo traces moved out of `public/`. Total size of `public/` under 5 MB. | Low |
| P2-4 | P2 | Single-colour redraw of the button logo | `src/components/brand/BeaconMark.tsx`, `public/brand/*.svg` | A mono variant that renders clearly at 16–24px and is used on buttons | Low |
| P2-5 | P2 | Follow-ups from the ConfiTrade/TriviaYard rename | `grep -ri "confitrade\|triviayard" src public` | No public mentions remain. Admin and internal references are documented. | Low |
| P2-6 | P2 | Some places use raw `<img>` instead of `next/image`, which skips the CDN, AVIF conversion and lazy loading | `src/lib/brand-comms.ts`, `src/components/admin/AdminPdfExport.tsx`, `BeaconMark.tsx`, `admin/logo-options` | Public-page images use `next/image`. Email and PDF code may keep `<img>`, with a comment explaining why. | Low |
| P2-7 | P2 | Accessibility pass | layout, Header, CommandPalette, forms | axe reports 0 serious issues on /, /automations, /book. Focus traps work and every control has a label. | Low |
| P2-8 | P2 | API route hardening (prevent hanging requests) | `src/app/api/ai/chat`, `api/automations/tick`, `api/sms`, `api/whatsapp`, `api/payments`, `api/paystack` | Every outbound fetch has a timeout (8–15 s) and a JSON error response. Add a test for the timeout path. | Medium. **Do not change payment logic**, only the timeout handling. |
| P3-1 | P3 | Founder video is still a placeholder | `src/data/site.ts` meet-me embed | Wait for Max to supply the video. Prepare a component that hides itself when no URL is set. | — |
| P3-2 | P3 | SEO: per-page metadata and JSON-LD (Organization with registered name, Product) | `src/app/**/page.tsx`, `layout.tsx` | Every public page has a unique title and description. Rich Results test passes. | Low |
| P3-3 | P3 | CI: add a build step and a Lighthouse CI or bundle-size check | `.github/workflows/ci.yml` | PRs show a build result and a bundle-size result | Low |
| P3-4 | P3 | UI/UX: mobile nav polish, sticky CTA, skeleton states on /book and /automations | components | Before and after screenshots in the PR | Low |

## 3. Revamp ideas (need Max's approval before you start)

- A products index with comparison cards and a "notify me" option for coming-soon products.
- A `/status` page built on `/api/health` and the automations tick.
- Case studies rebuilt with MDX.
- Move CommandPalette search to a static index generated at build time.
- A dark-mode audit of the Signal A brand palette.

## 4. Do not touch

- **Payments config.** Paystack is the only payment method. Stripe has been removed, so do not add it back. Paystack stays unconfigured until it is activated for live payments. The 30-day free trial, with checkout hidden, stays in place until then (`src/lib/automations/trial.ts`).
- **Live credentials and env vars.** Never add, print or commit keys, tokens or secrets. Use dummy values in `.env.local` only. Do not rename `PAYSTACK_FORWARD_*`.
- **Heroku.** No deploys, no config var changes, no Scheduler changes. Do not edit `Procfile` or `infra/` without approval.
- **SMS/WhatsApp/voice hub (Beacon router).** Beacon Creek is setting this up and keeping SMS provider-neutral. Do not change `src/lib/hub`, `api/sms`, `api/whatsapp` or `api/hub` except for the timeout work in P2-8, and only if a reviewer asks for it.
- **Anything waiting on Max's decision:** the founder video, deleting old brand assets, a rename or rebrand, domain/DNS changes, and pricing or the deposit percentage.

## 5. PR rules

1. Branch from `main` and name it `fix/…`, `feat/…` or `docs/…`. Keep to one issue per PR and reference it (`Closes #N`).
2. The collaborator **opens PRs only**: never merge, never push to `main`, never deploy.
3. Before you open a PR, `npm run lint`, `npm test` and `npm run build` must all pass. Include screenshots for any UI change.
4. Beacon Creek reviews the PR, Max approves it, and Beacon Creek merges and deploys to Heroku.
5. Issues for this work have the `collaborator` label.
