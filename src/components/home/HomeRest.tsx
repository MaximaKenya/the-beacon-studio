"use client";

import { ProductSuite } from "@/components/sections/ProductSuite";
import { Services } from "@/components/sections/Services";
import { ExampleResults } from "@/components/sections/ExampleResults";
import { RoiCalculator } from "@/components/sections/RoiCalculator";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
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
      <Services />
      <ExampleResults />
      <RoiCalculator />
      <HowItWorks />
      <Pricing />
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
