import type { Metadata } from "next";
import { DawnQtyProvider } from "@/components/DawnQtyContext";
import { BookCheckoutModalProvider } from "@/components/BookCheckoutModalContext";
import DawnHeader from "@/components/DawnHeader";
import BookHero from "@/components/BookHero";
import BookHeart from "@/components/BookHeart";
import BookWhyLoveIt from "@/components/BookWhyLoveIt";
import BookStory from "@/components/BookStory";
import BookSocialProof from "@/components/BookSocialProof";
import BookOccasions from "@/components/BookOccasions";
import BookIncludes from "@/components/BookIncludes";
import BookTrust from "@/components/BookTrust";
import BookCtaRepeat from "@/components/BookCtaRepeat";
import BookContact from "@/components/BookContact";
import BookReviewsDawn from "@/components/BookReviewsDawn";
import BookCheckout from "@/components/BookCheckout";
import DawnFooter from "@/components/DawnFooter";
import BookStickyBar from "@/components/BookStickyBar";

export const metadata: Metadata = {
  title:
    "Interaktivna Montessori knjiga za djecu 2–6 godina | Mali Istraživači",
  description:
    "Interaktivna Montessori knjiga 'Svijet malih istraživača' – deset strana zadataka na čičak, na bosanskom jeziku. 15 KM, plaćanje pouzećem, dostava po BiH.",
};

export default function EdukativnaKnjigaPage() {
  return (
    <div className="dawn-page">
      <DawnQtyProvider>
        <BookCheckoutModalProvider>
          <DawnHeader />
          <BookHero />
          <BookSocialProof />
          <BookHeart />
          <BookWhyLoveIt />
          <BookStory />
          <BookOccasions />
          <BookIncludes />
          <BookTrust />
          <BookCtaRepeat />
          <BookContact />
          <BookReviewsDawn />
          <BookCheckout />
          <DawnFooter />
          <BookStickyBar />
        </BookCheckoutModalProvider>
      </DawnQtyProvider>
    </div>
  );
}
