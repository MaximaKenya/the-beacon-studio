# Conversion audit

Reviewed the public home page, Start a Project intake, automation buffet, pricing, booking (modal and `/book`), and the client portal. Scores are impact on a first-time buyer, then effort. This pass shipped the safe, no-key items. The last section is what is still open.

## Shipped in this change

| Item | Impact | Effort | What changed |
| --- | --- | --- | --- |
| Trust strip under the hero | High | Low | Nairobi, reply time, free audit, no deposit until success is agreed. |
| Book-a-call on every screen size | High | Low | The call button was desktop-only. It now sits at the bottom right on phones. |
| WhatsApp on phones | High | Low | The `0706 397 373` button was hidden below the `md` breakpoint. It is visible, and the exit panel offers the same chat. |
| Instant price estimate | High | Low | The estimator data was unused. A range card sits above pricing and books a project call. Copy says it is not a quote. |
| Guarantee line | Medium | Low | Pricing states the audit is free, the deposit waits for agreed success, and a miss is revised before the next invoice. |
| Objection in the FAQ | Medium | Low | “What if the first workflow misses the mark?” |
| Case layout | Medium | Low | Example cards are labeled Before / After and still say they are illustrative, not client results. |
| Booking request page | Medium | Low | `/bookings/[id]` is the page linked from the confirmation email. |
| Abandoned booking | Medium | Medium | A started, unfinished booking gets one email about 2 hours later from the hourly tick, with an unsubscribe link. A finished booking is not nudged. |
| Industry workflows | High | Medium | Retail, real estate, clinics, schools, restaurants, and SACCOs each describe one local workflow. Restaurants is a new page. Copy says it is the workflow we install, not a client result. |
| Visitor timezone | Medium | Low | The slot picker still stores Africa/Nairobi and now shows the visitor’s zone beside it, including the local time of a chosen slot. |
| Portal magic link | Medium | Medium | The sign-in email opens the portal with a single-use link. The one-time code stays in the same email and on the login form. |
| Hire vs freelance vs studio | Medium | Low | A short three-card comparison sits under pricing. |

Already in the product, so not rebuilt: weekday slot picker on `/book` and in the booking modal, exit-intent offer on desktop, FAQ block, illustrative examples, and the portal sign-in code.

## Still open, highest first

1. **Named client stories.** Impact high, effort high. The example cards are labeled illustrative on purpose. Real before/after stories need a client’s written permission and a result they will stand behind.
2. **Founder video.** Impact high, effort medium. `meetMeVideo` has no public URL. A 60-second Nairobi intro would do more than another paragraph.
3. **One-click deposit on the audit page.** Impact high, effort medium. Paystack and M-Pesa buttons exist on pricing tiers, but they stay quiet until keys are set. Do not fake a checkout.
4. **Proposal the same day.** Impact high, effort medium. The follow-up email links to pricing. A short proposal tied to the success criteria from the call is the missing artifact.
5. **Live review count on the hero.** Impact medium, effort low once reviews exist. Public reviews already render when a client leaves one. A number on the hero should wait until that list is real. A placeholder count would be a false claim.

## Not recommended

- A fake logo wall or invented testimonials.
- A ticking countdown on the free audit.
- Publishing the placeholder LinkedIn URL. It has been removed; LinkedIn stays off the site and the email footer.
