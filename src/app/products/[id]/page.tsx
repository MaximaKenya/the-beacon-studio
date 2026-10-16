import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/data/site";
import { ProductDetail } from "@/components/products/ProductDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return siteConfig.products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = siteConfig.products.find((p) => p.id === id);
  if (!product) return { title: "Product not found" };

  const description = product.pricing
    ? `${product.description} ${product.pricing}`
    : product.description;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} · ${siteConfig.brand.name}`,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = siteConfig.products.find((p) => p.id === id);
  if (!product) notFound();

  const related = siteConfig.products.filter((p) => p.id !== product.id).slice(0, 3);

  return <ProductDetail product={product} related={related} />;
}
