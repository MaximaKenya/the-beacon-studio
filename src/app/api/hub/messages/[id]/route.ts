import { NextResponse } from "next/server";
import { authenticateHub } from "@/lib/hub/auth";
import { publicStatus } from "@/lib/hub/service";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateHub(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const m = auth.state.messages.find((x) => x.id === id && x.app === auth.creds.app);
  if (!m) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(publicStatus(m));
}
