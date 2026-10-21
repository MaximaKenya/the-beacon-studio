import { NextResponse } from "next/server";
import { parseRequestJson } from "@/lib/storage";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { findClientByEmail, findClientById } from "@/lib/clients";
import { findProjectsByClient } from "@/lib/projects";
import {
  clearPortalSessionCookie,
  createAccessToken,
  getPortalSession,
  issueOneTimeCode,
  setPortalSessionCookie,
  verifyOneTimeCode,
  verifyPortalToken,
} from "@/lib/portal-auth";
import { siteConfig } from "@/data/site";
import { brandedEmail } from "@/lib/email-html";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";

export const runtime = "nodejs";

async function maybeSendPortalCodeEmail(email: string, code: string): Promise<boolean> {
  if (!isResendConfigured()) return false;
  const letter = brandedEmail({
    heading: "Your portal code",
    greeting: "Hello,",
    bodyText: `Your one-time portal code is ${code}. It expires in 15 minutes.\n\nOpen the client portal and enter this code for ${email}.`,
  });
  const result = await sendResendEmail({
    to: email,
    subject: `${siteConfig.brand.name} portal code`,
    text: letter.text,
    html: letter.html,
    idempotencyKey: `portal-code/${email}/${code}`,
  });
  return result.sent;
}

const NO_STORE = { "Cache-Control": "no-store" };

/** GET — current session */
export async function GET() {
  const session = await getPortalSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { headers: NO_STORE });
  }
  const client = await findClientById(session.clientId);
  if (!client) {
    return NextResponse.json({ authenticated: false }, { headers: NO_STORE });
  }
  const projects = await findProjectsByClient(client.id);
  return NextResponse.json(
    {
      authenticated: true,
      client: { id: client.id, name: client.name, email: client.email },
      projects: projects.map((p) => ({ id: p.id, title: p.title, status: p.status })),
    },
    { headers: NO_STORE }
  );
}

/**
 * POST actions:
 * - { action: "request-code", email }
 * - { action: "verify-code", email, code }
 * - { action: "token", token }
 * - { action: "logout" }
 */
export async function POST(request: Request) {
  const body = await parseRequestJson(request);
  const action = typeof body.action === "string" ? body.action : "";

  if (action === "logout") {
    const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
    clearPortalSessionCookie(response, request);
    return response;
  }

  if (action === "request-code") {
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    const client = await findClientByEmail(email);
    if (!client) {
      return NextResponse.json(
        { error: "No portal account for this email yet. Send a message or start a project first." },
        { status: 404 }
      );
    }
    const code = await issueOneTimeCode(email);
    const resendConfigured = isResendConfigured();
    const emailed = resendConfigured ? await maybeSendPortalCodeEmail(email, code) : false;
    /** Show OTP on-screen when Resend is unset or send failed (local/dev E2E). */
    const showCodeOnScreen = !emailed;
    return NextResponse.json({
      ok: true,
      message: emailed
        ? "One-time code sent to your email."
        : "One-time code issued. Email delivery not configured — use the code shown on screen.",
      ...(showCodeOnScreen ? { code } : {}),
      emailConfigured: emailed,
      expiresInMinutes: 15,
    });
  }

  if (action === "verify-code") {
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!isValidEmail(email) || !code) {
      return NextResponse.json({ error: "Email and code required." }, { status: 400 });
    }
    const ok = await verifyOneTimeCode(email, code);
    if (!ok) {
      return NextResponse.json({ error: "Invalid or expired code." }, { status: 401 });
    }
    const client = await findClientByEmail(email);
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }
    const projects = await findProjectsByClient(client.id);
    const token = createAccessToken(client.id, client.email, projects[0]?.id);
    const response = NextResponse.json(
      {
        ok: true,
        token,
        client: { id: client.id, name: client.name, email: client.email },
        projectId: projects[0]?.id,
      },
      { headers: NO_STORE }
    );
    setPortalSessionCookie(response, request, token);
    return response;
  }

  if (action === "token") {
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const payload = verifyPortalToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired access token." }, { status: 401 });
    }
    const client = await findClientById(payload.clientId);
    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }
    const response = NextResponse.json(
      {
        ok: true,
        client: { id: client.id, name: client.name, email: client.email },
        projectId: payload.projectId,
      },
      { headers: NO_STORE }
    );
    setPortalSessionCookie(response, request, token);
    return response;
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
