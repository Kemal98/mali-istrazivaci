import { DawnQtyProvider } from "@/components/DawnQtyContext";
import { BookCheckoutModalProvider } from "@/components/BookCheckoutModalContext";
import { BundleProvider } from "@/components/BundleContext";
import DawnHeader from "@/components/DawnHeader";
import DawnFooter from "@/components/DawnFooter";
import BookContact from "@/components/BookContact";
import BookStickyBar from "@/components/BookStickyBar";
import CmsHero from "./CmsHero";
import { CmsBlocks, IntroDescription, splitIntroSections } from "./CmsBlocks";
import CmsCheckout from "./CmsCheckout";
import CmsPixel from "./CmsPixel";
import type { Block, Hero, ProductBundle, Review } from "@/lib/cms/types";
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
  paketiAktivni = false,
  paketi = [],
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
  /** Paketna ponuda — kad je isključena ili lista prazna, stranica se ponaša potpuno kao do sad. */
  paketiAktivni?: boolean;
  paketi?: ProductBundle[];
  preview?: boolean;
}) {
  const { lead, rest } = splitIntroSections(sections);
  const settings = hero.prikaziPovjerenje ? await getSettings() : null;
  const povjerenje = settings
    ? [settings.dostavaTekst, settings.placanjeTekst, settings.garancijaTekst].filter(Boolean)
    : [];
  const aktivniPaketi = paketiAktivni ? paketi : [];
  const pocetniPaket =
    aktivniPaketi.find((p) => p.istaknut) ?? aktivniPaketi[0] ?? null;
  return (
    <div className="dawn-page">
      <DawnQtyProvider>
        <BookCheckoutModalProvider>
          <BundleProvider initial={pocetniPaket}>
            <DawnHeader />
            <div className="dawn-intro">
              <div className="dawn-intro-media">
                <CmsHero
                  hero={hero}
                  cijena={cijena}
                  staraCijena={staraCijena}
                  badge={badge}
                  povjerenje={povjerenje}
                  paketi={aktivniPaketi}
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
                paketi={aktivniPaketi}
              />
            ) : null}
            <DawnFooter />
            <BookStickyBar text={hero.stickyCtaTekst || undefined} />
            {!preview ? <CmsPixel naziv={naziv} vrijednost={cijena} /> : null}
          </BundleProvider>
        </BookCheckoutModalProvider>
      </DawnQtyProvider>
    </div>
  );
}
