import { leadTemplates, paidTemplateSlots } from "@/data/site";
import { TemplateDownload } from "@/components/revenue/TemplateDownload";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free business templates",
  description: "Free rent, school fee, lead and invoice templates for Kenyan businesses. Enter your email to download.",
  path: "/templates",
});

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Templates</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">Free templates.</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">Spreadsheets and checklists we use with clients. Enter your email to download.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {leadTemplates.map((template) => (
          <article key={template.id} className="sleek-card rounded-3xl p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">{template.format.toUpperCase()} · Free</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-heading">{template.title}</h2>
            <p className="mt-1 text-sm text-muted">{template.summary}</p>
            <TemplateDownload id={template.id} />
          </article>
        ))}
      </div>
      <h2 className="mt-16 font-display text-2xl font-semibold text-heading">Premium packs</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {paidTemplateSlots.map((slot) => (
          <article key={slot.id} className="sleek-card rounded-3xl p-6 opacity-80">
            <h3 className="font-display text-base font-semibold text-heading">{slot.title}</h3>
            <p className="mt-1 text-sm text-muted">{slot.status}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
