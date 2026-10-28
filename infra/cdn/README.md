# Static-asset CDN (cdn.thebeaconstudio.co.ke)

Vercel project `beacon-cdn` (this `vercel.json`) rewrites only static paths to the Heroku origin and caches them at the edge:
`/_next/static/*`, `/_next/image` (varies by `Accept`), `/products|work|brand/*.{webp,png,jpg,avif,svg}`, `/images/*`, `/favicon.ico`.
Every other path (HTML, `/api/*`, webhooks, admin, portal) is a 404 on the CDN host and never proxied. Errors/404s are not cached.

Enable: set `NEXT_PUBLIC_ASSET_BASE=https://cdn.thebeaconstudio.co.ke` on Heroku and **rebuild** (it is read at build and at runtime).
Rollback: unset it and rebuild. Main site, DNS for apex/www and mail records are untouched.
