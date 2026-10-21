import { optOutBookingDraft } from "@/lib/booking-drafts";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await optOutBookingDraft(id);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unsubscribed</title>
</head>
<body style="margin:0;padding:48px 20px;background:#140e24;color:#f6f1ff;font-family:Georgia,serif;">
  <main style="max-width:32rem;margin:0 auto;">
    <h1 style="font-size:1.75rem;font-weight:600;">You are unsubscribed</h1>
    <p style="line-height:1.6;color:#c9bddc;">We will not send another note about that unfinished booking.</p>
  </main>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
