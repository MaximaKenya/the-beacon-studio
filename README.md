# The Beacon Studio

Premium product studio site for **The Beacon Studio** — cloud products & custom software. Founded by Maximillian (Max) in Nairobi, Kenya.

## Brand

**Display / legal:** The Beacon Studio  
**Short form:** Beacon (tight UI, after first mention)  
**Lockup:** The Beacon Studio — cloud products & custom software  
**Assistant:** Glow  
**Tagline:** Cloud products & custom software.  
**Mark:** **Signal A** (`BeaconMark` + `BeaconWordmark`) — rounded studio tile with the distinctive Beacon A and a solid teal signal dot. Typography-led lockup. Solid shapes only (no glow). Works on light and dark via `currentColor` + accent.

### Logo concepts

| Concept | Status | Notes |
|--------|--------|--------|
| **Signal A** | **Default** | Tile + distinctive A + teal signal dot — clear at 24px |
| Beam wordmark | Companion | Typography-led BEACON with Signal A |
| Interlock BS | Alternate | Geometric B/S monogram (denser at favicon size) |
| Studio seal | Alternate | Concentric signal arcs + center node |

Preview variants (icon / wordmark / mono) and exports: **[/brand](/brand)** · SVG files in `public/brand/` (`beacon-mark.svg`, `beacon-mark-mono.svg`, `beacon-wordmark.svg`).

Favicon, Apple icon, PDF headers, Header, Footer, Hero, Admin, and Portal all use the same Signal A mark.

### Brand conflict note

