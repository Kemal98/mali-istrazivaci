import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BookHero from "@/components/BookHero";
import TrustStrip from "@/components/TrustStrip";
import Gallery from "@/components/Gallery";
import HowItWorks from "@/components/HowItWorks";
import BookCheckout from "@/components/BookCheckout";
import Reviews, { Review } from "@/components/Reviews";
import Footer from "@/components/Footer";
import StickyBar from "@/components/StickyBar";

export const metadata: Metadata = {
  title:
    "Interaktivna Montessori knjiga za djecu 2–6 godina | Mali Istraživači",
  description:
    "Interaktivna Montessori knjiga 'Svijet malih istraživača' – deset strana zadataka na čičak, na bosanskom jeziku. 15 KM, plaćanje pouzećem, dostava po BiH.",
};

// TODO: ovo su primjer-recenzije, ne stvarni citati kupaca knjige — zamijeni
// stvarnim kad ih budeš imao (isto upozorenje kao za citat u "A šta ako se
// zaigra" sekciji na glavnoj stranici; nemam pristup stvarnim recenzijama).
const bookReviews: Review[] = [
  {
    text: "Uzela sam za kćerku (3 god.) da ima nešto bez ekrana za duže vožnje. Sad je to njena omiljena igračka u autu.",
    initial: "L",
    name: "Lejla M.",
    city: "Sarajevo",
    av: "av1",
  },
  {
    text: "Sin (5 god.) je za sedmicu naučio nova slova kroz igru sa čičkom. Knjiga je čvrsta, izdržala je i pad sa stola.",
    initial: "A",
    name: "Amar S.",
    city: "Banja Luka",
    av: "av2",
  },
  {
    text: "Jednostavno, na našem jeziku, dijete odmah razumije zadatke. Preporučujem svima koji traže nešto edukativno bez tableta.",
    initial: "N",
    name: "Nadja K.",
    city: "Mostar",
    av: "av3",
  },
];

export default function EdukativnaKnjigaPage() {
  return (
    <>
      <Nav
        price="15 KM"
        logoHref="/"
        links={[
          { href: "#kako-radi", label: "Kako radi" },
          { href: "#knjiga", label: "Iz knjige" },
          { href: "#kontakt", label: "Kontakt" },
        ]}
      />
      <BookHero />
      <TrustStrip />
      <HowItWorks ctaText="Naruči knjigu – 15 KM" />
      <Gallery subtitle="Prave fotografije iz knjige. Sve na našem jeziku – i dijete i roditelj razumiju svaki zadatak." />
      <Reviews
        reviews={bookReviews}
        kicker="Šta kažu roditelji"
        title="Porodice iz cijele BiH nam vjeruju"
        ctaText="Naruči knjigu – 15 KM"
      />
      <BookCheckout />
      <Footer
        pageLinks={[
          { href: "#kako-radi", label: "Kako radi" },
          { href: "#knjiga", label: "Iz knjige" },
          { href: "#naruci", label: "Naruči" },
        ]}
      />
      <StickyBar
        price="15 KM"
        oldPrice=""
        rib="Plaćanje pouzećem · Dostava po cijeloj BiH"
        ctaLabel="Naruči knjigu"
      />
    </>
  );
}
