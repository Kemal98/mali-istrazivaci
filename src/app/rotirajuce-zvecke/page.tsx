import type { Metadata } from "next";
import { DawnQtyProvider } from "@/components/DawnQtyContext";
import { BookCheckoutModalProvider } from "@/components/BookCheckoutModalContext";
import DawnHeader from "@/components/DawnHeader";
import RattleHero from "@/components/RattleHero";
import BookSocialProof from "@/components/BookSocialProof";
import RattleHeart from "@/components/RattleHeart";
import RattleStory from "@/components/RattleStory";
import RattleIncludes from "@/components/RattleIncludes";
import RattleTrust from "@/components/RattleTrust";
import RattleCtaRepeat from "@/components/RattleCtaRepeat";
import BookContact from "@/components/BookContact";
import RattleReviews from "@/components/RattleReviews";
import RattleCheckout from "@/components/RattleCheckout";
import DawnFooter from "@/components/DawnFooter";
import BookStickyBar from "@/components/BookStickyBar";

// NAPOMENA: RATTLE_ORDERS_ENABLED = false u constants.ts dok se ne
// potvrde zalihe (cijena i slike su već stvarne).
export const metadata: Metadata = {
  title: "Vesele rotirajuće zvečke za bebe (3 komada) | Mali Istraživači",
  description:
    "Rotirajuće zvečke sa vakuum osnovom, 3 komada u setu — lijepe se za kadu, frižider, sjedalicu u autu. Plaćanje pouzećem, dostava po BiH.",
};

export default function RotirajuceZveckePage() {
  return (
    <div className="dawn-page">
      <DawnQtyProvider>
        <BookCheckoutModalProvider>
          <DawnHeader />
          <RattleHero />
          <BookSocialProof />
          <RattleHeart />
          <RattleStory />
          <RattleIncludes />
          <RattleTrust />
          <RattleCtaRepeat />
          <BookContact />
          <RattleReviews />
          <RattleCheckout />
          <DawnFooter />
          <BookStickyBar />
        </BookCheckoutModalProvider>
      </DawnQtyProvider>
    </div>
  );
}
