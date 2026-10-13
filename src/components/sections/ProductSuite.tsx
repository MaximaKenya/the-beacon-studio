import { productCount } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCarousel } from "@/components/sections/ProductCarousel";

export function ProductSuite() {
  return (
    <section id="products" className="section-wash-projects relative overflow-hidden py-28 lg:py-40">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal variant="slide-left">
          <SectionHeading
            label="Product Suite"
            title={`${productCount} products. One studio.`}
            description="Hover a frame, then open the live app, repo, or page."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="mt-10">
            <ProductCarousel />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
