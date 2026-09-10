import type { Metadata } from "next";
import { DawnQtyProvider } from "@/components/DawnQtyContext";
import { BookCheckoutModalProvider } from "@/components/BookCheckoutModalContext";
import DawnHeader from "@/components/DawnHeader";
import ProjektorHero from "@/components/ProjektorHero";
import BookSocialProof from "@/components/BookSocialProof";
import ProjektorStory from "@/components/ProjektorStory";
import ProjektorIncludes from "@/components/ProjektorIncludes";
import ProjektorTrust from "@/components/ProjektorTrust";
import ProjektorCtaRepeat from "@/components/ProjektorCtaRepeat";
import BookContact from "@/components/BookContact";
import ProjektorReviews from "@/components/ProjektorReviews";
import ProjektorCheckout from "@/components/ProjektorCheckout";
import DawnFooter from "@/components/DawnFooter";
import BookStickyBar from "@/components/BookStickyBar";

// NAPOMENA: PROJECTOR_ORDERS_ENABLED = false u constants.ts dok se ne
// potvrde prave fotografije, tvoja cijena i zalihe. Tekst i struktura su
// gotovi; nema tuđih slika (placeholder okvir dok ne stignu tvoje).
export const metadata: Metadata = {
  title:
    "Projektor za crtanje — set sa tablom i markerima (12 boja) | Mali Istraživači",
  description:
    "Projektor koji baca sličicu na tablu — dijete precrtava i uči boje i oblike. Set: projektor, tabla sa stalkom, 12 perivih markera. Plaćanje pouzećem, dostava po BiH.",
};

export default function ProjektorZaCrtanjePage() {
  return (
    <div className="dawn-page">
      <DawnQtyProvider>
        <BookCheckoutModalProvider>
          <DawnHeader />
          <ProjektorHero />
          <BookSocialProof />
          <ProjektorStory />
          <ProjektorIncludes />
          <ProjektorTrust />
          <ProjektorCtaRepeat />
          <BookContact />
          <ProjektorReviews />
          <ProjektorCheckout />
          <DawnFooter />
          <BookStickyBar />
        </BookCheckoutModalProvider>
      </DawnQtyProvider>
    </div>
  );
}
