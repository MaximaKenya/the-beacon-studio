import { NextResponse } from "next/server";
import { invoiceHtml, invoicePdf, studioInvoice } from "@/lib/automations/invoice-doc";
import { shareToken, shareTokenMatches } from "@/lib/automations/share";
import { loadAutomations } from "@/lib/automations/store";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listPayments } from "@/lib/payments";
import { getPortalSession } from "@/lib/portal-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const payments = await listPayments();
  const payment = payments.find((item) => item.id === id);
  if (!payment || (payment.tierId !== "automation-bundle" && !payment.automationInstanceIds?.length)) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  const url = new URL(request.url);
  const token = url.searchParams.get("t") || "";
  const admin = await isAdminAuthenticated();
  const session = await getPortalSession();
  const allowed = admin || (session && session.email === payment.payerEmail) || shareTokenMatches("invoice", id, token);
  if (!allowed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await loadAutomations();
  const instances = doc.instances.filter((item) => payment.automationInstanceIds?.includes(item.id));
  const trial = instances.some((item) => item.trial && !item.trial.paidUntil);
  const view = studioInvoice({
    id: payment.id,
    businessName: instances[0]?.businessName || payment.payerName || "Client",
    billTo: payment.payerName || payment.payerEmail || "Client",
    email: payment.payerEmail || "",
    amountKes: payment.amount,
    tierName: payment.tierName,
    status: payment.status,
    due: instances[0]?.trial?.endsAt,
    trial,
  });
  const share = shareToken("invoice", id);
  const self = `${url.origin}/api/automations/invoice/${id}?t=${share}`;
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
