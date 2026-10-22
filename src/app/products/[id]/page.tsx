import { notFound } from "next/navigation";
import { siteConfig } from "@/data/site";
import { ProductDetail } from "@/components/products/ProductDetail";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { JsonLd } from "@/components/seo/OrganizationJsonLd";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return siteConfig.products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const product = siteConfig.products.find((p) => p.id === id);
  if (!product) return { title: "Product not found" };

  const description = product.pricing
    ? `${product.description} ${product.pricing}`
    : product.description;

  return pageMetadata({
    title: product.name,
    description,
    path: `/products/${product.id}`,
    keywords: [product.name, ...product.tags, "AI automation Kenya"],
  });
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = siteConfig.products.find((p) => p.id === id);
  if (!product) notFound();

  const related = siteConfig.products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: product.name, path: `/products/${product.id}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          brand: { "@type": "Brand", name: siteConfig.brand.name },
          url: absoluteUrl(`/products/${product.id}`),
          ...(product.pricing ? { offers: { "@type": "Offer", description: product.pricing } } : {}),
        }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
