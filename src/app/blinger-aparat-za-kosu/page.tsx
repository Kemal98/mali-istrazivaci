import type { Metadata } from "next";
import { DawnQtyProvider } from "@/components/DawnQtyContext";
import { BookCheckoutModalProvider } from "@/components/BookCheckoutModalContext";
import DawnHeader from "@/components/DawnHeader";
import BlingerHero from "@/components/BlingerHero";
import BookSocialProof from "@/components/BookSocialProof";
import BlingerStory from "@/components/BlingerStory";
import BlingerIncludes from "@/components/BlingerIncludes";
import BlingerTrust from "@/components/BlingerTrust";
import BlingerCtaRepeat from "@/components/BlingerCtaRepeat";
import BookContact from "@/components/BookContact";
import BlingerReviews from "@/components/BlingerReviews";
import BlingerCheckout from "@/components/BlingerCheckout";
import DawnFooter from "@/components/DawnFooter";
import BookStickyBar from "@/components/BookStickyBar";

// NAPOMENA: cijena (19 KM) je privremena/placeholder — nema stvarnog broja
// od tebe. BLINGER_ORDERS_ENABLED = false u constants.ts dok se ne
// potvrdi cijena, prava slika i zalihe (vidi napomenu u odgovoru).
export const metadata: Metadata = {
  title: "Blinger aparat za kosu (180 perlica) | Mali Istraživači",
  description:
    "Blinger aparat za brzo i zabavno ukrašavanje kose, 180 perlica u setu. Plaćanje pouzećem, dostava po BiH.",
};

export default function BlingerPage() {
  return (
    <div className="dawn-page">
      <DawnQtyProvider>
        <BookCheckoutModalProvider>
          <DawnHeader />
          <BlingerHero />
          <BookSocialProof />
          <BlingerStory />
          <BlingerIncludes />
          <BlingerTrust />
          <BlingerCtaRepeat />
          <BookContact />
          <BlingerReviews />
          <BlingerCheckout />
          <DawnFooter />
          <BookStickyBar />
        </BookCheckoutModalProvider>
      </DawnQtyProvider>
    </div>
  );
}
