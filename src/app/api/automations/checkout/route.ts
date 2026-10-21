import { NextResponse } from "next/server";
import { startBundleCheckout } from "@/lib/automations/runtime";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request);
    const templateIds = Array.isArray(body.templateIds) ? body.templateIds.filter((id): id is string => typeof id === "string") : [];
    const configs = body.configs && typeof body.configs === "object" && !Array.isArray(body.configs) ? (body.configs as Record<string, unknown>) : {};
    const billing = body.billing === "annual" ? "annual" : "monthly";
    const pay = body.pay === "invoice" ? "invoice" : "paystack";
    const result = await startBundleCheckout({
      templateIds,
      configs,
      billing,
      ownerName: typeof body.ownerName === "string" ? body.ownerName : "",
      ownerEmail: typeof body.ownerEmail === "string" ? body.ownerEmail : "",
      businessName: typeof body.businessName === "string" ? body.businessName : "",
      pay,
      origin: new URL(request.url).origin,
    });
    if (!result.ok) return NextResponse.json(result, { status: result.status === 200 ? 200 : result.status });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[automations/checkout]", error instanceof Error ? error.message : "failed");
    return NextResponse.json({ ok: false, message: "Checkout failed." }, { status: 500 });
  }
}
