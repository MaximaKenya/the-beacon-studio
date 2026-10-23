import { NextResponse } from "next/server";
import { chargeInvoice, invoiceHtml, invoicePdf } from "@/lib/automations/invoice-doc";
import { shareToken, shareTokenMatches } from "@/lib/automations/share";
import { loadAutomations } from "@/lib/automations/store";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPortalSession } from "@/lib/portal-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const doc = await loadAutomations();
  const charge = doc.charges.find((item) => item.id === id);
  const instance = charge ? doc.instances.find((item) => item.id === charge.instanceId) : undefined;
  if (!charge || !instance) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  const url = new URL(request.url);
  const token = url.searchParams.get("t") || "";
  const admin = await isAdminAuthenticated();
  const session = await getPortalSession();
  const allowed = admin || (session && session.email === instance.ownerEmail) || shareTokenMatches("receipt", id, token);
  if (!allowed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const view = chargeInvoice({
    id: charge.id,
    businessName: instance.businessName,
    customer: charge.name,
    email: charge.email,
    amountKes: charge.amountKes,
    due: charge.dueDate,
    status: charge.status,
    note: charge.note,
  });
  const share = shareToken("receipt", id);
  const self = `${url.origin}/api/automations/receipt/${id}?t=${share}`;
  const pdf = `${self}&format=pdf`;
  if (url.searchParams.get("format") === "pdf") {
    return new NextResponse(new Uint8Array(invoicePdf(view)), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${view.number}.pdf"`,
      },
    });
  }
  return new NextResponse(invoiceHtml(view, { pdf, self }), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
