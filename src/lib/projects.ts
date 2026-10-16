import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { addDaysIso } from "@/lib/time";
import { getDepositPercent } from "@/lib/payments";
import { siteConfig } from "@/data/site";

const FILE = "projects.json";

export type Milestone = {
  id: string;
  title: string;
  percent: number;
  done: boolean;
  note?: string;
};

export type ProjectUpdate = {
  id: string;
  at: string;
  message: string;
  by: "admin" | "system";
};

export type ReviewVisibility = "pending" | "approved" | "hidden";

export type ProjectReview = {
  id: string;
  at: string;
  author: string;
  rating: number;
  comment: string;
  /** Public pages and Glow only show "approved". Missing means pending. */
  visibility?: ReviewVisibility;
};

export type ProjectStatus =
  | "intake"
  | "quoted"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export type ProjectRecord = {
  id: string;
  clientId: string;
  intakeId?: string;
  title: string;
  status: ProjectStatus;
  projectType: string;
  budget: string;
  timeline: string;
  brief: string;
  milestones: Milestone[];
  /** Overall progress 0–100 (derived or admin override) */
  progressPercent: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  nextPaymentCurrency?: string;
  costFrom?: number;
  costTo?: number;
  depositAmount?: number;
  depositPercent?: number;
  quotationId?: string;
  updates: ProjectUpdate[];
  reviews: ProjectReview[];
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
};

function defaultMilestones(): Milestone[] {
  return [
    { id: "m1", title: "Discovery & scope", percent: 15, done: true },
    { id: "m2", title: "Design & architecture", percent: 25, done: false },
    { id: "m3", title: "Build & weekly demos", percent: 40, done: false },
    { id: "m4", title: "Launch & handoff", percent: 20, done: false },
  ];
}

function estimateFromIntake(projectType: string, budget: string): {
  costFrom: number;
  costTo: number;
  weeks: number;
} {
  const estimator = siteConfig.estimator.projectTypes.find((t) => t.id === projectType);

  const budgetMap: Record<string, [number, number]> = {
    "under-500": [300, 500],
    "under-2k": [800, 2000],
    "under-5k": [2000, 5000],
    "5-15k": [5000, 15000],
    "15-40k": [15000, 40000],
    "40k-plus": [40000, 80000],
    explore: [800, 5000],
  };

  const range = budgetMap[budget] ?? [
    estimator?.baseCostFrom ?? 800,
    estimator?.baseCostTo ?? 3000,
  ];

  return {
    costFrom: estimator?.baseCostFrom ?? range[0],
    costTo: estimator?.baseCostTo ?? range[1],
    weeks: estimator?.baseWeeks ?? 4,
  };
}

export function computeProgress(milestones: Milestone[]): number {
  if (!milestones.length) return 0;
  const doneWeight = milestones.filter((m) => m.done).reduce((s, m) => s + m.percent, 0);
  return Math.min(100, Math.round(doneWeight));
}

export async function listProjects(): Promise<ProjectRecord[]> {
  return readJsonFile<ProjectRecord[]>(FILE, []);
}

export async function findProjectById(id: string): Promise<ProjectRecord | null> {
  const all = await listProjects();
  return all.find((p) => p.id === id) ?? null;
}

export async function findProjectsByClient(clientId: string): Promise<ProjectRecord[]> {
  const all = await listProjects();
  return all.filter((p) => p.clientId === clientId);
}

export async function createProjectFromIntake(input: {
  clientId: string;
  intakeId: string;
  name: string;
  projectType: string;
  budget: string;
  timeline: string;
  brief: string;
}): Promise<ProjectRecord> {
  const typeMeta = siteConfig.intake.projectTypes.find((t) => t.id === input.projectType);
  const quoteOnly = Boolean(typeMeta?.quoteOnly);
  const estimate = estimateFromIntake(input.projectType, input.budget);
  const depositPercent = quoteOnly ? 0 : getDepositPercent();
  const depositAmount = quoteOnly
    ? 0
    : Math.round(estimate.costFrom * (depositPercent / 100) * 100) / 100;
  const typeLabel = typeMeta?.label ?? input.projectType;
  const milestones = quoteOnly
    ? [
        { id: "m1", title: "Free assessment", percent: 20, done: false },
        { id: "m2", title: "Setup", percent: 50, done: false },
        { id: "m3", title: "Handover and support", percent: 30, done: false },
      ]
    : defaultMilestones();
  const now = new Date().toISOString();

  const project: ProjectRecord = {
    id: randomUUID(),
    clientId: input.clientId,
    intakeId: input.intakeId,
    title: `${typeLabel} — ${input.name}`,
    status: "intake",
    projectType: input.projectType,
    budget: input.budget,
    timeline: input.timeline,
    brief: input.brief,
    milestones,
    progressPercent: computeProgress(milestones),
    nextPaymentDate: quoteOnly ? undefined : addDaysIso(14),
    nextPaymentAmount: quoteOnly ? undefined : depositAmount,
    nextPaymentCurrency: "USD",
    costFrom: quoteOnly ? 0 : estimate.costFrom,
    costTo: quoteOnly ? 0 : estimate.costTo,
    depositAmount,
    depositPercent,
    updates: [
      {
        id: randomUUID(),
        at: now,
        message: quoteOnly
          ? "Request received. The price is quoted after a free assessment."
          : "Project created from intake. Quotation ready — deposit unlocks kickoff.",
        by: "system",
      },
    ],
    reviews: [],
    createdAt: now,
    updatedAt: now,
  };

  const all = await listProjects();
  all.unshift(project);
  await writeJsonFile(FILE, all);
  return project;
}

export async function updateProject(
  id: string,
  patch: Partial<ProjectRecord>
): Promise<ProjectRecord | null> {
  const all = await listProjects();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const merged = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  if (patch.milestones) {
    merged.progressPercent = computeProgress(patch.milestones);
  }
  all[idx] = merged;
  await writeJsonFile(FILE, all);
  return merged;
}

export async function addProjectUpdate(
  id: string,
  message: string,
  by: "admin" | "system" = "admin"
): Promise<ProjectRecord | null> {
  const project = await findProjectById(id);
  if (!project) return null;
  const updates = [
    { id: randomUUID(), at: new Date().toISOString(), message, by },
    ...project.updates,
  ];
  return updateProject(id, { updates });
}

export async function addProjectReview(
  id: string,
  review: Omit<ProjectReview, "id" | "at">
): Promise<ProjectRecord | null> {
  const project = await findProjectById(id);
  if (!project) return null;
  const reviews = [
    {
      id: randomUUID(),
      at: new Date().toISOString(),
      visibility: "pending" as const,
      ...review,
    },
    ...project.reviews,
  ];
  return updateProject(id, { reviews });
}

export async function setReviewVisibility(
  projectId: string,
  reviewId: string,
  visibility: ReviewVisibility
): Promise<ProjectRecord | null> {
  const project = await findProjectById(projectId);
  if (!project) return null;
  const reviews = project.reviews.map((review) =>
    review.id === reviewId ? { ...review, visibility } : review
  );
  if (!reviews.some((review) => review.id === reviewId)) return null;
  return updateProject(projectId, { reviews });
}

/** Reviews the public site and Glow may quote. Pending and hidden stay private. */
export async function listApprovedReviews(): Promise<
  { id: string; quote: string; author: string; rating: number; at: string }[]
> {
  const projects = await listProjects();
  return projects
    .flatMap((project) => project.reviews)
    .filter((review) => review.visibility === "approved")
    .map((review) => ({
      id: review.id,
      quote: review.comment,
      author: review.author,
      rating: review.rating,
      at: review.at,
    }));
}
