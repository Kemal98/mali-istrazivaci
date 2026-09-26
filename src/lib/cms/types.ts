// Tipovi za CMS. Sekcije se čuvaju kao JSON niz — redoslijed u nizu JE
// sortOrder, pa drag&drop samo prepiše niz. Novi tip sekcije se dodaje
// bez migracije baze (samo novi case u rendereru i editoru).

export type BlockType =
  | "naslov"
  | "tekst"
  | "naslov_tekst"
  | "slika"
  | "gif"
  | "video"
  | "slika_tekst"
  | "social_proof"
  | "benefiti"
  | "koraci"
  | "u_kutiji"
  | "trust"
  | "cta"
  | "spacer"
  | "galerija"
  | "recenzije"
  | "divider"
  | "koristi"
  | "faq";

export type Align = "left" | "center" | "right";
export type Velicina = "S" | "M" | "L" | "XL";
export type SpacerSize = "S" | "M" | "L";
export type SlikaTekstLayout = "img-top" | "text-top" | "img-left" | "img-right";

export type BlockData = Record<string, unknown>;

export interface Block {
  id: string;
  type: BlockType;
  hidden?: boolean;
  data: BlockData;
  /** Uputstvo iz šablona (šta ovdje staviti) — vidi se samo u editoru. */
  uputa?: string;
  /** Uloga iz šablona ("problem", "koristi"…) — po njoj "Popuni stranicu" zna gdje ide koji tekst. */
  uloga?: string;
}

export interface Hero {
  slika: string;
  galerija?: { url: string; alt?: string }[];
  naslovLinija1: string;
  naslovLinija2?: string;
  prikaziCijenu: boolean;
  prikaziBadge: boolean;
  prikaziRating: boolean;
  ratingTekst?: string;
  ratingVrijednost?: string;
  ratingBrojOcjena?: string;
  ctaTekst: string;
  prikaziCtaPodtekst: boolean;
  ctaPodtekst?: string;
  alt?: string;
  /** Traka ispod dugmeta: dostava, pouzeće, povrat (tekst iz Postavki). */
  prikaziPovjerenje?: boolean;
}

export interface Seo {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

export type ProductStatus = "draft" | "published";

export interface Product {
  id: string;
  naziv: string;
  slug: string;
  sku: string;
  kategorija: string;
  status: ProductStatus;
  cijena: number | null;
  staraCijena: number | null;
  /** Koliko je plaćeno dobavljaču po komadu. Interno, admin-only — NIKAD
   *  u PublishedData (javna stranica ovo ne smije vidjeti). */
  nabavnaCijena: number | null;
  badge: string;
  hero: Hero;
  seo: Seo;
  sections: Block[];
  publishedHero: Hero | null;
  publishedSections: Block[] | null;
  publishedData: PublishedData | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// Snapshot objavljenih polja proizvoda (public stranica čita SAMO ovo)
export interface PublishedData {
  naziv: string;
  cijena: number | null;
  staraCijena: number | null;
  badge: string;
  seo: Seo;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  alt: string;
  mime: string;
  size: number;
  /** Putanja u Supabase Storage bucketu (prazno za stare /img fajlove iz repoa). */
  storageKey?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string | null;
  ime: string;
  inicijal: string;
  rating: number;
  tekst: string;
  verified: boolean;
  slika: string;
  datum: string;
  status: "published" | "hidden";
  sortOrder: number;
}

export interface Template {
  id: string;
  naziv: string;
  hero: Hero;
  sections: Block[];
  isDefault: boolean;
}

export interface GlobalSettings {
  announcementBar: string;
  placanjeTekst: string;
  dostavaTekst: string;
  garancijaTekst: string;
  kontaktEmail: string;
  defaultCtaTekst: string;
  footerTekst: string;
}

export function defaultHero(): Hero {
  return {
    slika: "",
    galerija: [],
    naslovLinija1: "",
    naslovLinija2: "",
    prikaziCijenu: true,
    prikaziBadge: true,
    prikaziRating: false,
    ratingTekst: "",
    ratingVrijednost: "4.8",
    ratingBrojOcjena: "22",
    ctaTekst: "PORUČI SADA",
    prikaziCtaPodtekst: false,
    ctaPodtekst: "Plaćanje pouzećem, pouzdana kupovina",
    alt: "",
  };
}

// Prazna "kostur" vrijednost za svaki tip bloka kad se doda u builder
export function defaultBlockData(type: BlockType): BlockData {
  switch (type) {
    case "naslov":
      return { tekst: "Novi naslov", velicina: "L", bold: true, align: "center" };
    case "tekst":
      return { tekst: "Novi tekst.", bold: false, align: "center" };
    case "naslov_tekst":
      return { naslov: "Novi naslov", tekst: "Opis ispod naslova.", bold: true, align: "center" };
    case "slika":
    case "gif":
      return { url: "", alt: "", radius: true, fullWidth: false, caption: "" };
    case "video":
      return { url: "", autoplay: false, muted: true, loop: false, controls: true };
    case "slika_tekst":
      return {
        url: "",
        alt: "",
        naslov: "Naslov",
        tekst: "Opis.",
        layout: "img-top",
        radius: true,
      };
    case "social_proof":
      return {
        linija1: "Preko 500+ zadovoljnih porodica",
        zvjezdice: "⭐️⭐️⭐️⭐️⭐️",
        linija2: "prosječna ocjena 4.8/5",
      };
    case "benefiti":
      return { naslov: "", items: ["Prva prednost", "Druga prednost"] };
    case "koraci":
      return { naslov: "", items: ["Prvi korak", "Drugi korak", "Treći korak"] };
    case "u_kutiji":
      return { naslov: "Šta stiže u tvojoj kutiji?", items: ["1x proizvod"], napomena: "" };
    case "trust":
      return {
        naslov: "Kupovina bez rizika (plaća se pouzećem)",
        items: ["Plaćanje pouzećem", "Dostava širom BiH"],
        badge: "🛡️ 14 dana garancije za povrat",
      };
    case "cta":
      return { naslov: "Poruči ODMAH", opis: "", ctaTekst: "PORUČI SADA" };
    case "spacer":
      return { size: "M" };
    case "galerija":
      return { items: [] };
    case "recenzije":
      return {
        naslov: "Roditelji koji su već kupili kod nas ♥️",
        prikaziOcjenu: true,
        ratingVrijednost: "4.8",
        ratingBrojOcjena: "22",
      };
    case "divider":
      return {};
    case "koristi":
      return {
        naslov: "",
        items: [
          { url: "", alt: "", naslov: "", tekst: "" },
          { url: "", alt: "", naslov: "", tekst: "" },
          { url: "", alt: "", naslov: "", tekst: "" },
        ],
      };
    case "faq":
      return { naslov: "Česta pitanja", items: [{ pitanje: "", odgovor: "" }] };
    default:
      return {};
  }
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  naslov: "Naslov",
  tekst: "Tekst",
  naslov_tekst: "Naslov + tekst",
  slika: "Slika",
  gif: "GIF",
  video: "Video",
  slika_tekst: "Slika + tekst",
  social_proof: "Social proof",
  benefiti: "Benefit lista",
  koraci: "Koraci",
  u_kutiji: "Šta stiže u kutiji",
  trust: "Trust / sigurna kupovina",
  cta: "CTA sekcija",
  spacer: "Razmak",
  galerija: "Galerija",
  recenzije: "Recenzije",
  divider: "Linija",
  koristi: "Koristi sa slikom",
  faq: "Česta pitanja (FAQ)",
};
