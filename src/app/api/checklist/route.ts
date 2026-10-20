import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { siteConfig } from "@/data/site";
import { attributionFromRecord, attributionNote, mergeAttribution, type LeadAttribution } from "@/lib/attribution";
import { CHECKLIST_TITLE, checklistHtml, checklistLines } from "@/lib/checklist";
import { brandedEmail } from "@/lib/email-html";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { absoluteUrl } from "@/lib/seo";
import { plainTextPdf } from "@/lib/simple-pdf";
import { ensureDataFiles, parseRequestJson, readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";

type ChecklistLead = LeadAttribution & {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
  source?: string;
  read?: boolean;
  status?: string;
  company?: string;
  downloadToken?: string;
};

function downloadPaths(token: string) {
  const html = absoluteUrl(`/api/checklist?token=${encodeURIComponent(token)}&format=html`);
  const pdf = absoluteUrl(`/api/checklist?token=${encodeURIComponent(token)}&format=pdf`);
  return { html, pdf };
}

export async function POST(request: Request) {
  try {
    await ensureDataFiles();
    const body = await parseRequestJson(request);
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ error: "Could not save that email." }, { status: 400 });
    }

    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 80) : "Checklist download";
    const company = typeof body.company === "string" ? body.company.trim().slice(0, 120) : "";
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    const incoming = attributionFromRecord(body);
    const token = randomBytes(24).toString("hex");
    const links = downloadPaths(token);
    const message = `${CHECKLIST_TITLE}. HTML and PDF download issued.`;
    const all = await readJsonFile<ChecklistLead[]>("contacts.json", []);
    const existing = all.find((row) => row.source === "lead-magnet" && row.email.toLowerCase() === email);

    if (existing) {
      const merged = mergeAttribution(existing, incoming);
      existing.name = name;
      existing.message = message;
      existing.downloadToken = token;
      if (company) existing.company = company;
      Object.assign(existing, merged);
    } else {
      all.unshift({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        name,
        email,
        topic: "ai-automation",
        source: "lead-magnet",
        message,
        read: false,
        status: "new",
        downloadToken: token,
        ...(company ? { company } : {}),
        ...incoming,
      });
    }
    await writeJsonFile("contacts.json", all);

    const { upsertClient } = await import("@/lib/clients");
    await upsertClient({ email, name, ...(company ? { company } : {}) });

    const note = attributionNote(incoming);
    try {
      const { recordSiteForm } = await import("@/lib/mailbox");
      await recordSiteForm({
        kind: "contact",
        sourceId: existing?.id || all[0]?.id || token,
        name,
        email,
        subject: `Checklist — ${name}`,
        text: [CHECKLIST_TITLE, company && `Business: ${company}`, note, links.html, links.pdf]
          .filter(Boolean)
          .join("\n"),
        confirmationSubject: `Your checklist — ${siteConfig.brand.name}`,
        skipConfirmation: true,
      });
    } catch (error) {
      console.error("[checklist] mailbox", error instanceof Error ? error.message : "mailbox failed");
    }

    if (isResendConfigured()) {
      const mail = brandedEmail({
        heading: CHECKLIST_TITLE,
        greeting: `Hi ${name},`,
        bodyText: `Your checklist is ready.\n\nHTML: ${links.html}\nPDF: ${links.pdf}\n\nIt is a planning list, not a quote. The free 20-minute audit is at ${absoluteUrl("/book")}.`,
      });
      await sendResendEmail({
        to: email,
        subject: `Your checklist — ${siteConfig.brand.name}`,
        html: mail.html,
        text: mail.text,
      });
    }

    return NextResponse.json({
      ok: true,
      html: `/api/checklist?token=${encodeURIComponent(token)}&format=html`,
      pdf: `/api/checklist?token=${encodeURIComponent(token)}&format=pdf`,
    });
  } catch {
    return NextResponse.json({ error: "Could not save that email." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim() || "";
  const format = searchParams.get("format") === "pdf" ? "pdf" : "html";
  if (!/^[a-f0-9]{32,64}$/i.test(token)) {
    return NextResponse.json({ error: "Download link not found." }, { status: 404 });
  }

  const all = await readJsonFile<ChecklistLead[]>("contacts.json", []);
  const lead = all.find((row) => row.downloadToken === token && row.source === "lead-magnet");
  if (!lead) {
    return NextResponse.json({ error: "Download link not found." }, { status: 404 });
  }

  if (format === "pdf") {
    const pdf = plainTextPdf(checklistLines());
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="ai-automation-checklist-kenya.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  }

  return new NextResponse(checklistHtml(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ai-automation-checklist-kenya.html"',
      "Cache-Control": "private, no-store",
    },
  });
}
