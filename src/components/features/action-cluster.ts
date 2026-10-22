/**
 * Placement for the single bottom-right action cluster.
 *
 * One control is allowed at the bottom of the screen. A full-width bar
 * (product CTA, or a future cookie banner that publishes data-bottom-bar)
 * hides the cluster on narrow viewports. On wider screens the cluster lifts
 * above that bar. The chat panel, booking modal, splash, and any in-flow
 * footer or page CTA that enters the corner hide it completely.
 */

export const ASSISTANT_COMPACT_LABEL = "AI";

export const CLUSTER_ACTION_LABELS = {
  chat: "Chat with AI",
  whatsapp: "WhatsApp",
  call: "Call",
  book: "Book a call",
} as const;

export type ClusterActionId = keyof typeof CLUSTER_ACTION_LABELS;

export type ClusterPlacement = "hidden" | "docked" | "lifted";

export function clusterActions(flags: {
  assistant: boolean;
  phone: boolean;
  booking: boolean;
}): ClusterActionId[] {
  const actions: ClusterActionId[] = [];
  if (flags.assistant) actions.push("chat");
  if (flags.phone) {
    actions.push("whatsapp");
    actions.push("call");
  }
  if (flags.booking) actions.push("book");
  return actions;
}

export function clusterPlacement(input: {
  chatOpen: boolean;
  bookingOpen: boolean;
  splashOpen: boolean;
  /** A fixed full-width bottom bar is on screen (product CTA or cookie banner). */
  bottomBar: boolean;
  /** Viewport is below the md breakpoint. */
  narrow: boolean;
  /** Footer or an in-flow page CTA intersects the cluster corner. */
  cornerBlocked: boolean;
}): ClusterPlacement {
  if (input.chatOpen || input.bookingOpen || input.splashOpen) return "hidden";
  if (input.bottomBar && input.narrow) return "hidden";
  if (input.cornerBlocked) return "hidden";
  if (input.bottomBar) return "lifted";
  return "docked";
}
