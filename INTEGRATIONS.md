# External integrations — The Beacon Studio

Everything you need to configure for email, payments, AI, auth, and analytics.
Leave a key unset and the site stays usable with graceful fallbacks (on-screen OTP, coming-soon pay messages, local knowledge base).

Copy `.env.example` → `.env.local` and fill values for your environment.

---

## Quick map

| Integration | Used for | Required? |
|---|---|---|
| **Resend** | Contact notify + ack, subscribe confirm, booking confirm, portal OTP | Optional |
| **OpenAI** | Glow assistant + brief improver | Optional |
| **ADMIN_PASSWORD** | `/admin` login | **Required** |
| **PORTAL_SECRET** | Portal JWT / OTP signing | Recommended (falls back to `ADMIN_PASSWORD` in dev) |
| **Postgres** (`DATABASE_URL`) | Durable contacts, intakes, bookings, projects, messages, reviews, portal threads, payments, analytics | Required on Heroku |
| **Analytics** | Stored with the active backend (Postgres, or `data/analytics.json` locally) | Built-in |

---

## 1. Resend (email)

**Env**

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=studio@yourdomain.com
```

**Where it fires**

| Flow | To | Trigger |
|---|---|---|
| Contact form | Studio + visitor ack | `POST /api/contact` |
| Subscribe | Subscriber confirm | `POST /api/subscribe` |
| Book a Call | Guest + studio | `POST /api/book` |
| Portal OTP | Client email | `POST /api/portal/auth` (`request-code`) |

**Setup**

1. Create account at [resend.com](https://resend.com).
2. Verify your domain (or use `onboarding@resend.dev` for sandbox).
3. Create an API key → `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` to a verified sender.
5. Without keys: forms still save to `data/*.json`; portal shows the OTP on-screen.

Helper: `src/lib/resend.ts`.

---

## 2. Payments

Paystack is the only online payment gateway (`PAYSTACK_SECRET_KEY`; webhook `POST /api/paystack/webhook`, HMAC-SHA512 verified, `BS-` references, `metadata.app=beacon-studio`). Without the key, checkout falls back to bank transfer / invoice. Stripe was removed.

**UI surfaces**

- Pricing cards → `PayButton`
- Project intake wizard → `PayButton`
- Client portal “Next payment” → `PayButton` (`projectId` attached)
- Admin → **Mark paid** creates a receipt (`payment.mark-paid`)

Deposit amount = tier floor × `siteConfig.payments.depositPercent` (default **30%**).

---

## 3. M-Pesa

Beacon has no paybill of its own. Clients pay Beacon through Paystack (card or M-Pesa mobile money in KES). A client can add **their own** optional paybill or till to their automations (Settings → "Your own M-Pesa paybill or till"); it has no default and is left out of messages when blank.

---

## 4. OpenAI (Glow)

**Env**

```bash
OPENAI_API_KEY=
# OPENAI_MODEL=gpt-4o-mini
```

Without a key, Glow uses the on-site knowledge base (`src/lib/knowledge-base.ts`) + `assistant-context.ts` built from `site.ts`. FAB works on **all** pages including `/admin` and `/portal`.

---

## 5. Auth secrets

```bash
ADMIN_PASSWORD=change-me          # /admin PIN
PORTAL_SECRET=change-me-portal    # JWT + OTP HMAC (falls back to ADMIN_PASSWORD in local/dev)
```

---

## 6. Durable storage (Postgres)

**Env**

```bash
# Neon free tier — pooled host, TLS required
DATABASE_URL=postgresql://USER:PASSWORD@ep-example-pooler.region.aws.neon.tech/neondb?sslmode=require
# Optional. Default 5, sized for one Heroku Node 22 web dyno.
PG_POOL_MAX=5
```

When `DATABASE_URL` is set, `readJsonFile` / `writeJsonFile` (`src/lib/storage.ts`) read and write one Postgres `json` document per file name (`app_documents`). The `json` column keeps array order and object key order. Callers (admin inbox, portal replies, reviews, booking, intake, payments) stay on that API. The table is created on startup and on first use (`CREATE TABLE IF NOT EXISTS`).

When `DATABASE_URL` is unset, those calls keep using `data/*.json`.

Import existing JSON once:

```bash
npm run db:migrate-files
```

`GET /api/health` (admin session or `Authorization: Bearer $CRON_SECRET`; public callers get only `{"ok":true}`) reports `"storage": "postgres"` or `"storage": "file"`. The admin screen shows the same indicator.

---

## 7. Analytics

**Current:** events + vibe reactions persist through the storage adapter (Postgres when `DATABASE_URL` is set, otherwise `data/analytics.json`) via `POST /api/analytics`. Admin reads them at `/admin`.

**Future options (not wired yet):**

- **PostHog** — product analytics + session replay
- **Vercel Analytics** — Web Vitals on Vercel deploys

Ops data stays in the storage adapter. Add a third-party beacon later without blocking launches.

---

## Workflow diagrams

### Contact → admin + email

```mermaid
sequenceDiagram
  participant U as Visitor
  participant API as POST /api/contact
  participant FS as data/contacts.json
  participant R as Resend
  participant A as /admin Needs attention

  U->>API: name, email, message
  API->>FS: unshift unread contact
  opt RESEND_API_KEY set
    API->>R: notify studio + ack visitor
  end
  A->>FS: list / mark read / reply
```

### Subscribe → store + email

```mermaid
flowchart TD
  A[Newsletter popup / footer] --> B[POST /api/subscribe]
  B --> C{Valid email?}
  C -->|no| D[400 error]
  C -->|yes| E[Write subscribers.json unread]
  E --> F{Resend configured?}
  F -->|yes| G[Confirmation email]
  F -->|no| H[Skip email]
  E --> I[/admin Subscribers + Needs attention]
```

### Book → bookings.json + email

```mermaid
flowchart TD
  A[Book a Call modal] --> B[POST /api/book]
  B --> C[Check slot free]
  C --> D[unshift bookings.json status=pending]
  D --> E[Generate ICS]
  D --> F{Resend?}
  F -->|yes| G[Guest confirm + studio notify]
  F -->|no| H[ICS only in UI]
  D --> I[/admin Bookings panel]
```

### Pay → Paystack → receipt

```mermaid
flowchart LR
  UI[PayButton pricing / intake / portal] --> S{Provider}
  S -->|Paystack| ST[POST /api/paystack/initialize]
  ST --> SS[Paystack checkout]
  SS --> WH[paystack webhook]
  WH --> PJ[payments.json success]
  PJ --> AD[Admin Mark paid / receipt]
  AD --> RC[receipts.json + portal docs]
```

### Portal OTP → Resend or on-screen

```mermaid
sequenceDiagram
  participant C as Client
  participant API as /api/portal/auth
  participant R as Resend

  C->>API: request-code + email
  API->>API: issue OTP (PORTAL_SECRET)
  alt RESEND_API_KEY set and send OK
    API->>R: email OTP
    API-->>C: emailed=true
  else no key / send failed
    API-->>C: show code on screen
  end
  C->>API: verify-code
  API-->>C: session cookie → /portal
```

---

## Payment path audit

| Surface | Paystack | Fallback without keys |
|---|---|---|
| Pricing deposit | ✅ | coming_soon + mailto / book |
| Intake wizard | ✅ | same |
| Portal next payment | ✅ | same (`projectId` stored) |
| Admin mark-paid | N/A (manual) | Creates receipt; uses `payment.projectId` when present |

---

## Data files (local ops)

With `DATABASE_URL` unset, the same documents live under `data/` as JSON. With `DATABASE_URL` set they live in Postgres (`app_documents`) and Heroku restarts do not wipe them. Import a `data/` directory once with `npm run db:migrate-files`.

- `contacts.json`, `subscribers.json`, `bookings.json`, `intakes.json`
- `payments.json`, `projects.json` (reviews live on each project), `clients.json`, `messages.json` (portal threads)
- `quotations.json`, `receipts.json`, `portal-codes.json`, `analytics.json`

Admin inbox: `/admin` → **Needs attention** + per-panel drawers (bookings, intakes, contacts, subscribers, payments, vibe reactions). The header shows whether storage is Postgres or JSON files.
