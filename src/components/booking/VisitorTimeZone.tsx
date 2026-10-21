"use client";

import { useEffect, useState } from "react";
import { getTimezoneLabel } from "@/lib/booking-utils";
import { formatSlotInZone, visitorZone } from "@/lib/visitor-time";

/** Nairobi slots stay as they are. The visitor's zone sits beside the picker. */
export function VisitorTimeZone({ date, time }: { date?: string; time?: string }) {
  const [line, setLine] = useState(`Times are ${getTimezoneLabel()} (Africa/Nairobi).`);

  useEffect(() => {
    const visitor = visitorZone();
    const localSlot = date && time ? formatSlotInZone(date, time, visitor.zone) : "";
    const nairobiSlot = date && time ? formatSlotInZone(date, time, "Africa/Nairobi") : "";
    if (localSlot && visitor.zone !== "Africa/Nairobi") {
      setLine(
        `Times are ${getTimezoneLabel()} (Africa/Nairobi). ${nairobiSlot} Nairobi is ${localSlot} in ${visitor.label}.`
      );
      return;
    }
    if (visitor.zone === "Africa/Nairobi") {
      setLine(`Times are ${getTimezoneLabel()} (Africa/Nairobi). That matches your timezone.`);
      return;
    }
    setLine(`Times are ${getTimezoneLabel()} (Africa/Nairobi). Your timezone is ${visitor.label}.`);
  }, [date, time]);

  return (
    <p className="mt-1 text-xs leading-relaxed text-muted" data-visitor-timezone>
      {line}
    </p>
  );
}
