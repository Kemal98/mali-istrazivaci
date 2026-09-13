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

// NAPOMENA: proizvod zamijenjen (Blinger 180 perlica -> Sparkling Diamond),
// isti URL/checkout zadržan namjerno (postojeće reklame vode ovdje).
// Postojeće slike/gifovi zadržani (isti fizički proizvod).
export const metadata: Metadata = {
  title:
    "Sparkling Diamond — aparat za ukrašavanje kose + 75 dijamanata | Mali Istraživači",
  description:
    "Sparkling Diamond: aparat za ukrašavanje kose sa 75 dijamanata u 5 boja. Njen mali salon kod kuće. 24 KM, plaćanje pouzećem, dostava po BiH.",
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
