import Link from "next/link";
import { ChecklistForm } from "@/components/checklist/ChecklistForm";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { CHECKLIST_ITEMS, CHECKLIST_TITLE } from "@/lib/checklist";
import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

const faqs = [
  {
    id: "check-1",
    question: "What do I get?",
    answer: "An HTML file and a PDF of the same ten-point checklist for Kenyan SMEs. It is a planning list, not a quote.",
  },
  {
    id: "check-2",
    question: "Why do you ask for an email?",
    answer: "The download is gated so we can follow up. Your email is stored as a lead in the studio admin.",
  },
];

export const metadata = pageMetadata({
  title: CHECKLIST_TITLE,
  description:
    "Download a free AI automation checklist for Kenyan SMEs. Ten checks before you automate one repetitive job. Nairobi.",
  path: "/checklist",
  keywords: ["AI automation Kenya", "SME checklist", "Kenyan SMEs", siteConfig.brand.name],
});

export default function ChecklistPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-24 pt-28 lg:grid-cols-[1fr_0.9fr] lg:px-8">
      <FaqJsonLd items={faqs} />
      <div>
        <p className="text-sm font-medium text-accent">Lead magnet · {siteConfig.location}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-heading">{CHECKLIST_TITLE}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Use it to pick one job before the free audit. It does not replace a quote.
        </p>
        <ol className="mt-8 space-y-4">
          {CHECKLIST_ITEMS.map((item, index) => (
            <li key={item.title} className="sleek-card rounded-3xl p-5">
              <h2 className="font-display text-lg font-semibold text-heading">
                {index + 1}. {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted">
          Ready to talk through one item?{" "}
          <Link href="/book" className="text-accent hover:underline">
            Book the free 20-minute audit
          </Link>
          .
        </p>
      </div>
      <div>
        <ChecklistForm />
      </div>
    </div>
  );
}
