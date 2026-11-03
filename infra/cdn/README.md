# Static-asset CDN (cdn.thebeaconstudio.co.ke)

Vercel project `beacon-cdn` (this `vercel.json`) rewrites only static paths to the Heroku origin and caches them at the edge:
`/_next/static/*`, `/_next/image` (varies by `Accept`), `/products|work|brand/*.{webp,png,jpg,avif,svg}`, `/images/*`, `/favicon.ico`.
Every other path (HTML, `/api/*`, webhooks, admin, portal) is a 404 on the CDN host and never proxied. Edge caching follows the origin's `Cache-Control` (no blanket `CDN-Cache-Control`): 200s from Next are `public, max-age=31536000`, 404s are `private, no-store` and are never cached. A blanket CDN-Cache-Control once cached an origin 404 for the webpack runtime chunk for a year.

Enable: set `NEXT_PUBLIC_ASSET_BASE=https://cdn.thebeaconstudio.co.ke` on Heroku and **rebuild** (it is read at build and at runtime).
Rollback: unset it and rebuild. Main site, DNS for apex/www and mail records are untouched.

Verify before (re-)enabling: `python3 infra/cdn/verify.py` (every asset in the main pages via the CDN host: 200 + content-type, second pass HIT). After a cache-related config change run `vercel cache purge --yes` in the beacon-cdn project.
