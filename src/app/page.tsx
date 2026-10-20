import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { siteConfig } from "@/data/site";

const HomeRest = dynamic(() => import("@/components/home/HomeRest").then((mod) => mod.HomeRest));

export default function Home() {
  return (
    <>
      <FaqJsonLd items={[...siteConfig.faq]} />
      <Hero />
      <HomeRest />
    </>
  );
}
