import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { AuditBooking } from "@/components/booking/AuditBooking";
import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

const faqs = [
  {
    id: "book-1",
    question: "Is the 20-minute audit free?",
    answer: "Yes. You pay nothing to book it. A priced job starts only after we agree what success looks like.",
  },
  {
    id: "book-2",
    question: "What should I bring?",
    answer: "One repetitive job, the tools you use today, and an example message. That is enough for 20 minutes.",
  },
  {
    id: "book-3",
    question: "Will I get a confirmation email?",
    answer:
      "The slot is saved either way. A confirmation with a calendar file is emailed when Resend is configured for the studio.",
  },
];

export const metadata = pageMetadata({
  title: "Book a free 20-minute AI automation audit",
  description:
    "Pick a weekday slot for a free 20-minute automation audit with The Beacon Studio in Nairobi. AI automation Kenya.",
  path: "/book",
  keywords: ["AI automation Kenya", "free automation audit", "Nairobi", siteConfig.brand.name],
});

export default function BookPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8">
      <FaqJsonLd items={faqs} />
      <p className="text-sm font-medium text-accent">{siteConfig.brand.name} · {siteConfig.location}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-heading">
        Book a free 20-minute audit
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted">
        We look at one repetitive job — replies, reminders, or follow-ups — and say whether a ready-made automation or a custom pilot fits. {siteConfig.phoneDisplay}.
      </p>
      <div className="mt-8">
        <AuditBooking />
      </div>
      <section className="mt-10 space-y-3" aria-labelledby="book-faq">
        <h2 id="book-faq" className="font-display text-2xl font-semibold text-heading">
          Questions
        </h2>
        {faqs.map((item) => (
          <details key={item.id} className="sleek-card rounded-3xl p-5">
            <summary className="cursor-pointer font-medium text-foreground">{item.question}</summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.answer}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
