"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  Calendar,
  Check,
  CreditCard,
  FileText,
  Inbox,
  Mail,
  MessageSquare,
  Smile,
  Users,
  X,
} from "lucide-react";
import type { PaymentRecord } from "@/lib/payments";
import { formatNairobi } from "@/lib/time";
import { DocumentActions } from "@/components/documents/DocumentActions";
import { ChatPanel } from "@/components/portal/ChatPanel";
import type { QuotationRecord } from "@/lib/documents";
import { parseResponseJson } from "@/lib/safe-json";

type Booking = {
  id?: string;
  createdAt?: string;
  name?: string;
  email?: string;
  type?: string;
  meetingType?: string;
  notes?: string;
  message?: string;
  date?: string;
  time?: string;
  status?: string;
  adminNotes?: string;
  rescheduleNote?: string;
  read?: boolean;
};

type Intake = {
  id?: string;
  createdAt?: string;
  submittedAt?: string;
  name?: string;
  email?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  brief?: string;
  company?: string;
  status?: string;
  contacted?: boolean;
  projectId?: string;
  adminNotes?: string;
  read?: boolean;
};

type Subscriber = {
  id?: string;
  email?: string;
  createdAt?: string;
  subscribedAt?: string;
  firstName?: string;
  read?: boolean;
};

type Contact = {
  id?: string;
  createdAt?: string;
  name?: string;
  email?: string;
  message?: string;
  read?: boolean;
  replied?: boolean;
  archived?: boolean;
  status?: string;
};

type Reaction = {
  emoji?: string;
  sentiment?: string;
  ts?: string | number;
  visitorId?: string;
  path?: string;
};

export type AdminOpsData = {
  bookings: Booking[];
  intakes: Intake[];
  subscribers: Subscriber[];
  payments: PaymentRecord[];
  contacts: Contact[];
  reactions: Reaction[];
  attention: {
    id: string;
    kind: string;
    title: string;
    detail: string;
    at: string;
    refId?: string;
  }[];
  badges: {
    bookings: number;
    intakes: number;
    subscribers: number;
    payments: number;
    contacts: number;
    reactions: number;
  };
};

type DrawerKind =
  | { type: "booking"; item: Booking }
  | { type: "intake"; item: Intake }
  | { type: "payment"; item: PaymentRecord }
  | { type: "contact"; item: Contact }
  | { type: "subscriber"; item: Subscriber }
  | { type: "reaction"; item: Reaction }
  | { type: "attention"; item: AdminOpsData["attention"][0] }
  | { type: "project-chat"; projectId: string; title?: string }
  | null;

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold text-background">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted">{children}</p>;
}

function when(iso?: string | number) {
  if (iso == null || iso === "") return "—";
  try {
    if (typeof iso === "number") return formatNairobi(new Date(iso).toISOString());
    return formatNairobi(iso);
  } catch {
    return String(iso);
  }
}

