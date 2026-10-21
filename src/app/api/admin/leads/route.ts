import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isLeadStatus, listStudioLeads, setLeadStatus } from "@/lib/leads";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await listStudioLeads();
  return NextResponse.json({ leads });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await parseRequestJson(request);
  const action = typeof body.action === "string" ? body.action : "";
  if (action === "status") {
    const id = typeof body.id === "string" ? body.id : "";
    const status = typeof body.status === "string" ? body.status : "";
    if (!isLeadStatus(status)) {
      return NextResponse.json({ error: "Unknown status." }, { status: 400 });
    }
    const lead = await setLeadStatus(id, status);
    if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    return NextResponse.json({ ok: true, lead });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
