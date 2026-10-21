import { NextResponse } from "next/server";
import { findClientByEmail } from "@/lib/clients";
import { findProjectsByClient } from "@/lib/projects";
import { consumeMagicLink } from "@/lib/portal-magic";
import { createAccessToken, setPortalSessionCookie } from "@/lib/portal-auth";

export const runtime = "nodejs";

/** Single-use sign-in. A second open of the same link does not start a session. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() || "";
  const email = token ? await consumeMagicLink(token) : null;
  const login = new URL("/portal/login?magic=invalid", request.url);
  if (!email) return NextResponse.redirect(login);
  const client = await findClientByEmail(email);
  if (!client) return NextResponse.redirect(login);
  const projects = await findProjectsByClient(client.id);
  const session = createAccessToken(client.id, client.email, projects[0]?.id || "");
  const response = NextResponse.redirect(new URL("/portal", request.url));
  setPortalSessionCookie(response, request, session);
  return response;
}
