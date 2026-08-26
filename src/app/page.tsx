import Nav from "@/components/Nav";
import BonusDeadline from "@/components/BonusDeadline";
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

export default function Home() {
  return (
    <>
      <Nav
        simplified
        topbarFull={
          <>
            🎁 PDF vodič &ldquo;30 igara sa setom&rdquo; uz narudžbe do
            nedjelje, <BonusDeadline />
          </>
        }
        topbarShort={
          <>
            🎁 Bonus vodič uz narudžbe do nedjelje, <BonusDeadline />
          </>
        }
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
