"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BRAND_NAME,
  MAILBOX_ROLES,
  SISTER_APPS,
  emailSignatureHtml,
  emailSignatureText,
  renderEmailShell,
  renderLetterhead,
  smsSegments,
  smsSignoff,
  welcomeEmail,
  whatsappSignoff,
  withSmsSignoff,
  withWhatsappSignoff,
  type BrandMailbox,
} from "@/lib/brand-comms";

const MAILBOXES = Object.keys(MAILBOX_ROLES) as BrandMailbox[];

function Frame({ title, html, height = 720 }: { title: string; html: string; height?: number }) {
  return (
    <iframe
      title={title}
      srcDoc={html}
      sandbox=""
      className="w-full rounded-2xl bg-white/60 shadow-[0_18px_48px_rgba(12,110,100,0.12)]"
      style={{ height }}
    />
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-surface/70 p-5 shadow-[0_18px_48px_rgba(8,4,20,0.12)] backdrop-blur-xl sm:p-6">
      <h2 className="mb-4 font-serif text-xl text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export default function BrandPreviewPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [app, setApp] = useState<string>("");
  const [mailbox, setMailbox] = useState<BrandMailbox>("support");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/stats")
      .then((res) => !cancelled && setAllowed(res.ok))
      .catch(() => !cancelled && setAllowed(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const co = useMemo(() => (app ? { appName: app } : {}), [app]);
  const shell = useMemo(
    () =>
      renderEmailShell({
        ...co,
        heading: "Your booking is confirmed",
        preheader: "Thursday 10:00 EAT · 20-minute audit",
        greeting: "Hi Amina,",
        paragraphs: ["Thanks for booking a free audit. We will look at one repetitive job and show you what an automation would save.", "Reply to this email if you need to move the time."],
        card: [
          { label: "When", value: "Thu 30 Oct, 10:00 EAT" },
          { label: "Where", value: "Google Meet (link in the invite)" },
        ],
        actions: [
          { label: "Add to calendar", href: "https://thebeaconstudio.co.ke/book" },
          { label: "See how it works", href: "https://thebeaconstudio.co.ke/how-it-works" },
        ],
        signature: mailbox,
        unsubscribeUrl: "https://thebeaconstudio.co.ke/unsubscribe?sample=1",
      }).html,
    [co, mailbox]
  );
  const clientShell = useMemo(
    () =>
      renderEmailShell({
        client: { name: "Acme Dental", color: "#1d4ed8", email: "frontdesk@acmedental.example", phone: "0712 000 000" },
        heading: "Your appointment reminder",
        greeting: "Hi John,",
        paragraphs: ["This is a reminder of your cleaning appointment tomorrow at 09:30."],
        actions: [{ label: "Confirm appointment", href: "https://thebeaconstudio.co.ke" }],
      }).html,
    []
  );
  const welcome = useMemo(() => welcomeEmail({ ...co, name: "Amina Otieno", businessName: "Amina Bakery", daysLeft: 30, included: ["Lead auto-reply", "Invoice reminders"] }).html, [co]);
  const letterhead = useMemo(
    () =>
      renderLetterhead({
        ...co,
        title: "Proposal: WhatsApp lead follow-up",
        reference: "Q-2026-0142",
        preparedFor: "Amina Bakery Ltd",
        preparedBy: "Max · The Beacon Studio",
        bodyHtml: "<p>Scope: reply to new WhatsApp enquiries within a minute and log each lead.</p><table><tr><td>Setup</td><td style='text-align:right'>KES 0</td></tr><tr><td>Monthly</td><td style='text-align:right'>KES 4,500</td></tr></table>",
      }),
    [co]
  );
  const sample = "Hi Amina, your invoice INV-0142 for KES 4,500 is due on Friday. Pay here: https://pay.example/abc";
  const sms = withSmsSignoff(sample, { ...co, mailbox: "billing" });
  const wa = withWhatsappSignoff(sample, { ...co, mailbox: "billing" });

  if (allowed === null) return <main className="mx-auto max-w-5xl px-4 pt-24 text-muted">Checking admin session…</main>;
  if (!allowed)
    return (
      <main className="mx-auto max-w-5xl px-4 pt-24">
        <p className="text-muted">Sign in at /admin to view the brand preview.</p>
        <Link href="/admin" className="mt-3 inline-block text-accent">Go to admin</Link>
      </main>
    );

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-24 sm:px-6">
      <header className="space-y-2">
        <p className="admin-kicker">Admin · Brand preview</p>
        <h1 className="font-serif text-3xl text-foreground">{BRAND_NAME} communications kit</h1>
        <p className="max-w-3xl text-sm text-muted">
          Sample data only. Source: <code>src/lib/brand-comms.ts</code>. Sister-app guide: <code>docs/BRAND_COMMS.md</code>.
        </p>
        <div className="flex flex-wrap gap-3 pt-2 text-sm">
          <label className="text-muted">
            App{" "}
            <select value={app} onChange={(e) => setApp(e.target.value)} className="ml-1 rounded-xl px-3 py-1.5">
              <option value="">The Beacon Studio</option>
              {SISTER_APPS.map((name) => (
                <option key={name} value={name}>{name} by The Beacon Studio</option>
              ))}
            </select>
          </label>
          <label className="text-muted">
            Signature{" "}
            <select value={mailbox} onChange={(e) => setMailbox(e.target.value as BrandMailbox)} className="ml-1 rounded-xl px-3 py-1.5">
              {MAILBOXES.map((id) => (
                <option key={id} value={id}>{id}@ · {MAILBOX_ROLES[id].title}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <Card title="Email shell"><Frame title="Email shell" html={shell} /></Card>
      <Card title="Welcome email (new signup / trial)"><Frame title="Welcome email" html={welcome} height={900} /></Card>
      <Card title="Client-branded automation email (Powered by line)"><Frame title="Client email" html={clientShell} height={560} /></Card>

      <Card title="Email signatures">
        <div className="grid gap-4 md:grid-cols-2">
          {MAILBOXES.map((id) => (
            <div key={id} className="rounded-2xl bg-white/80 p-4">
              <div dangerouslySetInnerHTML={{ __html: emailSignatureHtml(id, co) }} />
              <pre className="mt-3 whitespace-pre-wrap text-xs text-slate-600">{emailSignatureText(id, co)}</pre>
            </div>
          ))}
        </div>
      </Card>

      <Card title="SMS and WhatsApp sign-offs">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-background/50 p-4">
            <p className="admin-kicker">SMS · {sms.length} chars · {smsSegments(sms)} part(s)</p>
            <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground">{sms}</pre>
            <p className="mt-2 text-xs text-muted">Sign-off alone: “{smsSignoff({ ...co, mailbox: "billing" })}”</p>
          </div>
          <div className="rounded-2xl bg-background/50 p-4">
            <p className="admin-kicker">WhatsApp</p>
            <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground">{wa}</pre>
            <p className="mt-2 text-xs text-muted">Client version:</p>
            <pre className="whitespace-pre-wrap text-xs text-muted">{whatsappSignoff({ client: { name: "Acme Dental", phone: "0712 000 000" } })}</pre>
          </div>
        </div>
      </Card>

      <Card title="Letterhead (documents, quotes, invoices)"><Frame title="Letterhead" html={letterhead} height={900} /></Card>
    </main>
  );
}
