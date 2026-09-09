import type { Metadata } from "next";
import HomeHeader from "@/components/HomeHeader";
import HomeHero from "@/components/HomeHero";
import HomeMarquee from "@/components/HomeMarquee";
import HomeProductGrid from "@/components/HomeProductGrid";
import HomeShopByAge from "@/components/HomeShopByAge";
import HomeWhyUs from "@/components/HomeWhyUs";
import HomeOurStory from "@/components/HomeOurStory";
import HomeUgcStrip from "@/components/HomeUgcStrip";
import HomeReviews from "@/components/HomeReviews";
import HomeNewsletter from "@/components/HomeNewsletter";
import HomeFooter from "@/components/HomeFooter";
import HomeStickyBar from "@/components/HomeStickyBar";
import styles from "@/components/Home.module.css";

export const metadata: Metadata = {
  title: "Mali Istraživači – Igračke za djecu, dostava po cijeloj BiH",
  description:
    "Pažljivo birane igračke za djecu svih uzrasta. Plaćanje pouzećem, dostava po cijeloj BiH.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ uzrast?: string }>;
}) {
  const { uzrast } = await searchParams;

  return (
    <div className={`${styles.root} home-page-root`}>
      <HomeHeader />
      <HomeHero />
      <HomeMarquee />
      <HomeProductGrid uzrast={uzrast} />
      <HomeShopByAge />
      <HomeWhyUs />
      <HomeOurStory />
      <HomeUgcStrip />
      <HomeReviews />
      <HomeNewsletter />
      <HomeFooter />
      <HomeStickyBar />
    </div>
  );
}
