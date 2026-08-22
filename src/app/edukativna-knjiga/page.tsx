import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BookHero from "@/components/BookHero";
import TrustStrip from "@/components/TrustStrip";
import BookAbout from "@/components/BookAbout";
import Gallery from "@/components/Gallery";
import BookOffer from "@/components/BookOffer";
import BookCheckout from "@/components/BookCheckout";
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
      <Gallery />
      <BookOffer />
      <BookCheckout />
      <Faq items={bookFaqs} />
      <BookFinal />
      <Footer />
      <StickyBar
        price="15 KM"
        oldPrice=""
        rib="Interaktivna Montessori knjiga – akcija do isteka zalihe"
        ctaLabel="Naruči knjigu"
      />
    </>
  );
}
