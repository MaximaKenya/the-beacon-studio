/** Nairobi wall time, shown in the visitor's zone. Slots stay Africa/Nairobi. */
export function formatSlotInZone(dateKey: string, time: string, zone: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !/^\d{2}:\d{2}$/.test(time) || !zone) return "";
  const ref = new Date(`${dateKey}T${time}:00+03:00`);
  if (Number.isNaN(ref.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(ref);
}

export function visitorZone(now = new Date()): { zone: string; label: string } {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const shortName =
    new Intl.DateTimeFormat("en", { timeZone: zone, timeZoneName: "short" })
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value || zone;
  return { zone, label: `${zone.replace(/_/g, " ")} (${shortName})` };
}
