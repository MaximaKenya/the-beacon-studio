import { Hero } from "@/components/sections/Hero";
import { SuiteStatusStrip } from "@/components/sections/SuiteStatusStrip";
import { ProductSuite } from "@/components/sections/ProductSuite";
import { ShippingFeed } from "@/components/sections/ShippingFeed";
import { TechStackShowcase } from "@/components/sections/TechStackShowcase";
import { Services } from "@/components/sections/Services";
import { Pricing } from "@/components/sections/Pricing";
import { PricingFaqTeaser } from "@/components/sections/PricingFaqTeaser";
import { EngagementModels } from "@/components/sections/EngagementModels";
import { Comparison } from "@/components/sections/Comparison";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ReliabilityStrip } from "@/components/sections/ReliabilityStrip";
import { ScopeEstimator } from "@/components/sections/ScopeEstimator";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { BookingSection } from "@/components/features/BookingSection";
import { ProductRecommender } from "@/components/features/ProductRecommender";
import { ReactionWidget } from "@/components/features/ReactionWidget";
import { PublicAnalyticsPulse } from "@/components/sections/PublicAnalyticsPulse";
import { TrustMetricsStrip } from "@/components/sections/TrustMetricsStrip";
import { SectionDivider } from "@/components/ui/SectionDivider";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustMetricsStrip />
      <div className="mx-auto max-w-6xl px-6 pb-4 lg:px-8">
        <ReactionWidget placement="inline" />
      </div>
      <SuiteStatusStrip />
      <SectionDivider variant="fade" />
      <ProductSuite />
      <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <ReactionWidget placement="inline" />
      </div>
      <SectionDivider variant="rule" />
      <ProductRecommender />
      <SectionDivider variant="hairline" />
      <ShippingFeed />
      <SectionDivider variant="hairline" />
      <TechStackShowcase />
      <SectionDivider variant="fade" />
      <Services />
      <SectionDivider variant="hairline" />
      <Pricing />
      <PricingFaqTeaser />
      <SectionDivider variant="fade" />
      <EngagementModels />
      <SectionDivider variant="hairline" />
      <Comparison />
      <SectionDivider variant="fade" />
      <HowItWorks />
      <ReliabilityStrip />
      <SectionDivider variant="hairline" />
      <ScopeEstimator />
      <SectionDivider variant="rule" />
      <About />
      <SectionDivider variant="hairline" />
      <Projects />
      <Testimonials />
      <SectionDivider variant="fade" />
      <Faq />
      <SectionDivider variant="hairline" />
      <BookingSection />
      <Contact />
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <ReactionWidget placement="inline" />
      </div>
      <PublicAnalyticsPulse />
      <ReactionWidget placement="dock" />
    </>
  );
}
