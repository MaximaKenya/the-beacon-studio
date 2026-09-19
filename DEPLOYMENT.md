# Deployment & Launch Guide — The Beacon Studio

Practical steps to ship **The Beacon Studio** (cloud product suite + custom development studio) and turn it into a client pipeline.

**Brand:** The Beacon Studio is Maximillian’s product studio. Founder story lives in About; conversion lives in Products, Services, Pricing, Start a Project, and Book/Contact.

## Domain

Primary picks: **`beacon.studio`** or **`beacon.co.ke`**

Also consider: `getbeacon.com`, `beacon.dev` (verify availability).

See README for runners-up (Summit, Ridge, Harbor, Peak, Crest, Falcon, …).

## Environment

Copy any env examples you use for OpenAI (optional chat upgrade), then set:

- Public site URL in `src/data/site.ts` → `seo.siteUrl`
- Email, social links, booking hours
- Pricing floors in `pricingTiers[]` (USD estimates; quotes after discovery)

## Vercel

1. Import the repo  
2. Framework: Next.js  
3. Build command: `npm run build --webpack` (or default if configured)  
4. Ensure `data/` is writable locally; on serverless, intakes/bookings/subscribers persist only if you attach durable storage — for production, swap JSON files for a DB or email-only flow  

## Pre-launch checklist

- [ ] Replace `hello@example.com` and social URLs  
- [ ] Set `seo.siteUrl` and OG image  
- [ ] Update product names, `liveUrl`, and `operationalStatus`  
- [ ] Confirm booking timezone Africa/Nairobi  
- [ ] Review `pricingTiers[]` ranges  
- [ ] Swap trust-strip placeholder logos for real clients when ready  
- [ ] Test Start a Project → `data/intakes.json`  
- [ ] Test Book a Call, newsletter, ⌘K palette, product drawer, constellation, FAQ  
- [ ] `manifest.json` — The Beacon Studio PWA name  
- [ ] Favicon shows signal-beacon mark (`src/app/icon.tsx` + `apple-icon.tsx`)  

## SEO

Target phrases: The Beacon Studio, Beacon, Beacon Studio, custom software development, cloud apps, SaaS studio Kenya, Nairobi software studio.

JSON-LD ships Organization + Person + SoftwareApplication (`OrganizationJsonLd`) and FAQPage (`FaqJsonLd`).

## Launch messaging

- LinkedIn: “The Beacon Studio · Product studio · Nairobi” + featured site link.  
- Soft launch to warm network → then public post with suite + Start a Project CTA.

## After launch

Ship The Beacon Studio, then tell people it exists. Iterate products in `site.ts` without redesigning the site — the suite UI scales with `products.length`.
