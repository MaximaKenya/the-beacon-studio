# Beacon Messaging Hub v0 (contract for sister apps)

Shared SMS/WhatsApp hub hosted by The Beacon Studio at `https://thebeaconstudio.co.ke`.
Sister apps (cadenceapp, confirent, lookfinesse, confilearn, convoria, confitrade) never hold provider keys; they call the hub.

**Status: v0 is queue-only.** Providers are not chosen yet (SMS: Belio / Mobitech / Africa's Talking; WhatsApp: Meta Cloud API; voice: Africa's Talking / SIP, not in v0). Accepted messages stay `queued` until `HUB_SENDING_ENABLED=true` **and** an adapter is configured. Build and test your integration now; delivery starts later without contract changes.

## Environment

On each app:

| Var | Value |
| --- | --- |
| `BEACON_HUB_URL` | `https://thebeaconstudio.co.ke` |
| `BEACON_HUB_KEY` | issued in Beacon Admin › Messaging hub (shown once) |
| `BEACON_HUB_SECRET` | issued with the key (shown once) |

On the hub (Beacon), either:

- `HUB_APP_KEYS` — JSON map `{"cadenceapp":{"key":"…","secret":"…","callbackUrl":"https://…/api/hub/events"}, …}`, or
- per app: `HUB_KEY_<APP>`, `HUB_SECRET_<APP>`, `HUB_CALLBACK_<APP>` (APP upper-case, `-` → `_`, e.g. `HUB_KEY_CADENCEAPP`).

Keys generated/rotated in the admin tab are stored in the hub document and override env for that app.

Hub-only: `HUB_SENDING_ENABLED` (`true` to dispatch), `HUB_SMS_PROVIDER` / `HUB_WHATSAPP_PROVIDER` (`mock` | `africastalking` | `belio` | `mobitech` | `meta_whatsapp`; all real ones are stubs in v0), `HUB_INBOUND_TOKEN` (stub inbound auth), `CRON_SECRET` (tick).

## Authentication (every app → hub request)

```
Authorization: Bearer <BEACON_HUB_KEY>
X-Beacon-Timestamp: <unix seconds>
X-Beacon-Signature: sha256=<hex HMAC-SHA256(secret, `${timestamp}.${rawBody}`)>
```

- Rejected (401) if timestamp skew > 300 s, signature mismatch, or the same signature is replayed.
- For `GET` the raw body is the empty string, so sign `${timestamp}.`.
- Sign the exact bytes you send.
- Per-app rate limit: 120 requests/min (config `policy.appRatePerMinute`) → 429.

Node example:

```ts
import { createHmac } from "crypto";
export async function hubFetch(path: string, body?: unknown) {
  const raw = body === undefined ? "" : JSON.stringify(body);
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = "sha256=" + createHmac("sha256", process.env.BEACON_HUB_SECRET!).update(`${ts}.${raw}`).digest("hex");
  return fetch(`${process.env.BEACON_HUB_URL}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${process.env.BEACON_HUB_KEY}`, "X-Beacon-Timestamp": ts, "X-Beacon-Signature": sig, "Content-Type": "application/json" },
    body: body === undefined ? undefined : raw,
  });
}
```

## POST /api/hub/messages/send

```json
{
  "app": "cadenceapp",
  "channel": "sms",
  "to": "+254712345678",
  "templateKey": "ca_booking_confirm",
  "variables": { "name": "Wanjiku" },
  "body": "Your booking is confirmed",
  "reference": "CA-booking-123-confirm",
  "consentRef": "consent-789",
  "category": "utility",
  "vendorRef": "client-42"
}
```

- `app` must equal the app that owns the key (else 403).
- `channel`: `sms` | `whatsapp`. `to`: E.164; Kenyan `07…`/`01…`/`254…` are normalised to `+254…`.
- `body` required for sms unless `templateKey`; whatsapp needs `templateKey` or `body`.
- `reference`: idempotency key, unique per app. Re-sending the same reference returns the original `id` and status; nothing new is queued.
- `category`: `utility` (default) | `marketing` | `authentication` | `collection`.
- `vendorRef`: your client/tenant id, for your own reconciliation.

