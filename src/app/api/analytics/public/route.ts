import { NextResponse } from "next/server";
import { getAnalyticsStore, summarizeAnalytics } from "@/lib/analytics-store";
import { siteConfig } from "@/data/site";
import { listProjects } from "@/lib/projects";

export const runtime = "nodejs";

/**
 * Public, non-sensitive analytics snapshot for homepage pulse.
 * No emails, revenue, personal paths, or admin funnels.
 */
export async function GET() {
  const store = await getAnalyticsStore();
  const summary = summarizeAnalytics(store);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const visitorsThisWeek = new Set(
    store.events
      .filter((e) => e.name === "page_view" && e.ts >= weekAgo)
      .map((e) => e.visitorId)
  ).size;

  const reactionTotal = Object.values(summary.reactions.counts).reduce(
    (a, b) => a + b,
    0
  );

  const productsExplored = summary.topProducts.map((p) => ({
    name:
      siteConfig.products.find((x) => x.id === p.id)?.name ?? p.id,
    count: p.clicks,
  }));

  let portalProjectsActive = 0;
  try {
    const projects = await listProjects();
    portalProjectsActive = projects.filter(
      (p) => p.status === "active" || p.status === "quoted" || p.status === "intake"
    ).length;
  } catch {
    portalProjectsActive = 0;
  }

  return NextResponse.json({
    visitorsThisWeek,
    reactionTotal,
    reactionMosaic: summary.reactions.counts,
    productsExplored,
    suiteSize: siteConfig.products.length,
    /** Aggregate only — no client names or emails */
    portalProjectsActive,
  });
}
