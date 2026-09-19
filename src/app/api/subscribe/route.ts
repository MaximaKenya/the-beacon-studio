import { NextResponse } from "next/server";
import { ensureDataFiles, parseRequestJson, readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";

export type Subscriber = {
  id: string;
  email: string;
  firstName?: string;
  subscribedAt: string;
  createdAt: string;
  read?: boolean;
};

export async function POST(request: Request) {
  try {
    await ensureDataFiles();

    const body = await parseRequestJson(request);
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : undefined;

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const subscribers = await readJsonFile<Subscriber[]>("subscribers.json", []);

    if (subscribers.some((s) => s.email === email)) {
      return NextResponse.json(
        { error: "This email is already subscribed.", code: "duplicate" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const entry: Subscriber = {
      id: crypto.randomUUID(),
      email,
      ...(firstName ? { firstName } : {}),
      subscribedAt: now,
      createdAt: now,
      read: false,
    };

    subscribers.unshift(entry);
    await writeJsonFile("subscribers.json", subscribers);

    // Optional confirmation email (graceful no-op without RESEND_API_KEY)
    const { sendResendEmail, isResendConfigured } = await import("@/lib/resend");
    const { siteConfig } = await import("@/data/site");
    if (isResendConfigured()) {
      await sendResendEmail({
        to: email,
        subject: `You're subscribed — ${siteConfig.brand.name}`,
        html: `<p>Thanks for subscribing to ${siteConfig.brand.name} updates.</p><p>Occasional launch notes — no spam.</p>`,
        text: `Thanks for subscribing to ${siteConfig.brand.name} updates.`,
      });
    }

    return NextResponse.json({ success: true, subscriber: entry });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to subscribe.";
    console.error("[subscribe]", message);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}
