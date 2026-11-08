// Jedna lista kategorija, definisana OVDJE, da se ne ponavlja hardkodirano
// na više mjesta (admin select, filter pilule, pločice) — svako mjesto
// uvozi CATEGORY_KEYS/CATEGORY_LABELS odavde.
export const CATEGORY_KEYS = [
  "bebe",
  "djevojcice",
  "djecaci",
  "edukativno",
  "kreativno",
] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  bebe: "Za bebe",
  djevojcice: "Za djevojčice",
  djecaci: "Za dječake",
  edukativno: "Edukativne igračke",
  kreativno: "Kreativne igračke",
};

export interface FaqItem {
  id: string;
  pitanje: string;
  odgovor: string;
}

export interface CategoryTile {
  kategorija: CategoryKey;
  slika: string;
  alt: string;
  prikazi: boolean;
}

export const HOME_SECTION_KEYS = [
  "kategorije",
  "hitProizvodi",
  "posebnePonude",
  "proizvodi",
  "whyUs",
  "ourStory",
  "ugcStrip",
  "reviews",
  "faq",
] as const;
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export const HOME_SECTION_LABELS: Record<HomeSectionKey, string> = {
  kategorije: "Kupuj po kategoriji",
  hitProizvodi: "Hit proizvodi",
  posebnePonude: "Posebne ponude",
  proizvodi: "Svi proizvodi",
  whyUs: "Kupovina bez komplikacija",
  ourStory: "Naša priča",
  ugcStrip: "Fotografije kupaca",
  reviews: "Recenzije",
  faq: "Česta pitanja",
};

export interface HomeSection {
  key: HomeSectionKey;
  prikazi: boolean;
}

/**
 * Sadržaj početne stranice — NACRT/OBJAVLJENO isti obrazac kao
 * products.hero/sections vs published_* (vidi home/schema.sql).
 * Header/hero-struktura/footer NISU ovdje — struktura je fiksna, samo je
 * sadržaj (naslov/slike/itd.) uređiv; "sections" niz kontroliše SAMO
 * redoslijed/vidljivost opcionalnih sekcija ispod hero-a.
 */
export interface HomeContent {
  heroNaslov: string;
  heroPodnaslov: string;
  heroCtaTekst: string;
  /** Stvarne fotografije proizvoda kao atmosfera — NIJE vezano za jedan konkretan proizvod. */
  heroGalerija: { url: string; alt: string }[];
  /** Uvijek točno 5 — jedan red po CategoryKey, bez obzira na redoslijed u nizu. */
  kategorijeTiles: CategoryTile[];
  /** Redoslijed niza = redoslijed prikaza na stranici. */
  sections: HomeSection[];
  /** Product/legacy id-evi, ručno zakucan redoslijed. [] = potpuno automatski rang po prodaji. */
  hitProizvodiPinned: string[];
  faq: FaqItem[];
}

export function defaultHomeContent(): HomeContent {
  return {
    heroNaslov: "Male igračke. Velika radost.",
    heroPodnaslov:
      "Otkrij zanimljive igračke koje djeca obožavaju – po cijenama koje roditelji vole.",
    heroCtaTekst: "Pogledaj ponudu",
    heroGalerija: [],
    kategorijeTiles: CATEGORY_KEYS.map((k) => ({
      kategorija: k,
      slika: "",
      alt: CATEGORY_LABELS[k],
      prikazi: false, // dok admin ne postavi pravu fotografiju
    })),
    sections: HOME_SECTION_KEYS.map((key) => ({
      key,
      // ourStory/ugcStrip su DANAS lažan sadržaj (placeholder tekst/fotke) —
      // zadano isključeno dok se ne dodaju stvarne.
      prikazi: key !== "ourStory" && key !== "ugcStrip",
    })),
    hitProizvodiPinned: [],
    faq: [
      {
        id: "faq_narudzba",
        pitanje: "Kako mogu naručiti?",
        odgovor:
          'Otvoriš proizvod koji te zanima, klikneš "Naruči" i popuniš kratku formu — ime, adresa i broj telefona. Nema registracije ni online plaćanja.',
      },
      {
        id: "faq_dostava_cijena",
        pitanje: "Koliko košta dostava?",
        odgovor: "10 KM po narudžbi, vidi se prije potvrde narudžbe.",
      },
      {
        id: "faq_dostava_vrijeme",
        pitanje: "Kada mogu očekivati paket?",
        odgovor: "2–3 radna dana od narudžbe, dostava širom BiH.",
      },
      {
        id: "faq_pouzece",
        pitanje: "Da li mogu platiti pouzećem?",
        odgovor: "Da — plaćanje pouzećem, platiš kad paket stigne.",
      },
      {
        id: "faq_podrska",
        pitanje: "Kako mogu kontaktirati podršku?",
        odgovor: "Na email svijetistrazivaca@gmail.com.",
      },
      {
        id: "faq_povrat",
        pitanje: "Kako funkcionišu povrat i reklamacije?",
        odgovor: "14 dana garancije za povrat.",
      },
    ],
  };
}
