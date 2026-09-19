type EventProps = Record<string, string | number | boolean | undefined>;

/**
 * Client analytics — logs in dev, dispatches local event, and POSTs to /api/analytics.
 * Side effects are deferred so we never update parents during another component's render.
 */
export function trackEvent(name: string, props?: EventProps) {
  if (typeof window === "undefined") return;

  const run = () => {
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics]", name, props);
    }

    window.dispatchEvent(
      new CustomEvent("portfolio:analytics", { detail: { name, props } })
    );

    const payload = {
      name,
      props: props ?? {},
      path: window.location.pathname,
      ts: Date.now(),
      visitorId: getVisitorId(),
    };

    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/analytics", blob);
      } else {
        void fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    } catch {
      // analytics must never break UX
    }
  };

  // Defer past the current render/commit to avoid "setState before mount" cascades
  if (typeof queueMicrotask === "function") {
    queueMicrotask(run);
  } else {
    setTimeout(run, 0);
  }
}

function getVisitorId(): string {
  try {
    const key = "beacon_vid";
    let id = localStorage.getItem(key);
    if (!id) {
      id = `v_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}
