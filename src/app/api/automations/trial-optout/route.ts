import { verifyTrialOptOut } from "@/lib/automations/trial-optout";
import { addAdminLog } from "@/lib/automations/store";
import { emptyDoc, normalizeDoc, type AutomationDoc } from "@/lib/automations/types";
import { mutateJsonFile } from "@/lib/storage";
import { normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";

function page(title: string, body: string, status = 200) {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:48px 20px;background:#140e24;color:#f6f1ff;font-family:Georgia,serif;"><main style="max-width:32rem;margin:0 auto;">
<h1 style="font-size:1.75rem;font-weight:600;">${title}</h1><p style="line-height:1.6;color:#c9bddc;">${body}</p></main></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get("e") || "");
  const token = url.searchParams.get("t") || "";
  if (!email || !verifyTrialOptOut(email, token)) return page("Link not valid", "This unsubscribe link is not valid.", 400);
  await mutateJsonFile<AutomationDoc>("automations.json", emptyDoc(), (raw) => {
    const doc = normalizeDoc(raw);
    const list = new Set(doc.trialOptOuts || []);
    if (!list.has(email)) {
      list.add(email);
      addAdminLog(doc, "automated", "Trial emails opted out", email);
    }
    doc.trialOptOuts = [...list];
    return doc;
  });
  return page("You are unsubscribed", "No more trial tips. Trial reminders and receipts still arrive.");
}
