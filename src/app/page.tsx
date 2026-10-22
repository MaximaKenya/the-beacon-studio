import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { HomeSplashGate } from "@/components/home/HomeSplashGate";
import { siteConfig } from "@/data/site";

const HomeRest = dynamic(() => import("@/components/home/HomeRest").then((mod) => mod.HomeRest));

export default function Home() {
  return (
    <>
      <noscript>
        <style>{`[data-home-splash]{display:none !important}`}</style>
      </noscript>
      <HomeSplashGate />
      <FaqJsonLd items={[...siteConfig.faq]} />
      <Hero />
      <HomeRest />
    </>
  );
}
