import { notFound } from "next/navigation";
import { LandingJsonLd, SeoLandingView } from "@/components/landing/SeoLandingView";
import { industryLandings, landingBySlug } from "@/data/landings";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industryLandings.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = landingBySlug("industry", slug);
  if (!page) return { title: "Industry" };
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    keywords: page.keywords,
  });
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const page = landingBySlug("industry", slug);
  if (!page) notFound();
  return (
    <>
      <LandingJsonLd page={page} />
      <SeoLandingView page={page} />
    </>
  );
}
