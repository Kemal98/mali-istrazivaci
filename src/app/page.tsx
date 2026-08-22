import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import Pain from "@/components/Pain";
import ProductSet from "@/components/ProductSet";
import Infographic from "@/components/Infographic";
import Gallery from "@/components/Gallery";
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
      <Nav />
      <Hero />
      <TrustStrip />
      <Pain />
      <ProductSet />
      <Infographic />
      <Gallery />
      <Offer />
      <Reviews />
      <PreOrderNotice />
      <Checkout />
      <Faq />
      <Final />
      <Footer />
      <StickyBar />
    </>
  );
}
