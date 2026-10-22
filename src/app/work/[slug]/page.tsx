import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/work/CaseStudyView";
import { workBySlug, workStudies } from "@/data/work";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return workStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const study = workBySlug(slug);
  if (!study) return { title: "Work" };
  return pageMetadata({
    title: study.title,
    description: study.description,
    path: study.path,
    keywords: [study.title, "Nairobi", "The Beacon Studio"],
  });
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const study = workBySlug(slug);
  if (!study) notFound();
  return <CaseStudyView study={study} />;
}
