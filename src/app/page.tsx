import Nav from "@/components/Nav";
import { PHONE_TEL } from "@/lib/constants";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import Pain from "@/components/Pain";
import ProductSet from "@/components/ProductSet";
import Infographic from "@/components/Infographic";
import Gallery from "@/components/Gallery";
import AgeStages from "@/components/AgeStages";
import HowItWorks from "@/components/HowItWorks";
import WhereToUse from "@/components/WhereToUse";
import Offer from "@/components/Offer";
import Reviews from "@/components/Reviews";
import PreOrderNotice from "@/components/PreOrderNotice";
import Checkout from "@/components/Checkout";
import Faq from "@/components/Faq";
import Final from "@/components/Final";
import Footer from "@/components/Footer";
import StickyBar from "@/components/StickyBar";

export default function Home() {
  return (
    <>
      <Nav
        phone={PHONE_TEL}
        topbarFull="🚚 Dostava po BiH · 💵 Plaćanje pouzećem · ↩️ 14 dana povrat novca"
        topbarShort="Pouzeće · Dostava po BiH · 14 dana povrat"
      />
      <Hero />
      <TrustStrip />
      <Pain />
      <ProductSet />
      <Infographic />
      <Gallery />
      <AgeStages />
      <HowItWorks />
      {/* <WhereToUse /> — vrati kad slike (gdje-kuca/auto/kafic/baka) budu spremne */}
      <Offer />
      <Reviews />
      <PreOrderNotice />
      <Checkout />
      <Faq />
      <Final />
      <Footer />
      <StickyBar phone={PHONE_TEL} />
    </>
  );
}
