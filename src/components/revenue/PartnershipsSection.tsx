import { partnershipProgramme } from "@/data/site";
import { RequestForm } from "@/components/revenue/RequestForm";

/** Associations, accountants and advisers. Commission is a note only; no figures. */
export function PartnershipsSection() {
  return (
    <section id="partnerships" className="mt-16 scroll-mt-28" aria-labelledby="partnerships-title">
      <h2 id="partnerships-title" className="font-display text-2xl font-semibold text-heading">
        Partnerships for associations and accountants
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">Introduce members or clients to automations that save them time. We do the build and support.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="sleek-card rounded-3xl p-6">
          <h3 className="font-display text-lg font-semibold text-heading">Who it is for</h3>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            {partnershipProgramme.audiences.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">{partnershipProgramme.commissionNote}</p>
        </div>
        <RequestForm kind="partnership" title="Partnership enquiry" companyRequired submitLabel="Send enquiry" messagePlaceholder="Your organisation and how many members or clients." />
      </div>
    </section>
  );
}
