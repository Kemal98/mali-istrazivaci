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
  | "faq"
  | "isticanja";

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
  /** Razmak ispod OVOG bloka — prazno/"m" = zadano (ne dira se ništa). */
  razmakIspod?: "" | "none" | "s" | "m" | "l";
}

export const RAZMAK_LABELS: Record<"none" | "s" | "m" | "l", string> = {
  none: "Bez razmaka",
  s: "Malo",
  m: "Zadano",
  l: "Veliko",
};

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
  /** Tekst na fiksnom dugmetu koje se pojavi pri dnu ekrana dok se skrola (mobitel). Prazno = "Poruči sada". */
  stickyCtaTekst?: string;
  /**
   * Poruke "oskudice" (urgentnost) iznad dugmeta — npr. "Ostalo je samo
   * par komada po ovoj cijeni". Prazno = ništa se ne prikazuje. Kad ima
   * više poruka, rotiraju se automatski svaka 2 sata (vidi
   * currentOskudicaPoruka u CmsHero.tsx) — ista poruka za sve posjetioce
   * u tom periodu, ne nasumično po posjeti.
   */
  oskudicaPoruke?: string[];
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

/**
 * Jedan "paket" u paketnoj ponudi (npr. "2 seta (6 zvečki)" — 34 KM).
 * `kolicina` je u ISTOJ jedinici kao i obična prodaja tog proizvoda (ono
 * što inače ide u orders.quantity, nabavka robe i stanje zaliha) — ako
 * proizvod inače prodaje "1 set", paket "2 seta" ima kolicina=2, NE broj
 * fizičkih zvečki u setu. Tako se zalihe i dalje tačno razdužuju, bez
 * posebne logike u profit.ts/stock računanju.
 */
export interface ProductBundle {
  id: string;
  naziv: string;
  kolicina: number;
  cijena: number;
  /** null = ne prikazuje se precrtana cijena za ovaj paket. */
  staraCijena: number | null;
  /** npr. "NAJBOLJA PONUDA" — "" = bez oznake. */
  oznaka: string;
  /** Unaprijed označen paket na stranici (tačno jedan po proizvodu). */
  istaknut: boolean;
  /** Mala slika uz naziv (npr. gratis poklon uz paket) — "" = bez slike. */
  bonusSlika: string;
}

/**
 * Cross-sell/upsell checkbox u checkoutu — "Dodaj i X za +Y KM". `targetId`
 * je id DRUGOG proizvoda (CMS ili legacy, vidi home/rank.ts LEGACY_PRODUCT_ID)
 * koji se nudi. Cijena/tekst su slobodni, ne moraju pratiti redovnu cijenu
 * ciljnog proizvoda — admin sam odlučuje šta je dobra ponuda.
 */
export interface ProductUpsell {
  aktivan: boolean;
  targetId: string | null;
  cijena: number;
  tekst: string;
}

export function defaultUpsell(): ProductUpsell {
  return { aktivan: false, targetId: null, cijena: 0, tekst: "" };
}

/**
 * `ProductUpsell` + ciljni proizvod već razrješen (slika/naziv) za prikaz
 * u checkoutu — vidi `resolveUpsellDisplay` u repo.ts. Ako se ciljni
 * proizvod ne može razrješiti (obrisan/nije objavljen), checkout dobija
 * `null` umjesto ovog tipa i cross-sell se jednostavno ne prikazuje.
 */
export interface ResolvedUpsell extends ProductUpsell {
  slika: string;
  targetNaziv: string;
}