[thebeaconstudios.com](https://thebeaconstudios.com/) is a **film / media production** company in Bakersfield, California (video, photography, studio rental). **Different industry** from this Nairobi software product studio.

**Recommendation: keep “The Beacon Studio”** with a stronger unique lockup (“cloud products & custom software”) and footer disambiguation. A full rename (e.g. Beacon Ridge Studio, Beacon Soft) is optional SEO insurance — not required unless you later see serious search confusion or trademark conflict in software. Prefer differentiation first; do not rebrand solely because of the media company name collision.

### Product suite

Order: **LookFinesse** (flagship) → **ConfiLearn** (LMS) → **CadenceApp** → **ConfiRent** → **TriviaYard** → **ConfiTrade**.

## Quick start

```bash
cd c:\Users\MAXIMILLIAN\portfolio
npm install
cp .env.example .env.local
# Edit .env.local: ADMIN_PASSWORD, optional OPENAI_*, Stripe, M-Pesa
# Edit src/data/site.ts: phone, phoneDisplay, email
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & preview

```bash
npm run build --webpack
npm start
```

Preview: [http://localhost:3000](http://localhost:3000)

## Configure phone / email

In `src/data/site.ts`:

```ts
email: "hello@example.com",
phone: "+254700000000",       // E.164 — used by tel: links
phoneDisplay: "+254 700 000 000",
```

## Deposits (30%)

Custom software deposits are **`payments.depositPercent = 30`**. That is industry-fair (typical studio range 25–40%): enough to reserve capacity and cover discovery/kickoff without full prepay. Stripe Checkout and M-Pesa STK both charge **tier.fromAmount × 30%** for deposit mode.

## Stripe direct pay

1. Create products/prices in Stripe Dashboard (or rely on ad-hoc `price_data` amounts = 30% deposits).
2. Set in `.env.local`:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_SPRINT_DEPOSIT=price_...      # optional — must match 30% of floor
STRIPE_PRICE_PRODUCT_DEPOSIT=price_...
STRIPE_PRICE_RETAINER_DEPOSIT=price_...
```

3. UI: **Pay deposit · Stripe** / **Pay with M-Pesa** on pricing cards.
4. API: `POST /api/payments/checkout` with `{ tierId, mode: "deposit" | "invoice" }`.

## M-Pesa Daraja STK Push

1. Create an app at [Safaricom Developer Portal](https://developer.safaricom.co.ke/).
2. Set in `.env.local`:

```
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...          # sandbox paybill / till
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://YOUR_PUBLIC_HOST/api/payments/mpesa/callback
MPESA_ENV=sandbox            # or production
# MPESA_KES_RATE=130         # optional USD→KES for STK amount
```

3. For local testing, expose the callback with ngrok (or similar) and point `MPESA_CALLBACK_URL` at it.
4. APIs:
   - `POST /api/payments/mpesa/stk` — `{ tierId, mode, phone }`
   - `POST /api/payments/mpesa/callback` — Daraja callback (updates `data/payments.json`)
5. Without keys: UI shows a clear message + **Book a call / Email** fallbacks.
6. Admin → Payments table reconciles pending / success / failed with CheckoutRequestID + receipt.

## Admin ops hub & PDF

**Security recommendation:** Do **not** put a public Admin button in main nav or footer. `/admin` stays unlisted — bookmark it or use this README. A prominent login link increases drive-by brute-force noise.

1. Set `ADMIN_PASSWORD` in `.env.local`.
2. Visit [/admin](http://localhost:3000/admin) directly (legacy `/dashboard` redirects here).
3. **Ops hub:** click any row → detail drawer with working actions:
   - **Bookings:** confirm / reschedule note / complete / cancel + admin notes
   - **Intakes:** convert to Project, send quotation, mark contacted, assign status
   - **Newsletter:** export CSV, remove subscriber
   - **Contact:** mark read / replied, archive (form posts → `data/contacts.json`)
   - **Vibe reactions:** filter by sentiment; click for detail
   - **Needs attention:** unified inbox; mark resolved
   - **Payments:** mark paid (creates receipt)
4. **Client projects** panel: edit milestones, %, next payment date, timeline updates, and chat — clients see live data on `/portal` refresh.
5. **Download PDF** — light branded analytics PDF (`Beacon-Studio-Analytics-…-EAT.pdf`) with signal mark header (no black flash).
6. **Print** — separate control; opens `/admin/report?print=1`.
7. Data files: `data/bookings.json`, `intakes.json`, `subscribers.json`, `payments.json`, `contacts.json`, `analytics.json`, `clients.json`, `projects.json`, `messages.json`, `quotations.json`, `receipts.json`, `portal-codes.json`.

### Verify vibe → admin

1. On the homepage, use a **Vibe check** control.
2. Open `/admin`, sign in, refresh — reactions appear in ops + analytics.

## Client portal

1. Set `PORTAL_SECRET` in `.env.local` (falls back to `ADMIN_PASSWORD` in local/dev).
2. After **Start a Project** intake, a client + project + quotation are created automatically.
3. Success screen shows **Download / Print** quotation and a **Save your portal link** (signed access token).
4. Visit [/portal/login](http://localhost:3000/portal/login):
   - Paste access token from the link, **or**
   - Enter email → request code
5. **OTP without email (local/dev):** After requesting a code, if Resend is unset (or send fails), the UI shows a yellow banner plus a large **Your one-time code** block and prefills the input — no SMTP required. With `RESEND_API_KEY` set and a successful send, the code is emailed only (not shown on screen).
6. Dashboard ([/portal](http://localhost:3000/portal)): milestones, progress pie, next payment countdown, reviews, quotation/receipts, status timeline, 1:1 chat with admin (polls every few seconds).

Header and footer include a **Client portal** CTA → `/portal/login`.

### Optional: Resend email OTP later

1. Create a [Resend](https://resend.com) account and API key.
2. Add to `.env.local`:

```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=portal@yourdomain.com
```

3. Restart the server. `POST /api/portal/auth` with `request-code` emails the OTP via Resend when send succeeds. If Resend is unset or send fails, the API returns `code` and the login UI shows it on screen for local E2E.

### How portal access works

```
Intake submit → clients.json + projects.json + quotations.json
             → signed accessToken (HMAC via PORTAL_SECRET)
             → /portal/login?token=… sets httpOnly cookie
Email + OTP  → data/portal-codes.json (15 min) → same cookie session
             → code always shown on-screen when Resend is not configured
```

## PDF types

| Type | When | Filename |
|------|------|----------|
| **Quotation** | After intake (and admin “Send quotation”) | `Beacon-Studio-Quotation-{client}-{YYYYMMDD}.pdf` |
| **Receipt** | Payment success (M-Pesa callback, Stripe webhook, or admin mark-paid) | `Beacon-Studio-Receipt-{ref}-{YYYYMMDD}.pdf` |
| **Analytics** | Admin Download PDF | `Beacon-Studio-Analytics-{stamp}-EAT.pdf` |

All PDFs use Beacon mark / wordmark in the header. Timestamps: **Africa/Nairobi**. Download and Print are separate controls.

## Messaging (1:1)

- Threads in `data/messages.json` keyed by `projectId`
- Client: chat panel on `/portal`
- Admin: ops hub messaging + per-project chat in Client projects panel
- Unread badges; poll ~4s / on window focus

## Env vars

| Var | Purpose |
|-----|---------|
| `ADMIN_PASSWORD` | `/admin` login (bookmark URL — not linked publicly) |
| `PORTAL_SECRET` | Portal access token + session signing |
| `STRIPE_SECRET_KEY` (+ optional price IDs) | Stripe Checkout deposits |
| `MPESA_*` | Daraja STK Push |
| `OPENAI_API_KEY` | Optional Glow / brief improver |
| `RESEND_API_KEY` | Optional portal OTP email (see Client portal) |
| `RESEND_FROM_EMAIL` | Resend “from” address |

## Glow AI features

| Feature | Where | Notes |
|--------|--------|--------|
| **Movable Glow FAB** | Marketing pages (`FeatureLayer`) | Drag to reposition; `localStorage` key `beacon-glow-fab-pos`; z-index 250; hidden on `/admin` and `/portal` |
| **Chat knowledge base** | Glow panel | On-site answers for products, pricing, booking, founder — works without OpenAI |
| **OpenAI chat** | `POST /api/chat` | Optional `OPENAI_API_KEY`; Glow calls this with KB fallback |
| **Product recommender** | Glow (“Which product fits…?”) | KB routes to LookFinesse / ConfiLearn / CadenceApp / ConfiRent |
| **Brief improver** | Start a Project wizard | `POST /api/brief/improve` — polishes intake briefs |
| **Ask Glow** | Product detail pages | Quick product Qs open Glow with a prefilled prompt |

## Conversion extras

- Soft exit-intent **Book a 15-min call** after browsing
- **Compare products** quick picker (footer-left)
- **Saved quote reminder** after intake (localStorage)
- **Portal progress teaser** (aggregate active builds, no PII)
- Social proof via real vibe aggregates on `PublicAnalyticsPulse`

## Newsletter popup

- Auto-open at most **once per session**, after ~18s (or deep scroll).
- Honors localStorage dismiss + subscribed flags — never auto-opens again after dismiss/subscribe.
- Footer **Subscribe** still opens manually.

## Site highlights

- Hero balances **suite of cloud apps** + **custom builds** (Explore products / Start a project / Book a call)
- Equal product card grid + constellation (no edge clipping) + per-product UI slideshows
- Polaroid-style founder photo (no oval frames)
- Cool blue-slate light theme with mesh depth
- 30% deposits via Stripe or M-Pesa
- Client portal + admin ops E2E

The Beacon Studio — cloud products & custom software.
