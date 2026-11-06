import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DawnQtyProvider } from "@/components/DawnQtyContext";
import { BookCheckoutModalProvider } from "@/components/BookCheckoutModalContext";
import { BundleProvider } from "@/components/BundleContext";
import DawnHeader from "@/components/DawnHeader";
import DawnFooter from "@/components/DawnFooter";
import BookContact from "@/components/BookContact";
import BookStickyBar from "@/components/BookStickyBar";
import RattleReviews from "@/components/RattleReviews";
import CmsHero from "@/components/cms/CmsHero";
import CmsCheckout from "@/components/cms/CmsCheckout";
import { CmsBlocks, IntroDescription, splitIntroSections } from "@/components/cms/CmsBlocks";
import { getPublishedBySlug, listPublishedReviews, getSettings } from "@/lib/cms/repo";

/**
 * Prebačeno sa ručno pisane stranice (RattleHero/RattleHeart/...) u CMS
 * sistem (zahtjev 06.11.2026) — sadržaj/cijena/paketi se sad uređuju
 * kroz /admin/products/prod_static_zvecke kao i kod svakog drugog
 * proizvoda. Ruta OSTAJE ista ("/rotirajuce-zvecke", ne [slug]) da se
 * ne mijenja URL i da PixelEvents.tsx (ViewContent/InitiateCheckout po
 * statičkoj putanji) nastavi raditi bez izmjena.
 *
 * NAMJERNO zadržano kao ručno sastavljena stranica (ne generički
 * [slug]/page.tsx): RattleReviews ima stvarne video-recenzije (klik na
 * karticu otvara video) koje generički "recenzije" CMS blok ne
 * podržava — gubljenje te interakcije bi bilo stvarno pogoršanje, pa
 * ta sekcija ostaje svoja, fiksna komponenta, dok je sve ostalo
 * (hero/cijena/tekst/slike/paketi) sad iz baze.
 *
 * BEZ <CmsPixel> namjerno — PixelEvents.tsx već pali ViewContent za ovu
 * tačnu putanju (vidi PRODUCT_PIXEL mapu), pa bi CmsPixel izazvao
 * DUPLI ViewContent event.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPublishedBySlug("rotirajuce-zvecke");
  if (!p) return {};
  const d = p.publishedData;
  const seo = d?.seo ?? {};
  const title = seo.title || `${d?.naziv ?? p.naziv} | Mali Istraživači`;
  const description = seo.description || "";
  return {
    title,
    description,
    alternates: seo.canonical ? { canonical: seo.canonical } : undefined,
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: seo.ogImage
        ? [seo.ogImage]
        : p.publishedHero?.slika
        ? [p.publishedHero.slika]
        : undefined,
    },
  };
}

export default async function RotirajuceZveckePage() {
  const p = await getPublishedBySlug("rotirajuce-zvecke");
  if (!p || !p.publishedHero || !p.publishedSections) notFound();

  const d = p.publishedData;
  const naziv = d?.naziv ?? p.naziv;
  const hero = p.publishedHero;
  const cijena = d?.cijena ?? p.cijena;
  const staraCijena = d?.staraCijena ?? p.staraCijena;
  const badge = d?.badge ?? p.badge;
  const reviews = await listPublishedReviews(p.id);
  const { lead, rest } = splitIntroSections(p.publishedSections);

  const settings = hero.prikaziPovjerenje ? await getSettings() : null;
  const povjerenje = settings
    ? [settings.dostavaTekst, settings.placanjeTekst, settings.garancijaTekst].filter(Boolean)
    : [];
  const aktivniPaketi = p.publishedPaketiAktivni ? p.publishedPaketi ?? [] : [];
  const pocetniPaket = aktivniPaketi.find((b) => b.istaknut) ?? aktivniPaketi[0] ?? null;

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
            <RattleReviews />
            <BookContact />
            {cijena !== null ? (
              <CmsCheckout
                naziv={naziv}
                cijena={cijena}
                staraCijena={staraCijena}
                slika={hero.slika}
                podnaslov={hero.naslovLinija2}
                productId={p.id}
                paketi={aktivniPaketi}
              />
            ) : null}
            <DawnFooter />
            <BookStickyBar text={hero.stickyCtaTekst || undefined} />
          </BundleProvider>
        </BookCheckoutModalProvider>
      </DawnQtyProvider>
    </div>
  );
}