export interface Product {
  id: string;
  naziv: string;
  slug: string;
  sku: string;
  kategorija: string;
  /** Za "Kupuj po kategoriji" na početnoj — "" = ne prikazuje se ni u jednoj kategoriji. */
  shopKategorija: "" | "bebe" | "djevojcice" | "djecaci" | "edukativno" | "kreativno";
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
  /** Paketne ponude — NACRT (admin ga uređuje slobodno, ne utiče na javnu stranicu). */
  paketiAktivni: boolean;
  paketi: ProductBundle[];
  publishedHero: Hero | null;
  publishedSections: Block[] | null;
  publishedData: PublishedData | null;
  /** Paketne ponude — OBJAVLJENO (ono što javna stranica stvarno prikazuje/prodaje). */
  publishedPaketiAktivni: boolean;
  publishedPaketi: ProductBundle[] | null;
  /** Prekidač za početnu stranicu — proizvod se i dalje normalno prodaje
   *  na svojoj stranici, samo se ne nudi na listama/rangiranju na početnoj. */
  prikaziNaPocetnoj: boolean;
  /** Ručno "nema na stanju" — NE blokira narudžbu, samo prikaz na listama (vidi cms/schema.sql komentar). */
  rasprodano: boolean;
  /** Cross-sell/upsell — NACRT. */
  upsell: ProductUpsell;
  /** Cross-sell/upsell — OBJAVLJENO (ono što checkout stvarno nudi). */
  publishedUpsell: ProductUpsell | null;
  /** Social proof traka iznad cijene — NACRT. Koje recenzije se prikazuju bira se po recenziji (Review.featuredProductPage). */
  socialProofAktivno: boolean;
  /** Social proof traka — OBJAVLJENO. */
  publishedSocialProofAktivno: boolean;
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
  /** Admin ručno bira koje STVARNE recenzije idu u traku na početnoj. */
  featuredHomepage: boolean;
  /** Admin ručno bira koje recenzije idu u social proof traku na stranici proizvoda (iznad cijene). */
  featuredProductPage: boolean;
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
  /** Kad je true, cijeli javni sajt (ne admin) pokazuje "zatvoreno" stranicu — vidi proxy.ts. */
  siteClosed?: boolean;
  siteClosedMessage?: string;
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
    oskudicaPoruke: [],
  };
}

export function noviPaket(): ProductBundle {
  return {
    id: `pkt_${Math.random().toString(36).slice(2, 10)}`,
    naziv: "",
    kolicina: 1,
    cijena: 0,
    staraCijena: null,
    oznaka: "",
    istaknut: false,
    bonusSlika: "",
  };
}

/**
 * Automatski PRIJEDLOG paketa (1/2/3 komada) kad admin prvi put upiše
 * cijenu novog proizvoda — vidi updateProduct() u repo.ts. Formula
 * (-10%/kom za 2, -21%/kom za 3, zaokruženo na cijeli KM) je ista koja
 * se već stvarno koristi i prodaje na rotirajućim zvečkama (19/34/45
 * za cijenu=19) — nije izmišljena, admin odluka 2026-11-15. Samo
 * PRIJEDLOG: `paketiAktivni` ostaje isključen, admin sam uključi kad
 * pregleda/izmijeni.
 */
export function suggestPaketi(cijena: number): ProductBundle[] {
  const tier2 = Math.round(cijena * 2 * 0.9);
  const tier3 = Math.round(cijena * 3 * 0.79);
  return [
    { id: `pkt_${Math.random().toString(36).slice(2, 10)}`, naziv: "1 komad", kolicina: 1, cijena, staraCijena: null, oznaka: "", istaknut: true, bonusSlika: "" },
    { id: `pkt_${Math.random().toString(36).slice(2, 10)}`, naziv: "2 komada", kolicina: 2, cijena: tier2, staraCijena: null, oznaka: "NAJPOPULARNIJE", istaknut: false, bonusSlika: "" },
    { id: `pkt_${Math.random().toString(36).slice(2, 10)}`, naziv: "3 komada", kolicina: 3, cijena: tier3, staraCijena: null, oznaka: "NAJBOLJA PONUDA", istaknut: false, bonusSlika: "" },
  ];
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
    case "isticanja":
      return {
        naslov: "",
        items: [
          { naslov: "", tekst: "" },
          { naslov: "", tekst: "" },
          { naslov: "", tekst: "" },
        ],
      };
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
  isticanja: "Isticanja (bez slike)",
};
