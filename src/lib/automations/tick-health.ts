const HOUR_MS = 60 * 60 * 1000;

export function tickHealth(lastTickAt: string | undefined, now = new Date()): {
  ok: boolean;
  warning: boolean;
  ageHours: number | null;
  label: string;
} {
  if (!lastTickAt) {
    return { ok: false, warning: true, ageHours: null, label: "No successful tick yet" };
  }
  const at = Date.parse(lastTickAt);
  if (Number.isNaN(at)) {
    return { ok: false, warning: true, ageHours: null, label: "Last tick time is unreadable" };
  }
  const ageHours = (now.getTime() - at) / HOUR_MS;
  const warning = ageHours > 2;
  return {
    ok: !warning,
    warning,
    ageHours,
    label: warning ? "Last tick is more than 2 hours old" : "Tick is on time",
  };
}
