# Automations

The Beacon Studio hosts the automation buffet. A client picks automations, gets 30 free days, and runs them from the portal. The length of the trial is `TRIAL_DAYS` in `src/lib/automations/trial.ts`.

## For a client

1. Open `/automations` and pick what you need.
2. Choose **Start 30 days free**. No card. Paystack stays hidden until it is connected.
3. **Request invoice** if you want a bill for the month after the trial. The automations still start now.
4. Sign in at `/portal` with the same email.
5. The overview shows active automations, runs, messages, leads, bookings, payments, and days left.
6. Open an automation for its checklist, inputs, share links, and last result.

### Inputs

Ledgers (fees, rent, debt, SACCO), stock, shifts, expiries, birthdays, and reminder lists are tables. Add, edit, and delete rows. Download the CSV template, fill it in, and upload it. The engine reads those rows. **Mark paid** on a row stops its reminders.

### Share a form

Lead reply, nurture, onboarding, and abandoned quotes each have:

- a hosted page at `/a/<slug>/lead`
- an iframe and a script, with copy buttons
- the webhook `POST /api/automations/hooks/lead/<slug>`

Reviews and bookings keep `/a/<slug>/review` and `/a/<slug>/book`. Times are Africa/Nairobi.

### Inbox and meeting notes

Paste an email or notes in the portal and submit. If Resend inbound is on for the domain, you can also forward to `inbox+<slug>@thebeaconstudio.co.ke` or `notes+<slug>@thebeaconstudio.co.ke`.

## For admin

`/admin` opens on the **Action Center**.

The left menu badges count what needs a person: new trials, invoices, trials ending within 7 days, failed runs, SMS or WhatsApp still waiting, tick health, Groq and Resend, unread leads, and low-confidence replies. Paystack missing is under **Later** and does not block signups.

The system already:

- starts the 30-day trial on signup
- sends trial emails at 7, 3, and 1 day, then pauses (it does not delete)
- marks a bundle paid when a Paystack webhook arrives, with the paid period starting at the trial end
- retries a failed run twice, then lists it
- sends queued SMS and WhatsApp once those credentials exist
- emails a daily digest

**Mark paid** on an invoice or a ledger row is in the Invoices menu and on each client. Extend or end a trial from the client desk. The Test menu holds Run, send to me, and Reset demo.

Last tick time is on the scheduler item. A warning shows when the last success is more than 2 hours old. Heroku Scheduler should `POST /api/automations/tick` hourly with `Authorization: Bearer $CRON_SECRET`. A second tick while one is running is skipped.

## Channels

Each recipient can have an email, a phone, or both. The automation's channel preference is used first, then a fallback. Kenyan numbers are stored as `+254…`.

While `AT_USERNAME` / `AT_API_KEY` or `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_ID` are missing, phone messages are saved as **waiting** and the Action Center shows a badge. They are not dropped.

## Invoices and files

Invoices, receipts, and the booking `.ics` use the lighthouse mark and the name The Beacon Studio, with hello@thebeaconstudio.co.ke and thebeaconstudio.co.ke. Each invoice has a number, lines, a total, the trial line, a due date, **Download PDF**, and **Copy link**.

## Keys still needed

| Key | Effect when missing |
|---|---|
| `AT_USERNAME`, `AT_API_KEY` | SMS waits |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` | WhatsApp waits |
| `PAYSTACK_SECRET_KEY` | Card checkout stays hidden. Trials and invoices still work |
| `RESEND_API_KEY` | Email is logged, not sent |
| `GROQ_API_KEY` | Drafts use the saved text |
| `CRON_SECRET` | The hourly tick returns 401 |
| `DATABASE_URL` | Data stays in local JSON and is wiped on a Heroku restart |

Paystack references stay `BS-…` and `metadata.app` stays on the beacon app. A Heroku variable named `PAYSTACK_FORWARD_CONFIRENT` was flagged as a possible misspelling. The router reads `PAYSTACK_FORWARD_` plus the slug `CONFIRENT`. Confirm the live name before renaming it. This app does not change Heroku config.

## Trial nurture sequence

`sweepTrials` sends the nurture emails before the 7/3/1 reminders. Each owner gets at most one email per sweep, and each stage is recorded in `trial.stagesSent`, so sends are idempotent.

| Day | Email |
| --- | --- |
| 0 | Welcome with a setup checklist (existing welcome) |
| 7, 21 | Usage digest built from real run stats |
| 27 (≤3 days left) | "Keep it running": shows the annual saving with Request invoice / Book a call buttons. Replaces the 3-day reminder. |
| 29 | Existing 1-day reminder |

Opt-out (`/api/automations/trial-optout`) stops the digests only. Reminders and receipts still arrive. The portal shows the trial stage. Admin › Trials shows trials by stage, and Admin › Referrals lets you mark credits used.

## Revenue overview (admin)

Admin → Revenue lists trials, referrals, add-on and partner requests, open invoices, care subscriptions, founders locks, Notify queue counts per channel, and template downloads. Admin → Partners lists partner and partnership requests. From the portal, clients see their price lock, pro add-ons, and WhatsApp/SMS queue placeholders, with a link to `/add-ons`.
