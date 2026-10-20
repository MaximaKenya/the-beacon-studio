export type Slot = { start: string; label: string };

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Next bookable slots in Africa/Nairobi, skipping ones already taken. */
export function upcomingSlots(
  config: Record<string, unknown>,
  taken: string[],
  now = new Date()
): Slot[] {
  const days = String(config.days || "1,2,3,4,5")
    .split(/[^0-9]+/)
    .map((part) => Number(part))
    .filter((day) => day >= 1 && day <= 7);
  const allowed = new Set(days.length ? days : [1, 2, 3, 4, 5]);
  const [startH, startM] = String(config.start || "09:00").split(":").map((part) => Number(part) || 0);
  const [endH, endM] = String(config.end || "17:00").split(":").map((part) => Number(part) || 0);
  const slotMinutes = Math.min(180, Math.max(15, Number(config.slotMinutes) || 30));
  const takenSet = new Set(taken);
  const slots: Slot[] = [];
  const nairobiNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  for (let dayOffset = 0; dayOffset < 21 && slots.length < 24; dayOffset += 1) {
    const day = new Date(Date.UTC(nairobiNow.getUTCFullYear(), nairobiNow.getUTCMonth(), nairobiNow.getUTCDate() + dayOffset));
    const weekday = day.getUTCDay() === 0 ? 7 : day.getUTCDay();
    if (!allowed.has(weekday)) continue;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    for (let minute = startMinutes; minute + slotMinutes <= endMinutes; minute += slotMinutes) {
      const utc = new Date(day.getTime() + (minute - 3 * 60) * 60 * 1000);
      if (utc.getTime() < now.getTime() + 30 * 60 * 1000) continue;
      const iso = utc.toISOString();
      if (takenSet.has(iso)) continue;
      const label = `${day.toISOString().slice(0, 10)} ${pad(Math.floor(minute / 60))}:${pad(minute % 60)} EAT`;
      slots.push({ start: iso, label });
      if (slots.length >= 24) break;
    }
  }
  return slots;
}
