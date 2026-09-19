"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { BeaconMark } from "@/components/brand/BeaconMark";
import { siteConfig } from "@/data/site";
import { parseResponseJson } from "@/lib/safe-json";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = search.get("token");
    if (!token) return;
    void (async () => {
      setBusy(true);
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "token", token }),
      });
      const data = await parseResponseJson<{ error?: string }>(res, {});
      setBusy(false);
      if (res.ok) {
        router.replace("/portal");
      } else {
        setError(data.error || "Invalid access link.");
      }
    })();
  }, [search, router]);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/portal/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request-code", email }),
    });
    const data = await parseResponseJson<{
      error?: string;
      code?: string;
      emailConfigured?: boolean;
    }>(res, {});
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not send code.");
      return;
    }
    const configured = Boolean(data.emailConfigured);
    const onScreen = typeof data.code === "string" ? data.code : null;
    setEmailConfigured(configured);
    setIssuedCode(onScreen);
    if (onScreen) setCode(onScreen);
    setStep("code");
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/portal/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify-code", email, code }),
    });
    const data = await parseResponseJson<{ error?: string }>(res, {});
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Invalid code.");
      return;
    }
    router.replace("/portal");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface text-foreground">
          <BeaconMark size={36} staticGlow />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Client portal
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sign in with the email from your project intake — we&apos;ll issue a one-time code.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface/70 p-6 shadow-sm">
        {step === "email" ? (
          <form onSubmit={requestCode} className="space-y-4">
            <div>
              <label htmlFor="portal-email" className="mb-1.5 block text-xs text-muted">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="portal-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-10 pr-4 text-sm focus:border-accent/50 focus:outline-none"
                  autoComplete="email"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-accent-warm" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Get one-time code
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <p className="text-sm text-muted">
              Code issued for <span className="text-foreground">{email}</span>
            </p>

            {!emailConfigured && (
              <div
                className="rounded-2xl border border-accent-amber/40 bg-accent-amber/10 px-3.5 py-3 text-sm text-foreground"
                role="status"
              >
                <p className="font-medium">Email delivery not configured</p>
                <p className="mt-1 text-xs text-muted">
                  Resend is optional. Use the one-time code shown below — no inbox required.
                  Add <code className="font-mono text-[11px]">RESEND_API_KEY</code> later to
                  email codes (see README).
                </p>
              </div>
            )}

            {issuedCode && (
              <div
                className="rounded-2xl border-2 border-accent/40 bg-accent/10 px-4 py-4 text-center"
                role="status"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Your one-time code
                </p>
                <p className="mt-2 font-mono text-3xl font-bold tracking-[0.35em] text-accent">
                  {issuedCode}
                </p>
                <p className="mt-2 text-xs text-muted">
                  Prefilled below — tap Enter portal to continue.
                </p>
              </div>
            )}

            {emailConfigured && !issuedCode && (
              <p className="rounded-2xl border border-border bg-background/40 px-3 py-2.5 text-sm text-muted">
                Check your inbox for the one-time code (also check spam).
              </p>
            )}

            <div>
              <label htmlFor="portal-code" className="mb-1.5 block text-xs text-muted">
                One-time code
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="portal-code"
                  inputMode="numeric"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-10 pr-4 font-mono text-sm tracking-widest focus:border-accent/50 focus:outline-none"
                  autoComplete="one-time-code"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-accent-warm" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enter portal
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setIssuedCode(null);
              }}
              className="w-full text-center text-xs text-muted hover:text-foreground"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        New here?{" "}
        <Link href="/#contact" className="text-accent hover:underline">
          Start a project
        </Link>{" "}
        on {siteConfig.brand.name} to get portal access.
      </p>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <p className="py-20 text-center text-sm text-muted">Loading…</p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
