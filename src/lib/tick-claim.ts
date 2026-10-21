/** How long a claim blocks a second tick. Long enough for a slow email send. */
export const CLAIM_WINDOW_MS = 20 * 60 * 1000;

export function claimIsFresh(stamp: string | undefined, nowMs: number, windowMs = CLAIM_WINDOW_MS): boolean {
  if (!stamp) return false;
  const at = Date.parse(stamp);
  if (Number.isNaN(at)) return false;
  const age = nowMs - at;
  return age >= 0 && age < windowMs;
}

export function jobClaimable(
  job: { status: string; runAt: string; claimedAt?: string },
  nowMs: number
): boolean {
  const runAt = Date.parse(job.runAt);
  if (Number.isNaN(runAt) || runAt > nowMs) return false;
  if (job.status === "done" || job.status === "cancelled") return false;
  if (job.status === "running" && claimIsFresh(job.claimedAt, nowMs)) return false;
  return job.status === "due" || job.status === "running";
}
