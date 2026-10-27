import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { revenueOverview } from "@/lib/revenue-overview";
import { cancelCareSubscription, createCareSubscription, invoiceCareSubscription, setFoundersLock, setRequestStatus } from "@/lib/revenue-requests";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await revenueOverview());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await parseRequestJson(request);
  const action = typeof body.action === "string" ? body.action : "";
  const str = (key: string) => (typeof body[key] === "string" ? (body[key] as string) : "");
  if (action === "care-create") return NextResponse.json(await createCareSubscription({ email: str("email"), name: str("name"), planId: str("planId"), billing: str("billing") }));
  if (action === "care-invoice") return NextResponse.json(await invoiceCareSubscription(str("id")));
  if (action === "care-cancel") return NextResponse.json(await cancelCareSubscription(str("id")));
  if (action === "founders-lock") return NextResponse.json(await setFoundersLock(str("email"), body.on !== false, str("note")));
  if (action === "request-status") {
    const status = str("status");
    if (status !== "new" && status !== "contacted" && status !== "done") return NextResponse.json({ error: "Bad status." }, { status: 400 });
    return NextResponse.json(await setRequestStatus(str("id"), status));
  }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
