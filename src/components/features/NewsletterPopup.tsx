"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, X } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";
import { fetchWithTimeout, FetchTimeoutError } from "@/lib/fetch-with-timeout";
import { fireConfetti } from "@/lib/confetti";
import { parseResponseJson } from "@/lib/safe-json";

const DISMISS_KEY = "portfolio-newsletter-dismissed";
const SUBSCRIBE_KEY = "portfolio-newsletter-subscribed";
const SESSION_KEY = "portfolio-newsletter-session-shown";
const SUBSCRIBE_TIMEOUT_MS = 8_000;

type FormStatus = "idle" | "submitting" | "success" | "error";

function shouldAutoOpen(): boolean {
  try {
    if (localStorage.getItem(DISMISS_KEY) === "true") return false;
    if (localStorage.getItem(SUBSCRIBE_KEY) === "true") return false;
    if (sessionStorage.getItem(SESSION_KEY) === "true") return false;
  } catch {
    return false;
  }
  return true;
}

export function NewsletterPopup() {
  const { newsletterOpen, closeNewsletter, openNewsletter } = useFeatures();
  const reducedMotion = useReducedMotion();
  const trapRef = useFocusTrap(newsletterOpen);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!siteConfig.newsletter.enabled) return;
    if (!shouldAutoOpen()) return;

    const tryOpen = (type: "timer" | "scroll") => {
      if (triggeredRef.current) return;
      if (!shouldAutoOpen()) return;
      triggeredRef.current = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        /* ignore */
      }
      // Defer so we never set FeatureProvider state during another component's render
      queueMicrotask(() => {
        openNewsletter();
        trackEvent("newsletter_auto_trigger", { type });
      });
    };

    const delay = Math.max(siteConfig.newsletter.delayMs, 12_000);
    const timer = setTimeout(() => tryOpen("timer"), delay);

    const onScroll = () => {
      const scrollPercent =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= siteConfig.newsletter.scrollTriggerPercent / 100) {
        tryOpen("scroll");
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [openNewsletter]);

  function persistDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      /* ignore */
    }
  }

  function handleDismiss() {
    if (dontShowAgain || status === "success") {
      persistDismiss();
    }
    closeNewsletter();
    setStatus("idle");
    setErrorMsg("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetchWithTimeout(
        "/api/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, firstName: firstName || undefined }),
        },
        SUBSCRIBE_TIMEOUT_MS
      );

      const data = await parseResponseJson<{ error?: string; success?: boolean }>(res, {});

      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
      trackEvent("newsletter_subscribe", { email });
      if (!reducedMotion) fireConfetti();
      try {
        localStorage.setItem(SUBSCRIBE_KEY, "true");
        localStorage.setItem(DISMISS_KEY, "true");
      } catch {
        /* ignore */
      }
    } catch (err) {
      if (err instanceof FetchTimeoutError) {
        setErrorMsg("Request timed out. Please check your connection and try again.");
      } else {
        setErrorMsg("Network error. Please try again.");
      }
      setStatus("error");
    }
  }

  if (!siteConfig.newsletter.enabled) return null;

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
      };

  return (
    <AnimatePresence>
      {newsletterOpen && (
        <div
          className="fixed inset-0 z-[180] flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-title"
          onClick={handleDismiss}
        >
          <motion.div
            ref={trapRef}
            {...motionProps}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
              aria-label="Close newsletter popup"
            >
              <X className="h-4 w-4" />
            </button>

            {status === "success" ? (
              <div className="px-8 py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-accent" aria-hidden />
                <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                  You&apos;re in!
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Thanks for subscribing — we&apos;ll only send useful product and studio updates.
                </p>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="mt-6 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                  <Mail className="h-5 w-5 text-accent" aria-hidden />
                </div>

                <h2 id="newsletter-title" className="font-display text-xl font-semibold text-foreground">
                  {siteConfig.newsletter.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {siteConfig.newsletter.description}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="newsletter-email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={status === "submitting"}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label htmlFor="newsletter-first-name" className="sr-only">
                      First name (optional)
                    </label>
                    <input
                      id="newsletter-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name (optional)"
                      autoComplete="given-name"
                      disabled={status === "submitting"}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
                    />
                  </div>

                  {status === "error" && errorMsg && (
                    <p className="text-sm text-accent-warm" role="alert">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background transition-all hover:bg-accent-hover disabled:opacity-60"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Subscribing...
                      </>
                    ) : (
                      siteConfig.newsletter.ctaText
                    )}
                  </button>
                </form>

                <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="rounded border-border accent-accent"
                  />
                  Don&apos;t show this again
                </label>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
