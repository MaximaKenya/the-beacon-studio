"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

type PublicReview = {
  id: string;
  quote: string;
  author: string;
  rating: number;
};

/** Renders nothing until an admin has approved at least one review. */
export function PublicReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);

  useEffect(() => {
    void fetch("/api/reviews")
      .then((res) => res.json())
      .then((data: { reviews?: PublicReview[] }) => {
        if (Array.isArray(data.reviews)) setReviews(data.reviews);
      })
      .catch(() => undefined);
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="relative border-t border-border py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="Reviews"
          title="From clients"
          description="Short notes we have approved to share."
        />
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm leading-relaxed text-foreground">“{review.quote}”</p>
              <p className="mt-3 text-sm text-muted">
                {review.author} · {review.rating}/5
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
