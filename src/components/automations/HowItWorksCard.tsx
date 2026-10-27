import { CHANNEL_NOTE, howItWorks } from "@/lib/automations/how-it-works";

const ROWS = [
  ["trigger", "Starts when"],
  ["needs", "You provide"],
  ["does", "It does"],
  ["sees", "You see"],
  ["sends", "It sends"],
] as const;

/** Plain-language card: what starts it, what it needs, what it does and sends. */
export function HowItWorksCard({ templateId, title, id }: { templateId: string; title?: string; id?: string }) {
  const card = howItWorks(templateId);
  if (!card) return null;
  return (
    <article id={id} className="sleek-card scroll-mt-28 rounded-2xl p-5">
      <h3 className="font-display text-base font-semibold text-heading">{title || "How it works"}</h3>
      <dl className="mt-3 space-y-2 text-sm">
        {ROWS.map(([key, label]) => (
          <div key={key} className="grid gap-1 sm:grid-cols-[7rem_1fr]">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
            <dd className="text-foreground">{card[key]}</dd>
          </div>
        ))}
        <div className="grid gap-1 sm:grid-cols-[7rem_1fr]">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">To turn on</dt>
          <dd className="text-muted">
            {CHANNEL_NOTE.email}
            {card.phone ? ` ${CHANNEL_NOTE.phone}` : ""}
          </dd>
        </div>
      </dl>
    </article>
  );
}
