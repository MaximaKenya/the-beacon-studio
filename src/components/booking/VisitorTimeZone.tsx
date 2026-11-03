"use client";

import { useSyncExternalStore } from "react";
import { getTimezoneLabel } from "@/lib/booking-utils";
import { formatSlotInZone, visitorZone } from "@/lib/visitor-time";

const noopSubscribe = () => () => {};
/** The visitor's zone is browser-only; the server (and hydration) render sees null. */
const getZoneSnapshot = () => visitorZone().zone;
const getServerZoneSnapshot = () => null;

/** Nairobi slots stay as they are. The visitor's zone sits beside the picker. */
export function VisitorTimeZone({ date, time }: { date?: string; time?: string }) {
  const zone = useSyncExternalStore(noopSubscribe, getZoneSnapshot, getServerZoneSnapshot);
  const base = `Times are ${getTimezoneLabel()} (Africa/Nairobi).`;

  let line = base;
  if (zone) {
    const visitor = visitorZone();
    const localSlot = date && time ? formatSlotInZone(date, time, visitor.zone) : "";
    const nairobiSlot = date && time ? formatSlotInZone(date, time, "Africa/Nairobi") : "";
    if (localSlot && visitor.zone !== "Africa/Nairobi") {
      line = `${base} ${nairobiSlot} Nairobi is ${localSlot} in ${visitor.label}.`;
    } else if (visitor.zone === "Africa/Nairobi") {
      line = `${base} That matches your timezone.`;
    } else {
      line = `${base} Your timezone is ${visitor.label}.`;
    }
  }

  return (
    <p className="mt-1 text-xs leading-relaxed text-muted" data-visitor-timezone>
      {line}
    </p>
  );
}
