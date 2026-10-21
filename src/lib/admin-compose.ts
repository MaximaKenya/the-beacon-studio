export type AdminComposeRequest = {
  to: string;
  subject?: string;
  text?: string;
};

/** Open the in-app mailbox composer. Lead views use this instead of mailto. */
export function openAdminCompose(to: string, subject = "", text = "") {
  if (typeof window === "undefined" || !to.trim()) return;
  document.getElementById("mailbox")?.scrollIntoView({ behavior: "smooth" });
  window.dispatchEvent(
    new CustomEvent("beacon-open-mail", {
      detail: { compose: { to: to.trim(), subject, text } satisfies AdminComposeRequest },
    })
  );
}
