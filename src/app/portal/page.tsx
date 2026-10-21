"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarClock,
  LogOut,
  MessageSquare,
  Star,
} from "lucide-react";
import { ChatPanel } from "@/components/portal/ChatPanel";
import { ClientProjectBoard } from "@/components/portal/ClientProjectBoard";
import { DocumentActions } from "@/components/documents/DocumentActions";
import { PayButton } from "@/components/features/PayButton";
import { PortalAutomations } from "@/components/automations/PortalAutomations";
import { formatNairobi, formatNairobiDate } from "@/lib/time";
import { parseResponseJson } from "@/lib/safe-json";
import type { ProjectRecord } from "@/lib/projects";
import type { QuotationRecord, ReceiptRecord } from "@/lib/documents";

type PortalPayload = {
  project: ProjectRecord;
  projects?: ProjectRecord[];
  client: { id: string; name: string; email: string; company?: string } | null;
  quotation: QuotationRecord | null;
  receipts: ReceiptRecord[];
  unreadMessages: number;
  nextPaymentDays: number | null;
};

export default function PortalDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<PortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [mailboxClient, setMailboxClient] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const auth = await fetch("/api/portal/auth", { cache: "no-store" });
    const authData = await parseResponseJson<{ authenticated?: boolean }>(auth, {});
    if (!authData.authenticated) {
      router.replace("/portal/login");
      return;
    }
    const query = focusId ? `?projectId=${encodeURIComponent(focusId)}` : "";
    const res = await fetch(`/api/portal/project${query}`);
    if (res.status === 401) {
      router.replace("/portal/login");
      return;
    }
    const payload = await parseResponseJson<PortalPayload & { error?: string }>(res, {
      project: null as unknown as ProjectRecord,
      client: null,
      quotation: null,
      receipts: [],
      unreadMessages: 0,
      nextPaymentDays: null,
    });
    if (!res.ok || !payload.project) {
      const sessionRes = await fetch("/api/portal/auth", { cache: "no-store" });
      const session = await parseResponseJson<{
        authenticated?: boolean;
        client?: { id: string; name: string; email: string };
      }>(sessionRes, {});
      if (session.authenticated && session.client) {
        setMailboxClient(session.client);
        setData(null);
      }
      setLoading(false);
      return;
    }
    setData(payload);
    setLoading(false);
  }, [router, focusId]);

  useEffect(() => {
    const kick = window.setTimeout(() => {
      void load();
    }, 0);
    const id = window.setInterval(() => void load(), 8000);
    return () => {
      window.clearTimeout(kick);
      window.clearInterval(id);
    };
  }, [load]);

  async function logout() {
    await fetch("/api/portal/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ action: "logout" }),
    });
    router.replace("/portal/login");
  }

  async function submitReview(e: FormEvent) {
    e.preventDefault();
    if (!data?.project || !comment.trim()) return;
    const res = await fetch("/api/portal/project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: data.project.id,
        rating,
        comment: comment.trim(),
      }),
    });
    if (res.ok) {
      setComment("");
      setReviewMsg("Thanks — we read every review. It stays private until we approve it.");
      await load();
    } else {
      setReviewMsg("Could not save review. Try again.");
    }
  }

  if (loading) {
    return (
      <p className="py-24 text-center text-sm text-muted">Loading your project…</p>
    );
  }

  if (!data?.project) {
    if (mailboxClient) {
      return (
        <div className="space-y-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Welcome, {mailboxClient.name.split(" ")[0]}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground">Messages</h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              There is no active project on this account yet. Replies from the studio show up here.
            </p>
          </div>
          <ChatPanel projectId={`client:${mailboxClient.id}`} viewer="client" />
          <PortalAutomations />
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm text-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      );
    }
    return (
      <div className="py-20 text-center">
        <p className="text-foreground">No project found for this account.</p>
        <div className="mx-auto mt-8 max-w-3xl text-left">
          <PortalAutomations />
        </div>
        <Link href="/" className="mt-4 inline-block text-accent hover:underline">
          Start a project on the site
        </Link>
      </div>
    );
  }

  const { project, quotation, receipts, nextPaymentDays, unreadMessages, client } = data;
  const projects = data.projects?.length ? data.projects : [project];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Welcome{client ? `, ${client.name.split(" ")[0]}` : ""}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
            {project.title}
          </h1>
          <p className="mt-1 text-sm capitalize text-muted">
            Status: <span className="text-accent">{project.status}</span>
            {unreadMessages > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                <MessageSquare className="h-3 w-3" />
                {unreadMessages} unread
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm text-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <ClientProjectBoard
        projects={projects}
        selectedId={project.id}
        onSelect={(id) => setFocusId(id)}
      />

      <section className="rounded-2xl border border-border bg-gradient-to-br from-accent/8 to-surface/50 p-6">
        <div className="flex items-start gap-3">
          <CalendarClock className="h-5 w-5 text-accent" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Next payment
            </h2>
            {project.nextPaymentDate ? (
              <>
                <p className="mt-1 text-sm text-foreground">
                  Expected {formatNairobiDate(project.nextPaymentDate)}
                  {project.nextPaymentAmount != null && (
                    <>
                      {" "}
                      · {project.nextPaymentCurrency ?? "USD"}{" "}
                      {project.nextPaymentAmount}
                    </>
                  )}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {nextPaymentDays == null
                    ? "—"
                    : nextPaymentDays > 0
                      ? `in ${nextPaymentDays} day${nextPaymentDays === 1 ? "" : "s"}`
                      : nextPaymentDays === 0
                        ? "due today"
                        : `${Math.abs(nextPaymentDays)} day(s) overdue`}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">
                No scheduled date — you can still pay a deposit below.
              </p>
            )}
            {project.costFrom || project.costTo ? (
              <div className="mt-4 max-w-sm">
                <PayButton
                  tierId="sprint"
                  mode="deposit"
                  variant="primary"
                  projectId={project.id}
                  label="Pay deposit"
                />
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                This work is quoted after a free assessment. There is no price to pay yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface/60 p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Documents
          </h2>
          <div className="mt-4 space-y-4">
            {quotation ? (
              <div>
                <p className="mb-2 text-sm text-muted">Quotation</p>
                <DocumentActions kind="quotation" record={quotation} />
              </div>
            ) : (
              <p className="text-sm text-muted">Quotation will appear after intake processing.</p>
            )}
            {receipts.length > 0 && (
              <div className="space-y-3 border-t border-border/60 pt-4">
                <p className="text-sm text-muted">Receipts</p>
                {receipts.map((r) => (
                  <div key={r.id}>
                    <p className="mb-1 font-mono text-[10px] text-muted">
                      {r.reference} · {formatNairobi(r.createdAt)}
                    </p>
                    <DocumentActions kind="receipt" record={r} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <ChatPanel projectId={project.id} viewer="client" />
      </div>

      <PortalAutomations />

      <section className="rounded-2xl border border-border bg-surface/60 p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Your reviews
        </h2>
        <ul className="mt-3 space-y-2">
          {project.reviews.length === 0 && (
            <li className="text-sm text-muted">No reviews yet — share how progress feels.</li>
          )}
          {project.reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm"
            >
              <div className="flex items-center gap-1 text-accent">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-1 text-foreground">{r.comment}</p>
              <p className="mt-1 font-mono text-[10px] text-muted">
                {r.author} · {formatNairobi(r.at)} ·{" "}
                {r.visibility === "approved"
                  ? "public"
                  : r.visibility === "hidden"
                    ? "hidden"
                    : "waiting for approval"}
              </p>
            </li>
          ))}
        </ul>
        <form onSubmit={submitReview} className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="How is the build going from your side?"
            className="w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm focus:border-accent/50 focus:outline-none"
          />
          {reviewMsg && <p className="text-xs text-muted">{reviewMsg}</p>}
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover"
          >
            Submit review
          </button>
        </form>
      </section>
    </div>
  );
}
