import { NextResponse } from "next/server";
import { siteConfig } from "@/data/site";
import { brandedEmail } from "@/lib/email-html";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { parseRevenueRequest } from "@/lib/revenue-requests-rules";
import { findTemplateDownload, saveRevenueRequest } from "@/lib/revenue-requests";
import { absoluteUrl } from "@/lib/seo";
import { parseRequestJson } from "@/lib/storage";
import { templateFile } from "@/lib/templates-store";

export const runtime = "nodejs";

function downloadPath(token: string, id: string) {
  return `/api/templates?token=${encodeURIComponent(token)}&id=${encodeURIComponent(id)}`;
}

export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request);
    const parsed = parseRevenueRequest({ ...body, kind: "template" });
    if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    if (!parsed.value.item) return NextResponse.json({ ok: false, error: "Pick a template." }, { status: 400 });
    const entry = await saveRevenueRequest(parsed.value);
    const path = downloadPath(entry.downloadToken!, parsed.value.item);
    if (isResendConfigured()) {
      const mail = brandedEmail({
        heading: parsed.value.itemLabel || "Your template",
        greeting: "Hi,",
        bodyText: `Your template is ready: ${absoluteUrl(path)}\n\nMore free templates: ${absoluteUrl("/templates")}`,
      });
      await sendResendEmail({ purpose: "enquiry", to: entry.email, subject: `Your template — ${siteConfig.brand.name}`, html: mail.html, text: mail.text }).catch(() => undefined);
    }
    return NextResponse.json({ ok: true, url: path });
  } catch (error) {
    console.error("[templates]", error instanceof Error ? error.message : "failed");
    return NextResponse.json({ ok: false, error: "Could not save that email." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() || "";
  const entry = await findTemplateDownload(token);
  const id = url.searchParams.get("id") || entry?.item || "";
  const file = entry ? templateFile(id) : null;
  if (!file) return NextResponse.json({ error: "Download link not found." }, { status: 404 });
  return new NextResponse(file.body, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
