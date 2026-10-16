/**
 * Beacon mark — a small lighthouse.
 * Structure uses currentColor (or an explicit ink). Light and beams use accent.
 * Drawn for a 32×32 viewBox so it still reads at favicon size.
 */

export const BEACON_VIEWBOX = "0 0 32 32";

/** Lantern room. */
export const BEACON_LANTERN =
  "M12.15 7.35h7.7c.9 0 1.6.7 1.6 1.6v3.15c0 .9-.7 1.6-1.6 1.6h-7.7c-.9 0-1.6-.7-1.6-1.6V8.95c0-.9.7-1.6 1.6-1.6Z";

/** Tapered tower. */
export const BEACON_TOWER = "M13.25 13.55h5.5l1.85 12.05H11.4l1.85-12.05Z";

/** Foot of the tower. */
export const BEACON_BASE =
  "M9.35 25.45h13.3v2.05c0 .7-.55 1.25-1.25 1.25h-10.8c-.7 0-1.25-.55-1.25-1.25v-2.05Z";

/** Left light beam. */
export const BEACON_BEAM_LEFT = "M13.7 9.55 2.15 5.85l2.15 4.85 9.4.55Z";

/** Right light beam. */
export const BEACON_BEAM_RIGHT = "M18.3 9.55 29.85 5.85l-2.15 4.85-9.4.55Z";

export const BEACON_LIGHT = { cx: 16, cy: 10.45, r: 1.7 };

/** Circle subpath used to punch the lamp out of a mono silhouette. */
export const BEACON_LIGHT_HOLE =
  "M16 10.45m-1.7 0a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0";

/** Single-ink silhouette: tower, lantern, beams, lamp punched out. */
export const BEACON_MONO = `${BEACON_LANTERN}${BEACON_LIGHT_HOLE}${BEACON_TOWER}${BEACON_BASE}${BEACON_BEAM_LEFT}${BEACON_BEAM_RIGHT}`;