async function opsAction(payload: Record<string, unknown>) {
  const res = await fetch("/api/admin/ops", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponseJson<Record<string, unknown>>(res, {});
  if (!res.ok) throw new Error(String(data.error ?? "Action failed"));
  return data;
}

export function AdminOpsHub({
  ops,
  onMarkRead,
  onRefresh,
}: {
  ops: AdminOpsData;
  onMarkRead: (collection: string, id?: string, markAll?: boolean) => void;
  onRefresh: () => void;
}) {
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [msgProjectId, setMsgProjectId] = useState<string | null>(null);
  const [lastQuote, setLastQuote] = useState<QuotationRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const reactions = useMemo(() => {
    if (sentimentFilter === "all") return ops.reactions;
    return ops.reactions.filter((r) => r.sentiment === sentimentFilter);
  }, [ops.reactions, sentimentFilter]);

  async function run(action: Record<string, unknown>, successMsg?: string) {
    setBusy(true);
    try {
      const data = await opsAction(action);
      if (data.quotation) setLastQuote(data.quotation as QuotationRecord);
      setToast(successMsg ?? "Saved");
      onRefresh();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function exportCsv() {
    const res = await fetch("/api/admin/ops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "subscriber.export" }),
    });
    if (!res.ok) {
      setToast("Export failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beacon-subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("CSV downloaded");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Operations
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
            Inbox & ops hub
          </h2>
          <p className="mt-1 text-sm text-muted">
            Click any row for details and actions. Projects sync live to the client portal.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/portal" className="text-sm text-accent hover:underline">
            Client portal →
          </Link>
          <Link href="/" className="text-sm text-accent hover:underline">
            ← Back to site
          </Link>
        </div>
      </div>

      {toast && (
        <p className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-accent">
          {toast}
        </p>
      )}

      {/* Needs attention */}
      <div className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/8 to-surface/40 p-5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent" />
          <h3 className="font-display text-lg font-semibold text-foreground">
            Needs attention
          </h3>
          <Badge
            count={
              ops.badges.bookings +
              ops.badges.intakes +
              ops.badges.payments +
              ops.badges.contacts
            }
          />
        </div>
        {ops.attention.length === 0 ? (
          <Empty>All clear — no unread items.</Empty>
        ) : (
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {ops.attention.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    // Open the matching actionable panel when possible
                    if (item.kind === "booking") {
                      const hit = ops.bookings.find(
                        (b) => b.id === item.refId || `book-${b.id}` === item.id
                      );
                      if (hit) {
                        setNote(hit.adminNotes ?? "");
                        setDrawer({ type: "booking", item: hit });
                        return;
                      }
                    }
                    if (item.kind === "intake") {
                      const hit = ops.intakes.find(
                        (i) => i.id === item.refId || `intake-${i.id}` === item.id
                      );
                      if (hit) {
                        setNote(hit.adminNotes ?? "");
                        setDrawer({ type: "intake", item: hit });
                        return;
                      }
                    }
                    if (item.kind === "payment") {
                      const hit = ops.payments.find(
                        (p) => p.id === item.refId || `pay-${p.id}` === item.id
                      );
                      if (hit) {
                        setDrawer({ type: "payment", item: hit });
                        return;
                      }
                    }
                    if (item.kind === "contact") {
                      const hit = ops.contacts.find(
                        (c) => c.id === item.refId || `contact-${c.id}` === item.id
                      );
                      if (hit) {
                        setDrawer({ type: "contact", item: hit });
                        return;
                      }
                    }
                    if (item.kind === "subscriber") {
                      const hit = ops.subscribers.find(
                        (s) =>
                          s.id === item.refId ||
                          s.email === item.refId ||
                          s.email === item.detail
                      );
                      if (hit) {
                        setDrawer({ type: "subscriber", item: hit });
                        return;
                      }
                    }
                    if (item.kind === "reaction") {
                      const hit = ops.reactions.find(
                        (r) => `vibe-${r.ts}-${r.emoji}` === item.id
                      );
                      if (hit) {
                        setDrawer({ type: "reaction", item: hit });
                        return;
                      }
                    }
                    setDrawer({ type: "attention", item });
                  }}
                  className="flex w-full flex-wrap items-start justify-between gap-2 rounded-xl border border-border/70 bg-background/50 px-4 py-3 text-left transition hover:border-accent/40"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{item.detail}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted/80">{when(item.at)}</p>
                  </div>
                  <span className="rounded-md border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                    {item.kind}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bookings */}
        <section className="rounded-2xl border border-border bg-surface/40 p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              <h3 className="font-display text-lg font-semibold text-foreground">Bookings</h3>
              <Badge count={ops.badges.bookings} />
            </div>
            {ops.bookings.length > 0 && (
              <button
                type="button"
                onClick={() => onMarkRead("bookings", undefined, true)}
                className="text-xs text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          {ops.bookings.length === 0 ? (
            <Empty>No bookings yet.</Empty>
          ) : (
            <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
              {ops.bookings.slice(0, 20).map((b) => (
                <li key={b.id ?? b.createdAt}>
                  <button
                    type="button"
                    onClick={() => {
                      setNote(b.adminNotes ?? "");
                      setDrawer({ type: "booking", item: b });
                    }}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition hover:border-accent/40 ${
                      b.read !== true
                        ? "border-accent/30 bg-accent/5"
                        : "border-border/60 bg-background/30"
                    }`}
                  >
                    <p className="font-medium text-foreground">
                      {b.name ?? "Guest"} · {b.meetingType ?? b.type ?? "call"}
                    </p>
                    <p className="text-xs text-muted">{b.email}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted">
                      {when(b.createdAt)}
                      {b.status ? ` · ${b.status}` : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Intakes */}
        <section className="rounded-2xl border border-border bg-surface/40 p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Project intakes
              </h3>
              <Badge count={ops.badges.intakes} />
            </div>
            {ops.intakes.length > 0 && (
              <button
                type="button"
                onClick={() => onMarkRead("intakes", undefined, true)}
                className="text-xs text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          {ops.intakes.length === 0 ? (
            <Empty>No Start a Project submissions yet.</Empty>
          ) : (
            <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
              {ops.intakes.slice(0, 20).map((i) => (
                <li key={i.id ?? i.createdAt}>
                  <button
                    type="button"
                    onClick={() => {
                      setNote(i.adminNotes ?? "");
                      setDrawer({ type: "intake", item: i });
                    }}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition hover:border-accent/40 ${
                      i.read !== true
                        ? "border-accent/30 bg-accent/5"
                        : "border-border/60 bg-background/30"
                    }`}
                  >
                    <p className="font-medium text-foreground">{i.name ?? "Guest"}</p>
                    <p className="text-xs text-muted">
                      {i.email} · {i.projectType} · {i.budget}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-muted">
                      {when(i.submittedAt ?? i.createdAt)}
                      {i.status ? ` · ${i.status}` : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Payments */}
        <section className="rounded-2xl border border-border bg-surface/40 p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Payments (Stripe / M-Pesa)
              </h3>
              <Badge count={ops.badges.payments} />
            </div>
            {ops.payments.length > 0 && (
              <button
                type="button"
                onClick={() => onMarkRead("payments", undefined, true)}
                className="text-xs text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          {ops.payments.length === 0 ? (
            <Empty>No payments recorded yet.</Empty>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-2 font-medium">When</th>
                    <th className="py-2 font-medium">Provider</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Tier</th>
                    <th className="py-2 font-medium">Amount</th>
                    <th className="py-2 font-medium">Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {ops.payments.slice(0, 40).map((p) => (
                    <tr
                      key={p.id}
                      className="cursor-pointer border-b border-border/50 hover:bg-accent/5"
                      onClick={() => setDrawer({ type: "payment", item: p })}
                    >
                      <td className="py-2 font-mono text-[11px] text-muted">
                        {when(p.createdAt)}
                      </td>
                      <td className="py-2 capitalize">{p.provider}</td>
                      <td className="py-2">
                        <span
                          className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase ${
                            p.status === "success"
                              ? "border-emerald-500/40 text-emerald-600"
                              : p.status === "pending"
                                ? "border-amber-500/40 text-amber-600"
                                : "border-rose-400/40 text-rose-500"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2">{p.tierName}</td>
                      <td className="py-2 font-mono text-xs">
                        {p.provider === "stripe"
                          ? `$${(p.amount / 100).toFixed(2)}`
                          : `${p.amount} ${p.currency}`}
                      </td>
                      <td className="py-2 font-mono text-[10px] text-muted">
                        {p.receipt || p.checkoutRequestID || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Newsletter */}
        <section className="rounded-2xl border border-border bg-surface/40 p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              <h3 className="font-display text-lg font-semibold text-foreground">Newsletter</h3>
              <Badge count={ops.badges.subscribers} />
            </div>
            <button
              type="button"
              onClick={() => void exportCsv()}
              className="text-xs text-accent hover:underline"
            >
              Export CSV
            </button>
          </div>
          {ops.subscribers.length === 0 ? (
            <Empty>No subscribers yet.</Empty>
          ) : (
            <ul className="mt-4 max-h-48 space-y-1.5 overflow-y-auto">
              {ops.subscribers.slice(0, 30).map((s) => (
                <li key={s.id ?? s.email}>
                  <button
                    type="button"
                    onClick={() => setDrawer({ type: "subscriber", item: s })}
                    className="flex w-full justify-between gap-2 rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-left text-sm hover:border-accent/40"
                  >
                    <span className="truncate text-foreground">{s.email}</span>
                    <span className="shrink-0 font-mono text-[10px] text-muted">
                      {when(s.subscribedAt ?? s.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Contacts */}
        <section className="rounded-2xl border border-border bg-surface/40 p-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-accent" />
            <h3 className="font-display text-lg font-semibold text-foreground">Contact form</h3>
            <Badge count={ops.badges.contacts} />
          </div>
          {ops.contacts.filter((c) => !c.archived).length === 0 ? (
            <Empty>No stored contact messages yet.</Empty>
          ) : (
            <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
              {ops.contacts
                .filter((c) => !c.archived)
                .slice(0, 20)
                .map((c) => (
                  <li key={c.id ?? c.createdAt}>
                    <button
                      type="button"
                      onClick={() => setDrawer({ type: "contact", item: c })}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm hover:border-accent/40 ${
                        c.read !== true
                          ? "border-accent/30 bg-accent/5"
                          : "border-border/60 bg-background/30"
                      }`}
                    >
                      <p className="font-medium text-foreground">
                        {c.name} · {c.email}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted">{c.message}</p>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </section>

        {/* Vibes */}
        <section className="rounded-2xl border border-border bg-surface/40 p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4 text-accent" />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Vibe reactions
              </h3>
              <Badge count={ops.badges.reactions} />
            </div>
            <div className="flex gap-1">
              {["all", "positive", "neutral", "negative"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSentimentFilter(s)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-[10px] uppercase ${
                    sentimentFilter === s
                      ? "bg-accent text-background"
                      : "border border-border text-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {reactions.length === 0 ? (
            <Empty>No vibe reactions for this filter.</Empty>
          ) : (
            <ul className="mt-4 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
              {reactions.map((r, i) => (
                <li key={`${r.ts}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setDrawer({ type: "reaction", item: r })}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-sm hover:border-accent/40"
                  >
                    <span className="text-lg">{r.emoji}</span>
                    <span className="font-mono text-[10px] text-muted">
                      {r.sentiment} · {when(r.ts)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Messaging shortcut */}
      <section className="rounded-2xl border border-border bg-surface/40 p-5">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Project messaging
        </h3>
        <p className="mt-1 text-sm text-muted">
          Open a converted intake&apos;s project chat, or paste a project ID.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ops.intakes
            .filter((i) => i.projectId)
            .slice(0, 6)
            .map((i) => (
              <button
                key={i.projectId}
                type="button"
                onClick={() => setMsgProjectId(String(i.projectId))}
                className="rounded-xl border border-border px-3 py-2 text-xs hover:border-accent/40"
              >
                {i.name} chat
              </button>
            ))}
        </div>
        {msgProjectId && (
          <div className="mt-4">
            <ChatPanel projectId={msgProjectId} viewer="admin" />
          </div>
        )}
      </section>

      {lastQuote && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Latest quotation</p>
          <DocumentActions kind="quotation" record={lastQuote} />
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-muted">
        <Inbox className="h-3.5 w-3.5" />
        Data in <code className="font-mono text-foreground">data/*.json</code>
        {" · "}
        <Mail className="h-3.5 w-3.5" />
        Portal at <code className="font-mono">/portal</code>
      </p>

      {/* Detail drawer */}
      {drawer && (
        <div
          className="fixed inset-0 z-[80] flex justify-end bg-background/50 backdrop-blur-sm"
          onClick={() => setDrawer(null)}
        >
          <aside
            className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold capitalize text-foreground">
                {drawer.type.replace("-", " ")}
              </h3>
              <button
                type="button"
                onClick={() => setDrawer(null)}
                className="rounded-lg p-2 text-muted hover:bg-surface"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {drawer.type === "booking" && (
              <div className="space-y-4 text-sm">
                <p>
                  <strong>{drawer.item.name}</strong>
                  <br />
                  {drawer.item.email}
                </p>
                <p className="text-muted">
                  {drawer.item.date} {drawer.item.time} ·{" "}
                  {drawer.item.meetingType ?? drawer.item.type}
                </p>
                {(drawer.item.message || drawer.item.notes) && (
                  <p>{drawer.item.message || drawer.item.notes}</p>
                )}
                <label className="block text-xs text-muted">Admin notes</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {(["confirmed", "completed", "cancelled"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={busy || !drawer.item.id}
                      onClick={() =>
                        void run(
                          {
                            action: "booking.update",
                            id: drawer.item.id,
                            status: st,
                            adminNotes: note,
                          },
                          `Booking ${st}`
                        )
                      }
                      className="rounded-xl border border-border px-3 py-2 text-xs capitalize hover:border-accent/40"
                    >
                      {st}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={busy || !drawer.item.id}
                    onClick={() =>
                      void run(
                        {
                          action: "booking.update",
                          id: drawer.item.id,
                          status: "reschedule",
                          rescheduleNote: note || "Reschedule requested",
                          adminNotes: note,
                        },
                        "Reschedule note saved"
                      )
                    }
                    className="rounded-xl border border-border px-3 py-2 text-xs hover:border-accent/40"
                  >
                    Reschedule note
                  </button>
                </div>
              </div>
            )}

            {drawer.type === "intake" && (
              <div className="space-y-4 text-sm">
                <p>
                  <strong>{drawer.item.name}</strong>
                  <br />
                  {drawer.item.email}
                </p>
                <p className="text-muted">
                  {drawer.item.projectType} · {drawer.item.budget} · {drawer.item.timeline}
                </p>
                <p className="whitespace-pre-wrap text-foreground">{drawer.item.brief}</p>
                <label className="block text-xs text-muted">Admin notes</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface/50 px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || !drawer.item.id}
                    onClick={() =>
                      void run(
                        { action: "intake.convert", id: drawer.item.id },
                        "Converted to project"
                      )
                    }
                    className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-background"
                  >
                    Convert to Project
                  </button>
                  <button
                    type="button"
                    disabled={busy || !drawer.item.id}
                    onClick={() =>
                      void run(
                        { action: "intake.send-quotation", id: drawer.item.id },
                        "Quotation ready"
                      )
                    }
                    className="rounded-xl border border-border px-3 py-2 text-xs hover:border-accent/40"
                  >
                    Send quotation
                  </button>
                  <button
                    type="button"
                    disabled={busy || !drawer.item.id}
                    onClick={() =>
                      void run(
                        {
                          action: "intake.update",
                          id: drawer.item.id,
                          contacted: true,
                          status: "contacted",
                          adminNotes: note,
                        },
                        "Marked contacted"
                      )
                    }
                    className="rounded-xl border border-border px-3 py-2 text-xs hover:border-accent/40"
                  >
                    Mark contacted
                  </button>
                  {(["new", "quoted", "active", "closed"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={busy || !drawer.item.id}
                      onClick={() =>
                        void run(
                          {
                            action: "intake.update",
                            id: drawer.item.id,
                            status: st,
                            adminNotes: note,
                          },
                          `Status → ${st}`
                        )
                      }
                      className="rounded-xl border border-border px-3 py-2 text-xs capitalize hover:border-accent/40"
                    >
                      {st}
                    </button>
                  ))}
                  {drawer.item.projectId && (
                    <button
                      type="button"
                      onClick={() => {
                        setMsgProjectId(String(drawer.item.projectId));
                        setDrawer(null);
                      }}
                      className="rounded-xl border border-accent/40 px-3 py-2 text-xs text-accent"
                    >
                      Open chat
                    </button>
                  )}
                </div>
              </div>
            )}

            {drawer.type === "payment" && (
              <div className="space-y-4 text-sm">
                <p>
                  {drawer.item.provider} · {drawer.item.status} · {drawer.item.tierName}
                </p>
                <p className="font-mono text-xs">
                  {drawer.item.provider === "stripe"
                    ? `$${(drawer.item.amount / 100).toFixed(2)}`
                    : `${drawer.item.amount} ${drawer.item.currency}`}
                </p>
                <p className="text-muted">{drawer.item.receipt || drawer.item.checkoutRequestID}</p>
                {drawer.item.status !== "success" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        { action: "payment.mark-paid", id: drawer.item.id },
                        "Marked paid + receipt created"
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-background"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Mark paid
                  </button>
                )}
              </div>
            )}

            {drawer.type === "contact" && (
              <div className="space-y-4 text-sm">
                <p>
                  <strong>{drawer.item.name}</strong>
                  <br />
                  {drawer.item.email}
                </p>
                <p className="whitespace-pre-wrap">{drawer.item.message}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || !drawer.item.id}
                    onClick={() =>
                      void run(
                        { action: "contact.update", id: drawer.item.id, read: true },
                        "Marked read"
                      )
                    }
                    className="rounded-xl border border-border px-3 py-2 text-xs"
                  >
                    Mark read
                  </button>
                  <button
                    type="button"
                    disabled={busy || !drawer.item.id}
                    onClick={() =>
                      void run(
                        {
                          action: "contact.update",
                          id: drawer.item.id,
                          replied: true,
                          read: true,
                        },
                        "Marked replied"
                      )
                    }
                    className="rounded-xl border border-border px-3 py-2 text-xs"
                  >
                    Mark replied
                  </button>
                  <button
                    type="button"
                    disabled={busy || !drawer.item.id}
                    onClick={() =>
                      void run(
                        {
                          action: "contact.update",
                          id: drawer.item.id,
                          archived: true,
                          read: true,
                        },
                        "Archived"
                      )
                    }
                    className="rounded-xl border border-border px-3 py-2 text-xs"
                  >
                    Archive
                  </button>
                  <a
                    href={`mailto:${drawer.item.email}`}
                    className="rounded-xl border border-accent/40 px-3 py-2 text-xs text-accent"
                  >
                    Reply via email
                  </a>
                </div>
              </div>
            )}

            {drawer.type === "subscriber" && (
              <div className="space-y-4 text-sm">
                <p>{drawer.item.email}</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      { action: "subscriber.remove", email: drawer.item.email },
                      "Subscriber removed"
                    ).then(() => setDrawer(null))
                  }
                  className="rounded-xl border border-rose-400/40 px-3 py-2 text-xs text-rose-500"
                >
                  Remove subscriber
                </button>
              </div>
            )}

            {drawer.type === "reaction" && (
              <div className="space-y-2 text-sm">
                <p className="text-3xl">{drawer.item.emoji}</p>
                <p>Sentiment: {drawer.item.sentiment}</p>
                <p className="text-muted">Visitor: {drawer.item.visitorId ?? "—"}</p>
                <p className="font-mono text-[10px] text-muted">{when(drawer.item.ts)}</p>
              </div>
            )}

            {drawer.type === "attention" && (
              <div className="space-y-4 text-sm">
                <p className="font-medium">{drawer.item.title}</p>
                <p className="text-muted">{drawer.item.detail}</p>
                <p className="font-mono text-[10px]">{when(drawer.item.at)}</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void run(
                      {
                        action: "attention.resolve",
                        kind: drawer.item.kind,
                        id: drawer.item.id,
                      },
                      "Resolved"
                    ).then(() => setDrawer(null))
                  }
                  className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-background"
                >
                  Mark resolved
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
