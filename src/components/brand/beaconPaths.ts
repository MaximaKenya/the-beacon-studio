/**
 * Beacon mark — a standalone lighthouse with one light beam.
 * The tower uses currentColor (or an explicit ink). The lamp, daymark band,
 * and beam use the accent. Drawn on a 32×32 viewBox so it still reads at 16px.
 *
 * The previous mark put a matching wedge on each side of the lantern. Those
 * wedges were meant as left and right light beams, and at small sizes they
 * read as wings. This mark keeps a single beam that leaves the lamp and
 * widens toward the upper right.
 */

export const BEACON_VIEWBOX = "0 0 32 32";

/** Pointed lantern roof. */
export const BEACON_ROOF = "M16 1.8 21.4 7.4H10.6Z";

/** Lantern room. */
export const BEACON_LANTERN = "M11.4 7.2H20.6V12.6H11.4Z";

/** Gallery under the lantern. */
export const BEACON_GALLERY = "M9.8 12.6H22.2V14.2H9.8Z";

/** Tapered tower. */
export const BEACON_TOWER = "M12.2 14.2H19.8L21.2 26.2H10.8Z";

/** Daymark band on the tower. */
export const BEACON_BAND = "M11.9 18.9H20.1L20.3 20.4H11.7Z";

/** Foot of the tower. */
export const BEACON_BASE = "M8.6 26.2H23.4V28.6H8.6Z";

/**
 * Wide beam, drawn behind the tower so it appears to leave the lamp.
 * Starts inside the lantern and opens toward the upper right.
 */
export const BEACON_BEAM = "M16.8 9.2 30.2 1.2 31.6 6.6 18.2 11.4Z";

/** Brighter core of the same beam. */
export const BEACON_BEAM_CORE = "M17.2 9.6 28.4 3.6 29.4 6.2 18 10.8Z";

/**
 * Beam used in the one-ink silhouette. It shares only the lantern's right
 * edge, so an even-odd fill does not punch a hole through the room.
 */
export const BEACON_BEAM_MONO = "M20.6 8.4 30.2 1.2 31.6 6.4 20.6 11Z";

export const BEACON_LIGHT = { cx: 16, cy: 9.9, r: 1.65 };

/** Circle subpath used to punch the lamp out of a mono silhouette. */
export const BEACON_LIGHT_HOLE =
  "M16 9.9m-1.65 0a1.65 1.65 0 1 0 3.3 0a1.65 1.65 0 1 0-3.3 0";

/** Single-ink silhouette. The lamp and the daymark band are punched out. */
export const BEACON_MONO = `${BEACON_BEAM_MONO}${BEACON_ROOF}${BEACON_LANTERN}${BEACON_LIGHT_HOLE}${BEACON_GALLERY}${BEACON_TOWER}${BEACON_BAND}${BEACON_BASE}`;
