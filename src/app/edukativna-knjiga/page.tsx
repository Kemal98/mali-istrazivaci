import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BookHero from "@/components/BookHero";
import TrustStrip from "@/components/TrustStrip";
import BookAbout from "@/components/BookAbout";
import Gallery from "@/components/Gallery";
import AgeStages, { Stage } from "@/components/AgeStages";
import HowItWorks from "@/components/HowItWorks";
import BookOffer from "@/components/BookOffer";
import BookCheckout from "@/components/BookCheckout";
import Reviews, { Review } from "@/components/Reviews";
import Faq, { FaqItem } from "@/components/Faq";
import BookFinal from "@/components/BookFinal";
import Footer from "@/components/Footer";
import StickyBar from "@/components/StickyBar";

export const metadata: Metadata = {
  title:
    "Interaktivna Montessori knjiga za djecu 2–6 godina | Mali Istraživači",
  description:
    "Interaktivna Montessori knjiga 'Svijet malih istraživača' – deset strana zadataka na čičak, na bosanskom jeziku. 15 KM, plaćanje pouzećem, dostava po BiH.",
};

const bookStages: Stage[] = [
  {
    age: "2–3 godine",
    text: "Prepoznaje životinje, lijepi čičak, uči boje",
  },
  {
    age: "4–5 godina",
    text: "Uči slova i brojeve, prepoznaje emocije",
  },
  {
    age: "6 godina",
    text: "Spelovanje riječi, rješava zadatke samostalno",
  },
];

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

const bookFaqs: FaqItem[] = [
  {
    q: "Je li ovo ista knjiga koja dolazi u SAT MIRA setu?",
    a: "Da, potpuno ista interaktivna knjiga – ovdje je nudimo i zasebno, bez drvene igračke i mozgalice.",
  },
  {
    q: "Za koji uzrast je knjiga?",
    a: "Za djecu od 2 do 6 godina. Mlađa djeca uživaju u slikama, čičku i bojama, a starija rješavaju zadatke sa slovima i brojevima.",
  },
  {
    q: "Kako funkcioniše plaćanje pouzećem?",
    a: "Ne plaćaš ništa unaprijed. Kada kurir donese paket, platiš gotovinom na kućnom pragu – i to je sve.",
  },
  {
    q: "Koliko traje dostava?",
    a: "Dostava po cijeloj BiH traje 2 do 4 radna dana. Zovemo te isti ili sljedeći dan da potvrdimo narudžbu.",
  },
  {
    q: "Je li sve sigurno za malu djecu?",
    a: "Da. Knjiga je od čvrstog materijala otpornog na kidanje, boje su netoksične, a dizajnirana je upravo za male ruke.",
  },
  {
    q: "Mogu li naručiti više knjiga?",
    a: "Naravno – napiši u polje Napomena koliko komada želiš. Javimo se telefonom i dogovorimo detalje.",
  },
];

export default function EdukativnaKnjigaPage() {
  return (
    <>
      <Nav
        price="15 KM"
        logoHref="/"
        links={[
          { href: "#set", label: "Šta dobijaš" },
          { href: "#knjiga", label: "Iz knjige" },
          { href: "#kontakt", label: "Kontakt" },
        ]}
      />
      <BookHero />
      <TrustStrip />
      <BookAbout />
      <Gallery subtitle="Prave fotografije iz knjige. Sve na našem jeziku – i dijete i roditelj razumiju svaki zadatak." />
      <AgeStages
        stages={bookStages}
        title="Ista knjiga zabavlja dvogodišnjaka i uči šestogodišnjaka"
        note="Ista knjiga koju dvogodišnjak koristi za životinje, šestogodišnjak koristi za prve riječi. Zato je ne prerastaju za tri mjeseca."
        punch="Jedna knjiga. Četiri godine korištenja."
      />
      <Reviews
        reviews={bookReviews}
        kicker="Šta kažu roditelji"
        title="Porodice iz cijele BiH nam vjeruju"
        ctaText="Naruči knjigu – 15 KM"
      />
      <HowItWorks ctaText="Naruči knjigu – 15 KM" />
      <BookOffer />
      <BookCheckout />
      <Faq items={bookFaqs} />
      <BookFinal />
      <Footer
        pageLinks={[
          { href: "#set", label: "Šta dobijaš" },
          { href: "#knjiga", label: "Iz knjige" },
          { href: "#naruci", label: "Naruči" },
        ]}
      />
      <StickyBar
        price="15 KM"
        oldPrice=""
        rib="Interaktivna Montessori knjiga – akcija do isteka zalihe"
        ctaLabel="Naruči knjigu"
      />
    </>
  );
}
