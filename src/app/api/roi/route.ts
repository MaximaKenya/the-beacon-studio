import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { siteConfig } from "@/data/site";
import { captureLead } from "@/lib/leads";
import { computeRoi } from "@/lib/roi";
import { renderBrandEmail, publicSiteUrl } from "@/lib/brand-email";
import { formatKes } from "@/lib/fx";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { normalizeReferralCode, REFERRAL_COOKIE } from "@/lib/referral-rules";
import { parseRequestJson } from "@/lib/storage";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";

function num(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request);
    if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: false, error: "Could not save." }, { status: 400 });
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    if (!isValidEmail(email)) return NextResponse.json({ ok: false, error: "Enter a valid email." }, { status: 400 });
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    const industry = typeof body.industry === "string" ? body.industry.slice(0, 60) : "";
    const result = computeRoi({
      industry,
      weeklyHours: num(body.weeklyHours),
      unpaidInvoicesKes: num(body.unpaidInvoicesKes),
      hourlyCostKes: num(body.hourlyCostKes),
    });
    const ref = normalizeReferralCode((await cookies()).get(REFERRAL_COOKIE)?.value);
    const summary = [
      `ROI plan: ${result.pack.name}.`,
      `Inputs: ${industry || "unspecified"}, ${num(body.weeklyHours)} h/week, ${formatKes(result.unpaidInvoicesKes)} unpaid, ${formatKes(num(body.hourlyCostKes))}/h.`,
      `Estimated time cost ${formatKes(result.monthlyTimeCostKes)}/mo vs pack ${formatKes(result.packMonthlyKes)}/mo.`,
      ref ? `Referral code ${ref}.` : "",
    ].filter(Boolean).join(" ");
    await captureLead({ kind: "roi", source: "automation-roi", channel: "website", name: name || undefined, email, category: result.pack.id, message: summary });

    if (isResendConfigured()) {
      const site = publicSiteUrl();
      const card = [
        { label: "Recommended", value: result.pack.name },
        { label: "Hours a month", value: `${result.monthlyHours} h` },
        { label: "Time cost (est.)", value: `${formatKes(result.monthlyTimeCostKes)}/mo` },
        { label: "Pack price", value: `${formatKes(result.packMonthlyKes)}/mo` },
        { label: "Annual billing", value: `${formatKes(result.packAnnualMonthlyKes)}/mo` },
      ];
      const letter = renderBrandEmail({
        heading: "Your automation plan",
        greeting: name ? `Hello ${name},` : "Hello,",
        paragraphs: ["Here is the plan from your inputs. Figures are estimates based only on what you entered."],
        card,
        actions: [
          { label: "Start the 30-day free trial", href: `${site}/automations?pack=${result.pack.id}` },
          { label: "Book a call", href: `${site}/book` },
        ],
      });
      await sendResendEmail({ to: email, subject: `Your automation plan · ${siteConfig.brand.name}`, html: letter.html, text: letter.text });
      const alert = renderBrandEmail({ heading: "New ROI plan lead", greeting: "Hello,", paragraphs: [`${name || email} (${email}) asked for an automation plan.`, summary] });
      await sendResendEmail({ to: process.env.ADMIN_EMAIL?.trim() || siteConfig.email, subject: `ROI lead: ${result.pack.name}`, html: alert.html, text: alert.text, replyTo: email });
    }
    return NextResponse.json({ ok: true, message: "Plan saved. Check your inbox." });
  } catch (error) {
    console.error("[roi]", error instanceof Error ? error.message : "failed");
    return NextResponse.json({ ok: false, error: "Could not save the plan." }, { status: 500 });
  }
}