Response **202**: `{"id":"hm_…","status":"queued"}` or `{"id":"hm_…","status":"rejected","reason":"…"}`.
Validation errors are 400 `{"error":"validation","reason":"…"}`.

Reject reasons: `opted_out`, `marketing_requires_consent`, `collection_outside_hours`, `collection_outside_days`, `collection_public_holiday`, `collection_daily_cap`, `collection_weekly_cap`, `no_price_configured`, `insufficient_wallet` (only if wallet enforcement is on for the app).

Platform rules (Beacon config, `policy` in the hub document):
- Suppression list per app + number + channel.
- Marketing requires `consentRef`.
- Collection: 08:00–19:00 EAT, Monday–Saturday; no Sundays or Kenyan public holidays (fixed dates, Good Friday, Easter Monday, Sunday→Monday substitution; Eid and one-off gazetted days go in `policy.extraHolidays`).
- Collection per debtor (app + number): 1/day, 3 in 7 days.

## GET /api/hub/messages/:id

Same auth. Returns `{id, app, reference, channel, to, category, status, reason?, createdAt, updatedAt}`. Status: `queued` | `sent` | `delivered` | `failed` | `rejected`.

## POST /api/hub/optout

Same auth. Body `{"app":"cadenceapp","to":"+254712345678","channel":"sms"}` (omit `channel` for both). Adds to the suppression list.

## Inbound STOP: POST /api/hub/inbound/:provider (stub)

Until a provider is chosen this requires header `X-Hub-Inbound-Token: $HUB_INBOUND_TOKEN`; body `{from, text, channel?, app?}`. Texts starting with STOP/STOPALL/UNSUBSCRIBE/CANCEL/END/QUIT/ACHA/TOKA suppress the number for `app`, or for every app that has messaged that number on the channel, and queue an `opt_out` callback to each app.

## Callbacks (hub → app)

POST to the app's `callbackUrl` (suggested path `/api/hub/events`), signed exactly like requests (`X-Beacon-Timestamp`, `X-Beacon-Signature` with the app secret over `${timestamp}.${rawBody}`). Verify and reject skew > 5 min.

```json
{ "type": "status", "id": "hm_…", "reference": "CA-booking-123-confirm", "channel": "sms", "to": "+254712345678", "status": "sent", "reason": null, "at": "2026-10-27T07:00:00.000Z" }
```

`type`: `status` | `opt_out` (opt-out callbacks have an `opt_…` id and empty reference). Return any 2xx. Non-2xx/timeouts retry after 1 min, 5 min, 30 min, 2 h, 12 h, then give up; every attempt is recorded. Handle duplicates idempotently by `id` + `status`.

Callbacks and dispatch run on `GET|POST /api/hub/tick` (`Authorization: Bearer $CRON_SECRET`); schedule it every few minutes.

## Wallet, ledger and prices

- Append-only ledger per app: `credit`, `reservation` (on queue), `refund` (releases a reservation when sent/failed), `debit` (price on send, with provider `costKes` so margin = revenue − cost).
- Price table (`prices` in the hub document, edited in Admin): rows of `{channel, category|"*", network: safaricom|airtel|other|"*", costKes, priceKes, transferPriceKes}`. Sister apps pay `transferPriceKes`; external clients pay `priceKes`. Most specific row wins.
- **All shipped prices are PLACEHOLDERS** until provider quotes are in.
- Wallet enforcement is off by default (no wallets funded yet).

## Admin › Messaging hub

Apps (masked keys, source, callback origin, queue depth, wallet), generate/rotate key + secret (shown once), recent messages, suppression list, price config editor, wallet credit.
