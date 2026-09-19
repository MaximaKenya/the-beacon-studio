import { NextResponse } from "next/server";
import { siteConfig } from "@/data/site";
import { ensureDataFiles, parseRequestJson, readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { upsertClient, updateClient } from "@/lib/clients";
import { createProjectFromIntake, updateProject } from "@/lib/projects";
import { createQuotation } from "@/lib/documents";
import { createAccessToken } from "@/lib/portal-auth";
import { ensureThread } from "@/lib/messages";

export const runtime = "nodejs";

export type IntakeEntry = {
  id: string;
  projectType: string;
  budget: string;
  timeline: string;
  brief: string;
  name: string;
  email: string;
  company?: string;
  submittedAt: string;
  createdAt?: string;
  read?: boolean;
  status?: string;
  projectId?: string;
  clientId?: string;
  contacted?: boolean;
  adminNotes?: string;
};

export async function POST(request: Request) {
  try {
    await ensureDataFiles();

    if (!siteConfig.intake.enabled) {
      return NextResponse.json({ error: "Intake is disabled." }, { status: 403 });
    }

    const body = await parseRequestJson(request);
    const projectType = typeof body.projectType === "string" ? body.projectType.trim() : "";
    const budget = typeof body.budget === "string" ? body.budget.trim() : "";
    const timeline = typeof body.timeline === "string" ? body.timeline.trim() : "";
    const brief = typeof body.brief === "string" ? body.brief.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const company =
      typeof body.company === "string" && body.company.trim()
        ? body.company.trim()
        : undefined;

    const validType = siteConfig.intake.projectTypes.some((t) => t.id === projectType);
    const validBudget = siteConfig.intake.budgets.some((b) => b.id === budget);
    const validTimeline = siteConfig.intake.timelines.some((t) => t.id === timeline);

    if (!validType || !validBudget || !validTimeline) {
      return NextResponse.json({ error: "Invalid intake options." }, { status: 400 });
    }
    if (brief.length < 20) {
      return NextResponse.json(
        { error: "Please share a bit more in the brief (20+ characters)." },
        { status: 400 }
      );
    }
    if (!name || name.length > 120) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const intakes = await readJsonFile<IntakeEntry[]>("intakes.json", []);

    const entry: IntakeEntry = {
      id: `intake-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectType,
      budget,
      timeline,
      brief,
      name,
      email,
      ...(company ? { company } : {}),
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      read: false,
      status: "new",
    };

    // Create client + project + quotation for portal
    const client = await upsertClient({ email, name, company });
    const project = await createProjectFromIntake({
      clientId: client.id,
      intakeId: entry.id,
      name,
      projectType,
      budget,
      timeline,
      brief,
    });
    const quotation = await createQuotation({ project, client });
    await updateProject(project.id, {
      quotationId: quotation.id,
      status: "quoted",
    });

    const accessToken = createAccessToken(client.id, client.email, project.id);
    await updateClient(client.id, { accessToken });
    await ensureThread(project.id, client.id);

    entry.projectId = project.id;
    entry.clientId = client.id;
    intakes.push(entry);
    await writeJsonFile("intakes.json", intakes);

    return NextResponse.json({
      success: true,
      intake: entry,
      portal: {
        clientId: client.id,
        projectId: project.id,
        accessToken,
        portalPath: `/portal/login?token=${encodeURIComponent(accessToken)}`,
        quotationId: quotation.id,
        quotation,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save intake.";
    console.error("[intake]", message);
    return NextResponse.json(
      { error: "Failed to save intake. Please try again." },
      { status: 500 }
    );
  }
}
