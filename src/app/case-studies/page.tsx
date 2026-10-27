import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Case studies",
  description: "Client results from The Beacon Studio. Coming soon.",
  path: "/case-studies",
});

/** Empty structure on purpose: no case study is published until a client approves it. */
const CASE_STUDIES: { slug: string; title: string; summary: string }[] = [];

export default function CaseStudiesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Case studies</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">Case studies.</h1>
      {CASE_STUDIES.length === 0 ? (
        <div className="sleek-card mt-10 rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold text-heading">Coming soon</h2>
          <p className="mt-1 text-sm text-muted">
            We publish results only with client approval. Meanwhile, see <Link href="/work" className="text-accent">our work</Link>.
          </p>
        </div>
      ) : null}
    </div>
  );
}
