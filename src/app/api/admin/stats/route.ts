import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAnalyticsStore, summarizeAnalytics } from "@/lib/analytics-store";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { listPayments } from "@/lib/payments";

export const runtime = "nodejs";

type Booking = {
  id?: string;
  createdAt?: string;
  name?: string;
  email?: string;
  type?: string;
  meetingType?: string;
  date?: string;
  time?: string;
  notes?: string;
  message?: string;
  read?: boolean;
};

type Intake = {
  id?: string;
  createdAt?: string;
  name?: string;
  email?: string;
  projectType?: string;
  budget?: string;
  read?: boolean;
};

type Subscriber = {
  id?: string;
  email?: string;
  createdAt?: string;
  subscribedAt?: string;
  read?: boolean;
};

type Contact = {
  id?: string;
  createdAt?: string;
  name?: string;
  email?: string;
  message?: string;
  read?: boolean;
};

function unreadCount<T extends { read?: boolean }>(items: T[]) {
  return items.filter((i) => i.read !== true).length;
}

function byNewest<T extends { createdAt?: string; subscribedAt?: string; ts?: string }>(
  a: T,
  b: T
) {
  const ta = a.createdAt || a.subscribedAt || a.ts || "";
  const tb = b.createdAt || b.subscribedAt || b.ts || "";
  return tb.localeCompare(ta);
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await getAnalyticsStore();
  const summary = summarizeAnalytics(store);
  const { searchParams } = new URL(request.url);

  const [bookingsRaw, intakesRaw, subscribersRaw, paymentsRaw, contactsRaw] =
    await Promise.all([
      readJsonFile<Booking[]>("bookings.json", []),
      readJsonFile<Intake[]>("intakes.json", []),
      readJsonFile<Subscriber[]>("subscribers.json", []),
      listPayments(),
      readJsonFile<Contact[]>("contacts.json", []),
    ]);

  const bookings = [...bookingsRaw].sort(byNewest);
  const intakes = [...intakesRaw].sort(byNewest);
  const subscribers = [...subscribersRaw].sort(byNewest);
  const payments = [...paymentsRaw].sort(byNewest);
  const contacts = [...contactsRaw].sort(byNewest);
  const reactions = [...(store.reactions ?? [])].reverse();

  const attention: {
    id: string;
    kind: string;
    title: string;
    detail: string;
    at: string;
    refId?: string;
  }[] = [];

  for (const b of bookings.filter((x) => x.read !== true).slice(0, 8)) {
    attention.push({
      id: `book-${b.id ?? b.createdAt}`,
      kind: "booking",
      title: `Booking: ${b.meetingType ?? b.type ?? "call"}`,
      detail: `${b.name ?? "Guest"} · ${b.email ?? ""}${b.date ? ` · ${b.date} ${b.time ?? ""}` : ""}`,
      at: b.createdAt ?? "",
      refId: b.id,
    });
  }
  for (const i of intakes.filter((x) => x.read !== true).slice(0, 8)) {
    attention.push({
      id: `intake-${i.id ?? i.createdAt}`,
      kind: "intake",
      title: "Project intake",
      detail: `${i.name ?? "Guest"} · ${i.projectType ?? ""} · ${i.budget ?? ""}`,
      at: i.createdAt ?? "",
      refId: i.id,
    });
  }
  for (const p of payments.filter((x) => x.read !== true || x.status === "pending").slice(0, 8)) {
    attention.push({
      id: `pay-${p.id}`,
      kind: "payment",
      title: `${p.provider} · ${p.status}`,
      detail: `${p.tierName} · ${p.amount} ${p.currency}${p.receipt ? ` · ${p.receipt}` : ""}`,
      at: p.createdAt,
      refId: p.id,
    });
  }
  for (const c of contacts.filter((x) => x.read !== true).slice(0, 8)) {
    attention.push({
      id: `contact-${c.id ?? c.createdAt}`,
      kind: "contact",
      title: "Contact message",
      detail: `${c.name ?? ""} · ${c.email ?? ""}`,
      at: c.createdAt ?? "",
      refId: c.id,
    });
  }
  for (const s of subscribers.filter((x) => x.read !== true).slice(0, 6)) {
    attention.push({
      id: `sub-${s.id ?? s.email}`,
      kind: "subscriber",
      title: "Newsletter subscribe",
      detail: s.email ?? "",
      at: s.createdAt ?? s.subscribedAt ?? "",
      refId: s.id ?? s.email,
    });
  }
  for (const r of reactions.slice(0, 5)) {
    const at =
      typeof r.ts === "number" ? new Date(r.ts).toISOString() : String(r.ts ?? "");
    attention.push({
      id: `vibe-${r.ts}-${r.emoji}`,
      kind: "reaction",
      title: `Vibe · ${r.emoji ?? "?"} (${r.sentiment ?? "neutral"})`,
      detail: `Visitor ${String(r.visitorId ?? "").slice(0, 8)}…`,
      at,
    });
  }

  attention.sort((a, b) => (b.at || "").localeCompare(a.at || ""));

  const ops = {
    bookings,
    intakes,
    subscribers,
    payments,
    contacts,
    reactions: reactions.slice(0, 40),
    attention,
    badges: {
      bookings: unreadCount(bookings),
      intakes: unreadCount(intakes),
      subscribers: unreadCount(subscribers),
      payments: payments.filter((p) => p.read !== true || p.status === "pending").length,
      contacts: unreadCount(contacts),
      reactions: reactions.length,
    },
  };

  if (searchParams.get("export") === "json") {
    return new NextResponse(JSON.stringify({ summary, store, ops }, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="beacon-analytics-${Date.now()}.json"`,
      },
    });
  }

  return NextResponse.json({
    summary,
    updatedAt: store.updatedAt,
    ops,
  });
}

/** Mark inbox items as read */
export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    collection?: string;
    id?: string;
    markAll?: boolean;
  };

  const collection = body.collection;
  const files: Record<string, string> = {
    bookings: "bookings.json",
    intakes: "intakes.json",
    subscribers: "subscribers.json",
    contacts: "contacts.json",
    payments: "payments.json",
  };

  if (!collection || !files[collection]) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 400 });
  }

  const filename = files[collection];
  const items = await readJsonFile<Record<string, unknown>[]>(filename, []);

  if (body.markAll) {
    for (const item of items) item.read = true;
  } else if (body.id) {
    const hit = items.find(
      (i) => i.id === body.id || i.email === body.id || String(i.id) === body.id
    );
    if (hit) hit.read = true;
  }

  await writeJsonFile(filename, items);
  return NextResponse.json({ ok: true });
}
