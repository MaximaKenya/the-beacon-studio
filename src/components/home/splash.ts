/** Session flag. Set after the splash is shown so a refresh does not replay it. */
export const SPLASH_STORAGE_KEY = "beacon-splash-seen";

/** Intro (rise, ignite, bloom) finishes near 1.45s. Hold, then fade. */
export const SPLASH_HOLD_MS = 1850;
export const SPLASH_EXIT_MS = 450;

/** Reduced motion shows the finished mark, then leaves. */
export const SPLASH_REDUCED_HOLD_MS = 700;
export const SPLASH_REDUCED_EXIT_MS = 0;

/** A tap or click shortens the fade. */
export const SPLASH_SKIP_MS = 220;

const BLOCKED_PREFIXES = ["/admin", "/portal", "/api"] as const;

export type SplashDecision = {
  show: boolean;
  animated: boolean;
  holdMs: number;
  exitMs: number;
};

export function isBlockedSplashPath(pathname: string): boolean {
  return BLOCKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Homepage only. Admin, the portal, and API routes never qualify. */
export function isHomeSplashPath(pathname: string | null | undefined): boolean {
  return pathname === "/" && !isBlockedSplashPath(pathname);
}

export function splashDecision(input: {
  pathname: string;
  seen: boolean;
  reducedMotion: boolean;
}): SplashDecision {
  if (!isHomeSplashPath(input.pathname) || input.seen) {
    return { show: false, animated: false, holdMs: 0, exitMs: 0 };
  }
  if (input.reducedMotion) {
    return {
      show: true,
      animated: false,
      holdMs: SPLASH_REDUCED_HOLD_MS,
      exitMs: SPLASH_REDUCED_EXIT_MS,
    };
  }
  return {
    show: true,
    animated: true,
    holdMs: SPLASH_HOLD_MS,
    exitMs: SPLASH_EXIT_MS,
  };
}

export function splashTotalMs(decision: SplashDecision): number {
  return decision.holdMs + decision.exitMs;
}

export function splashAlreadySeen(): boolean {
  try {
    return window.sessionStorage.getItem(SPLASH_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSplashSeen(): void {
  try {
    window.sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
  } catch {
    // Private browsing can throw. The intro still ends.
  }
}
