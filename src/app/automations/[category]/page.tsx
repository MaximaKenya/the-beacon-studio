import { notFound } from "next/navigation";
import { SeoLandingView, LandingJsonLd } from "@/components/landing/SeoLandingView";
import { categoryLandings, landingBySlug } from "@/data/landings";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return categoryLandings.map((page) => ({ category: page.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const page = landingBySlug("category", category);
  if (!page) return { title: "Automation" };
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: page.path,
    keywords: page.keywords,
  });
}

export default async function AutomationCategoryPage({ params }: Props) {
  const { category } = await params;
  const page = landingBySlug("category", category);
  if (!page) notFound();
  return (
    <>
      <LandingJsonLd page={page} />
      <SeoLandingView page={page} />
    </>
  );
}
