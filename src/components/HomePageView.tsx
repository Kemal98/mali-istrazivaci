import { listFeaturedHomepageReviews } from "@/lib/cms/repo";
import type { HomeContent, HomeSectionKey } from "@/lib/home/types";
import HomeHeader from "./HomeHeader";
import HomeHero from "./HomeHero";
import HomeShopCategories from "./HomeShopCategories";
import HomeHitProizvodi from "./HomeHitProizvodi";
import HomePosebnePonude from "./HomePosebnePonude";
import HomeProductGrid from "./HomeProductGrid";
import HomeWhyUs from "./HomeWhyUs";
import HomeOurStory from "./HomeOurStory";
import HomeUgcStrip from "./HomeUgcStrip";
import HomeReviews from "./HomeReviews";
import HomeFaq from "./HomeFaq";
import HomeFooter from "./HomeFooter";
import HomeStickyBar from "./HomeStickyBar";
import styles from "./Home.module.css";

/**
 * Zajednički renderer — koristi ga I javna "/" (sa OBJAVLJENIM sadržajem)
 * I /admin/preview/home (sa NACRTOM). Proizvodi/zalihe/recenzije se
 * UVIJEK čitaju uživo (nema smisla "zamrzavati" prodaju/stanje u
 * pregledu), samo tekst/redoslijed/kategorije dolaze iz `content`.
 */
export default async function HomePageView({
  content,
  kategorija,
  sve,
}: {
  content: HomeContent;
  kategorija?: string;
  sve?: boolean;
}) {
  const reviews = await listFeaturedHomepageReviews().catch(() => []);
  const prikazi = new Map(content.sections.map((s) => [s.key, s.prikazi]));
  const show = (k: HomeSectionKey) => prikazi.get(k) ?? false;

  return (
    <div className={`${styles.root} home-page-root`}>
      <HomeHeader />
      <HomeHero content={content} />
      {show("kategorije") ? <HomeShopCategories content={content} /> : null}
      {show("hitProizvodi") ? <HomeHitProizvodi content={content} /> : null}
      {show("posebnePonude") ? <HomePosebnePonude /> : null}
      {show("proizvodi") ? (
        <HomeProductGrid kategorija={kategorija} sve={sve} />
      ) : null}
      {show("whyUs") ? <HomeWhyUs /> : null}
      {show("ourStory") ? <HomeOurStory /> : null}
      {show("ugcStrip") ? <HomeUgcStrip /> : null}
      {show("reviews") ? <HomeReviews reviews={reviews} /> : null}
      {show("faq") ? <HomeFaq items={content.faq} /> : null}
      <HomeFooter />
      <HomeStickyBar />
    </div>
  );
}
