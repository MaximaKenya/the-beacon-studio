"use client";

import { ProductSuite } from "@/components/sections/ProductSuite";
import { MotionGallery } from "@/components/gallery/MotionGallery";
import { productShots } from "@/data/product-shots";
import { siteConfig } from "@/data/site";
import { Services } from "@/components/sections/Services";
import { ExampleResults } from "@/components/sections/ExampleResults";
import { RoiCalculator } from "@/components/sections/RoiCalculator";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PriceEstimate } from "@/components/sections/PriceEstimate";
import { Pricing } from "@/components/sections/Pricing";
import { StudioComparison } from "@/components/sections/StudioComparison";
import { Faq } from "@/components/sections/Faq";
import { ChecklistBanner } from "@/components/sections/ChecklistBanner";
import { LeadCapture } from "@/components/sections/LeadCapture";
import { FinalCta } from "@/components/sections/FinalCta";
import { Testimonials } from "@/components/sections/Testimonials";
import { PublicReviews } from "@/components/sections/PublicReviews";
import { Contact } from "@/components/sections/Contact";

/** Below-the-fold homepage. Loaded as its own chunk so motion stays off the first paint. */
export function HomeRest() {
  return (
    <>
      <ProductSuite />
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
        <MotionGallery
          shots={productShots}
          products={siteConfig.products.map((p) => ({ id: p.id, name: p.name }))}
          name="The Beacon Studio"
          title="Every screen, in motion"
          description={`${productShots.length} real screens from all ${siteConfig.products.length} products. Filter, hover, tap to enlarge.`}
        />
      </div>
      <Services />
      <ExampleResults />
      <RoiCalculator />
      <HowItWorks />
      <PriceEstimate />
      <Pricing />
      <StudioComparison />
      <Faq />
      <ChecklistBanner />
      <LeadCapture />
      <FinalCta />
      <Testimonials />
      <PublicReviews />
      <Contact />
    </>
  );
}
