/**
 * Optional static-asset CDN origin (e.g. https://cdn.thebeaconstudio.co.ke).
 * Read at build time from NEXT_PUBLIC_ASSET_BASE. Empty/invalid → same-origin,
 * so unsetting the variable (and rebuilding) is the rollback.
 */
export function assetBase(raw: string | undefined = process.env.NEXT_PUBLIC_ASSET_BASE): string {
  const value = (raw || "").trim();
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return "";
    if (url.pathname !== "/" || url.search || url.hash || url.username || url.password) return "";
    return url.origin;
  } catch {
    return "";
  }
}
