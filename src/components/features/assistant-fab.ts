/**
 * Placement for the studio assistant launcher.
 * The button is a frosted pill on desktop. On a phone it keeps the lighthouse
 * and the name when that pill clears the CTAs, and otherwise stays a logo
 * that only grows into the name when the wider pill also clears them.
 * Fixed CTAs stay clickable even if a measurement is a frame late: the
 * launcher paints underneath them.
 */

export const ASSISTANT_BRAND_NAME = "The Beacon Studio";
export const ASSISTANT_SUBTITLE = "AI assistant";
export const ASSISTANT_DIALOG_LABEL = "The Beacon Studio AI assistant";
export const ASSISTANT_FAB_SEEN_KEY = "beacon-assistant-fab-named";
export const ASSISTANT_FAB_INTRO_MS = 720;
export const ASSISTANT_DESKTOP_MIN = 768;
export const ASSISTANT_FAB_GAP = 20;
export const ASSISTANT_FAB_EDGE = 16;

export const ASSISTANT_FAB_BOX = {
  pill: { w: 244, h: 52 },
  compact: { w: 204, h: 48 },
  expanded: { w: 204, h: 48 },
  mark: { w: 52, h: 52 },
} as const;

export type AssistantFabMode = keyof typeof ASSISTANT_FAB_BOX;
export type FabSide = "left" | "right";

export type Box = { x: number; y: number; w: number; h: number };

export type FabPlacement = {
  x: number;
  y: number;
  side: FabSide;
  clear: boolean;
};

export function showsPublicAssistant(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  return !(
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/portal")
  );
}

export function boxesOverlap(a: Box, b: Box, gap = 0): boolean {
  const separated =
    a.x + a.w + gap <= b.x ||
    b.x + b.w + gap <= a.x ||
    a.y + a.h + gap <= b.y ||
    b.y + b.h + gap <= a.y;
  return !separated;
}

function usableObstacles(obstacles: Box[]): Box[] {
  return obstacles.filter((box) => box.w > 0 && box.h > 0);
}

export function placeAssistantFab(input: {
  viewport: { w: number; h: number };
  fab: { w: number; h: number };
  obstacles: Box[];
  gap?: number;
  edge?: number;
}): FabPlacement {
  const gap = input.gap ?? ASSISTANT_FAB_GAP;
  const edge = input.edge ?? ASSISTANT_FAB_EDGE;
  const obstacles = usableObstacles(input.obstacles);
  const minY = 72;
  const spots: Array<{ x: number; y: number }> = [];

  for (let y = input.viewport.h - edge - input.fab.h; y >= minY; y -= 12) {
    const right = input.viewport.w - edge - input.fab.w;
    spots.push({ x: Math.max(edge, right), y });
    spots.push({ x: edge, y });
  }

  const fit = (spot: { x: number; y: number }): FabPlacement | null => {
    if (spot.x + input.fab.w > input.viewport.w - edge + 0.5) return null;
    if (spot.y + input.fab.h > input.viewport.h - edge + 0.5) return null;
    const box = { x: spot.x, y: spot.y, w: input.fab.w, h: input.fab.h };
    if (obstacles.some((obstacle) => boxesOverlap(box, obstacle, gap))) return null;
    const side: FabSide = spot.x + input.fab.w / 2 > input.viewport.w / 2 ? "right" : "left";
    return { x: spot.x, y: spot.y, side, clear: true };
  };

  for (const spot of spots) {
    const placed = fit(spot);
    if (placed) return placed;
  }

  const fallback = {
    x: Math.max(edge, input.viewport.w - edge - input.fab.w),
    y: minY,
  };
  const fallbackBox = { ...fallback, w: input.fab.w, h: input.fab.h };
  const clear = !obstacles.some((obstacle) => boxesOverlap(fallbackBox, obstacle, gap));
  const side: FabSide = fallback.x + input.fab.w / 2 > input.viewport.w / 2 ? "right" : "left";
  return { ...fallback, side, clear };
}

export function resolveAssistantFab(input: {
  viewport: { w: number; h: number };
  obstacles: Box[];
  introduced: boolean;
  reducedMotion: boolean;
}): FabPlacement & { mode: AssistantFabMode; width: number; height: number } {
  const place = (mode: AssistantFabMode) =>
    placeAssistantFab({
      viewport: input.viewport,
      fab: ASSISTANT_FAB_BOX[mode],
      obstacles: input.obstacles,
    });

  const withSize = (mode: AssistantFabMode, placed: FabPlacement) => ({
    ...placed,
    mode,
    width: ASSISTANT_FAB_BOX[mode === "expanded" ? "compact" : mode].w,
    height: ASSISTANT_FAB_BOX[mode === "expanded" ? "compact" : mode].h,
  });

  if (input.viewport.w >= ASSISTANT_DESKTOP_MIN) {
    return withSize("pill", place("pill"));
  }

  const compact = place("compact");
  if (compact.clear) {
    const mode: AssistantFabMode = !input.introduced && !input.reducedMotion ? "expanded" : "compact";
    return withSize(mode, compact);
  }

  return withSize("mark", place("mark"));
}

export function placeAssistantPanel(input: {
  viewport: { w: number; h: number };
  obstacles: Box[];
  gap?: number;
  edge?: number;
}): { left: number; bottom: number; width: number; maxHeight: number } {
  const gap = input.gap ?? ASSISTANT_FAB_GAP;
  const edge = input.edge ?? ASSISTANT_FAB_EDGE;
  const width = Math.min(384, Math.max(0, input.viewport.w - edge * 2));
  const left = Math.max(edge, input.viewport.w - edge - width);
  let bottom = edge;

  for (const obstacle of usableObstacles(input.obstacles)) {
    const inLowerHalf = obstacle.y > input.viewport.h * 0.35;
    if (!inLowerHalf) continue;
    const overlapsX = obstacle.x < left + width && obstacle.x + obstacle.w > left;
    if (!overlapsX) continue;
    bottom = Math.max(bottom, input.viewport.h - obstacle.y + gap);
  }

  const headerReserve = 72;
  let maxHeight = Math.min(520, input.viewport.h - bottom - headerReserve);
  if (maxHeight < 200) {
    maxHeight = Math.min(520, Math.max(160, input.viewport.h - headerReserve - edge));
    bottom = Math.max(edge, input.viewport.h - headerReserve - maxHeight);
  }

  return { left, bottom, width, maxHeight };
}

export function assistantFabBox(placement: { x: number; y: number; width: number; height: number }): Box {
  return { x: placement.x, y: placement.y, w: placement.width, h: placement.height };
}

export function assistantPanelBox(
  viewportH: number,
  panel: { left: number; bottom: number; width: number; maxHeight: number }
): Box {
  return {
    x: panel.left,
    y: viewportH - panel.bottom - panel.maxHeight,
    w: panel.width,
    h: panel.maxHeight,
  };
}
