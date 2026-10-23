"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { parseResponseJson } from "@/lib/safe-json";

export default function PublicAutomationPage() {
  const params = useParams<{ slug: string; page: string }>();
  const slug = params.slug;
  const page = params.page;
  const [slots, setSlots] = useState<{ start: string; label: string }[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [start, setStart] = useState("");
  const [score, setScore] = useState("5");

  useEffect(() => {
    const query = page === "book" ? "" : `&page=${encodeURIComponent(page)}`;
    void fetch(`/api/automations/public?slug=${encodeURIComponent(slug)}${query}`)
      .then((res) => parseResponseJson<{ slots?: { start: string; label: string }[]; businessName?: string }>(res, {}))
      .then((data) => {
        if (page === "book") setSlots(data.slots || []);
        if (data.businessName) setBusiness(data.businessName);
      })
      .catch(() => setSlots([]));
  }, [page, slug]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const action = page === "book" ? "book" : page === "review" ? "review" : "hook";
    if (action === "hook") {
      const kind = page === "lead" ? "lead" : page === "rsvp" ? "rsvp" : "intake";
      const res = await fetch(`/api/automations/hooks/${kind}/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message: note, note }),
      });
      const data = await parseResponseJson<{ message?: string }>(res, {});
      setMessage(data.message || "Received.");
      return;
    }
    const res = await fetch("/api/automations/public", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        slug,
        name,
        email,
        phone,
        note,
        start,
        score: Number(score),
        comment: note,
      }),
    });
    const data = await parseResponseJson<{ message?: string; google?: string }>(res, {});
    setMessage(data.google ? `${data.message || "Thank you."} ${data.google}` : data.message || "Saved.");
  }

  const title = page === "lead" ? "Tell us what you need" : page === "book" ? "Book a time" : page === "review" ? "How did we do?" : page === "rsvp" ? "RSVP" : "Send a request";

  return (
    <div className="mx-auto max-w-lg px-6 py-28 pb-32 max-lg:pr-[6.75rem]">
      <form onSubmit={(event) => void onSubmit(event)} className="sleek-card space-y-3 rounded-3xl p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{business || "The Beacon Studio"}</p>
        <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="field h-11 px-3 text-sm" />
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" className="field h-11 px-3 text-sm" />
        <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" className="field h-11 px-3 text-sm" />
        {page === "book" && (
          <label className="block text-xs text-muted">
            Slot
            <select required value={start} onChange={(event) => setStart(event.target.value)} className="field mt-1 h-11 px-3 text-sm">
              <option value="">Choose a time</option>
              {slots.map((slot) => (
                <option key={slot.start} value={slot.start}>{slot.label}</option>
              ))}
            </select>
          </label>
        )}
        {page === "review" && (
          <label className="block text-xs text-muted">
            Score
            <input value={score} onChange={(event) => setScore(event.target.value)} type="number" min={0} max={10} className="field mt-1 h-11 px-3 text-sm" />
          </label>
        )}
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Note" rows={3} className="field px-3 py-2 text-sm" />
        <button type="submit" className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-background">
          Send
        </button>
        {message && <p className="text-sm text-muted">{message}</p>}
      </form>
    </div>
  );
}
