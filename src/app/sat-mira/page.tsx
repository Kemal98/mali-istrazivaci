import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import Pain from "@/components/Pain";
import ProductSet from "@/components/ProductSet";
import Infographic from "@/components/Infographic";
import Gallery from "@/components/Gallery";
import AgeStages from "@/components/AgeStages";
import Reviews from "@/components/Reviews";
import WhatIfBored from "@/components/WhatIfBored";
import WhereToUse from "@/components/WhereToUse";
import AboutUs from "@/components/AboutUs";
import HowItWorks from "@/components/HowItWorks";
import Offer from "@/components/Offer";
import Guarantee from "@/components/Guarantee";
import Faq from "@/components/Faq";
import Checkout from "@/components/Checkout";
import PreOrderNotice from "@/components/PreOrderNotice";
import Final from "@/components/Final";
import Footer from "@/components/Footer";
import StickyBar from "@/components/StickyBar";

// Ista naslov/opis koje je ova stranica imala na "/" prije seljenja — samo
// eksplicitno ovdje umjesto naslijeđeno iz root layout.tsx, jer layout.tsx
// sad opisuje novu početnu. Ništa se sadržajno ne mijenja za ovu stranicu.
export const metadata: Metadata = {
  title:
    "SAT MIRA – Montessori set 3u1 na bosanskom jeziku | Mali Istraživači",
  description:
    "Jedini Montessori set na bosanskom jeziku. SAT MIRA: 3 igračke za djecu 2–6 godina – knjiga na čičak, drvena igračka i mozgalica. 29 KM, plaćanje pouzećem, dostava po BiH.",
};

export default function Home() {
  return (
    <>
      <Nav
        simplified
        topbarFull="🚚 Dostava po BiH · 💵 Plaćanje pouzećem · ↩️ 14 dana povrat novca"
        topbarShort="Pouzeće · Dostava po BiH · 14 dana povrat"
      />
      <Hero />
      <TrustStrip variant="stats" />
      <Pain />
      <ProductSet />
      <Infographic />
      <Gallery />
      <AgeStages />
      <Reviews />
      <WhatIfBored />
      {/* <WhereToUse /> — vrati kad slike (gdje-kuca/auto/kafic/baka) budu spremne */}
      <AboutUs />
      <HowItWorks />
      <Offer />
      <Guarantee />
      <Faq
        title="Sve što roditelji pitaju prije narudžbe"
        ctaText="Sve jasno? Naruči – 29 KM + dostava"
        defaultOpenIndex={0}
        schemaMarkup
      />
      <Checkout />
      <PreOrderNotice />
      <Final />
      <Footer />
      <StickyBar simplified />
    </>
  );
}
