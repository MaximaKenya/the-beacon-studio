/**
 * Path data for the four lighthouse candidates.
 * One beam each. Earlier candidates; the live mark is the smoothed lighthouse.
 */

export const LOGO_VIEWBOX = "0 0 32 32";

export const geometric = {
  roof: "M16 2.2 22.4 8.2H9.6Z",
  lantern: "M11.2 8.2H20.8V13.2H11.2Z",
  gallery: "M9.4 13.2H22.6V15.2H9.4Z",
  tower: "M12.2 15.2H19.8L21.4 26.4H10.6Z",
  base: "M8.2 26.4H23.8V29.2H8.2Z",
  beam: "M20.6 9.2 30.8 3.2 31.6 8.4 21.4 12.2Z",
  lamp: { cx: 16, cy: 10.7, r: 1.7 },
} as const;

export const striped = {
  roof: "M16 1.6 23.2 8H8.8Z",
  lantern: "M10.4 8H21.6V12.8H10.4Z",
  gallery: "M8.4 12.8H23.6V14.8H8.4Z",
  tower: "M11.2 14.8H20.8L22.4 28.6H9.6Z",
  bandA: "M11.04 16.2H20.96L21.43 20.2H10.57Z",
  bandB: "M10.3 22.6H21.7L22.17 26.6H9.83Z",
  beam: "M21.4 8.4 31.4 2 31.8 8.8 22.4 12.4Z",
  lamp: { cx: 16, cy: 10.4, r: 1.85 },
} as const;

/** Closed outline of roof, lantern, gallery, taper, and base. */
export const monoline = {
  outline: "M16 3.2 21.4 8.4V12.2H23V14.2L24.2 26.6H7.8L9 14.2V12.2H10.6V8.4Z",
  beam: "M21.6 9.2 30.4 4.2 30.8 8.6 22 12Z",
  lamp: { cx: 16, cy: 10.3, r: 1.45 },
  strokeWidth: 2.2,
} as const;

export const badge = {
  ringR: 13.35,
  roof: "M16 6.2 20.2 10.2H11.8Z",
  lantern: "M12.8 10.2H19.2V14H12.8Z",
  gallery: "M11.4 14H20.6V15.6H11.4Z",
  tower: "M13.2 15.6H18.8L19.8 23.4H12.2Z",
  base: "M10.8 23.4H21.2V25.4H10.8Z",
  beam: "M19 11 25.2 7.6 25.6 12.2 19.6 13.6Z",
  lamp: { cx: 16, cy: 12.1, r: 1.35 },
  ringWidth: 2.35,
} as const;
