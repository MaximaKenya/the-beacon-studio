import { productCount } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SuiteLine } from "@/components/brand/SuiteLine";
import { ProductCarousel } from "@/components/sections/ProductCarousel";

export function ProductSuite() {
  return (
    <section id="products" className="section-wash-projects relative overflow-hidden py-24 lg:py-32">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal variant="slide-left">
          <SectionHeading
            label="Product Suite"
            title={`${productCount} products. One studio.`}
            description="Each slide is a landing-style preview of what the software does. Open a product to visit its public URL, GitHub repo, or page on this site."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.04}>
          <div className="mt-6">
            <SuiteLine size="md" align="left" />
          </div>
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
