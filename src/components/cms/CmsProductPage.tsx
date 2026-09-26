import { DawnQtyProvider } from "@/components/DawnQtyContext";
import { BookCheckoutModalProvider } from "@/components/BookCheckoutModalContext";
import DawnHeader from "@/components/DawnHeader";
import DawnFooter from "@/components/DawnFooter";
import BookContact from "@/components/BookContact";
import BookStickyBar from "@/components/BookStickyBar";
import CmsHero from "./CmsHero";
import { CmsBlocks, IntroDescription, splitIntroSections } from "./CmsBlocks";
import CmsCheckout from "./CmsCheckout";
import CmsPixel from "./CmsPixel";
import type { Block, Hero, Review } from "@/lib/cms/types";
import { getSettings } from "@/lib/cms/repo";

// Renderer stranice proizvoda: uzme HERO + NIZ SEKCIJA i prođe kroz njih
// po redoslijedu. Nema hardkodirane stranice po proizvodu.
export default async function CmsProductPage({
  naziv,
  hero,
  sections,
  reviews,
  cijena,
  staraCijena,
  badge,
  productId,
  preview = false,
}: {
  naziv: string;
  hero: Hero;
  sections: Block[];
  reviews: Review[];
  cijena: number | null;
  staraCijena: number | null;
  badge: string;
  /** Veže narudžbu za konkretan CMS proizvod u bazi narudžbi. */
  productId?: string | null;
  preview?: boolean;
}) {
  const { lead, rest } = splitIntroSections(sections);
  const settings = hero.prikaziPovjerenje ? await getSettings() : null;
  const povjerenje = settings
    ? [settings.dostavaTekst, settings.placanjeTekst, settings.garancijaTekst].filter(Boolean)
    : [];
  return (
    <div className="dawn-page">
      <DawnQtyProvider>
        <BookCheckoutModalProvider>
          <DawnHeader />
          <div className="dawn-intro">
            <div className="dawn-intro-media">
              <CmsHero
                hero={hero}
                cijena={cijena}
                staraCijena={staraCijena}
                badge={badge}
                povjerenje={povjerenje}
              />
            </div>
            <IntroDescription blocks={lead} />
          </div>
          <CmsBlocks sections={rest} reviews={reviews} />
          <BookContact />
          {cijena !== null ? (
            <CmsCheckout
              naziv={naziv}
              cijena={cijena}
              staraCijena={staraCijena}
              slika={hero.slika}
              podnaslov={hero.naslovLinija2}
              productId={productId}
            />
          ) : null}
          <DawnFooter />
          <BookStickyBar />
          {!preview ? <CmsPixel naziv={naziv} vrijednost={cijena} /> : null}
        </BookCheckoutModalProvider>
      </DawnQtyProvider>
    </div>
  );
}
