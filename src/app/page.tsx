import { Hero } from "@/components/sections/Hero";
import { ProductSuite } from "@/components/sections/ProductSuite";
import { Services } from "@/components/sections/Services";
import { RoiCalculator } from "@/components/sections/RoiCalculator";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { LeadCapture } from "@/components/sections/LeadCapture";
import { FinalCta } from "@/components/sections/FinalCta";
import { PublicReviews } from "@/components/sections/PublicReviews";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <ProductSuite />
      <Services />
      <RoiCalculator />
      <HowItWorks />
      <Pricing />
      <Faq />
      <LeadCapture />
      <FinalCta />
      <PublicReviews />
      <Contact />
    </>
  );
}
