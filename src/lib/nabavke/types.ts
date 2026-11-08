export const NABAVKA_STATUSES = [
  "ceka_dokumentaciju",
  "dokumentacija_zaprimljena",
  "ceka_provjeru",
  "spremno",
  "neaktivno",
] as const;
export type NabavkaStatus = (typeof NABAVKA_STATUSES)[number];

/** Nazivi statusa u adminu — baza čuva kod iznad, korisnik vidi ovo. */
export const STATUS_LABEL: Record<NabavkaStatus, string> = {
  ceka_dokumentaciju: "Čeka dokumentaciju",
  dokumentacija_zaprimljena: "Dokumentacija zaprimljena",
  ceka_provjeru: "Čeka provjeru i kalkulaciju",
  spremno: "Spremno za prodaju",
  neaktivno: "Neaktivno / otpisano",
};

/** Boja badge-a po statusu (klase su u admin.css). */
export const STATUS_CLASS: Record<NabavkaStatus, string> = {
  ceka_dokumentaciju: "nab-st-ceka",
  dokumentacija_zaprimljena: "nab-st-dok",
  ceka_provjeru: "nab-st-provjera",
  spremno: "nab-st-spremno",
  neaktivno: "nab-st-neaktivno",
};

export const STATUS_ICON: Record<NabavkaStatus, string> = {
  ceka_dokumentaciju: "📄",
  dokumentacija_zaprimljena: "📥",
  ceka_provjeru: "🔎",
  spremno: "✅",
  neaktivno: "🚫",
};

/** Redoslijed "napredovanja" statusa — koristi se za upozorenje kad admin preskoči korak. */
export const STATUS_ORDER: NabavkaStatus[] = [
  "ceka_dokumentaciju",
  "dokumentacija_zaprimljena",
  "ceka_provjeru",
  "spremno",
];

export const DOCUMENT_TYPES = [
  "racun",
  "fiskalni",
  "otpremnica",
  "ostalo",
  "nedostaje",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  racun: "Račun",
  fiskalni: "Fiskalni račun",
  otpremnica: "Otpremnica",
  ostalo: "Druga isprava",
  nedostaje: "Dokumentacija nedostaje",
};

export interface NabavkaPartija {
  id: string;
  productId: string;
  /** Spojeno iz products.naziv — samo za prikaz, ne piše se u bazu kroz ovo polje. */
  productName: string;
  dobavljac: string;
  datumNabavke: string;
  nabavljenoKolicina: number;
  preostalo: number;
  cijenaPoKomadu: number;
  dodatniTroskovi: number;
  tipDokumenta: DocumentType;
  brojDokumenta: string;
  datumDokumenta: string | null;
  dokumentUrl: string | null;
  napomena: string;
  status: NabavkaStatus;
  origin: "manual" | "legacy_import";
  createdAt: string;
  updatedAt: string;
}

/** Cijena po komadu iz partije, uključujući razvodnjene dodatne troškove. */
export function batchUnitCost(
  b: Pick<NabavkaPartija, "cijenaPoKomadu" | "dodatniTroskovi" | "nabavljenoKolicina">
): number {
  const extra = b.nabavljenoKolicina > 0 ? b.dodatniTroskovi / b.nabavljenoKolicina : 0;
  return Math.round((b.cijenaPoKomadu + extra) * 100) / 100;
}

export interface StatusLogEntry {
  id: string;
  batchId: string;
  createdAt: string;
  oldStatus: string;
  newStatus: string;
  napomena: string;
}

export const KOREKCIJA_VRSTE = [
  "manjak",
  "visak",
  "ostecena",
  "povrat",
  "otpis",
] as const;
export type KorekcijaVrsta = (typeof KOREKCIJA_VRSTE)[number];

export const KOREKCIJA_LABEL: Record<KorekcijaVrsta, string> = {
  manjak: "Manjak",
  visak: "Višak (popis)",
  ostecena: "Oštećena roba",
  povrat: "Povrat (ručni unos)",
  otpis: "Otpis",
};

export interface Korekcija {
  id: string;
  productId: string;
  batchId: string | null;
  vrsta: KorekcijaVrsta;
  kolicina: number;
  razlog: string;
  createdAt: string;
}

export interface Potrosnja {
  id: string;
  orderId: string;
  batchId: string | null;
  quantity: number;
  unitCost: number;
  createdAt: string;
  reversedAt: string | null;
}

/** Pet brojeva sa spec-a, po proizvodu — vidi stockSummaryByProduct() u repo.ts. */
export interface StockSummary {
  productId: string;
  productName: string;
  fizicki: number;
  dokumentovano: number;
  cekaDokumentaciju: number;
  rezervisano: number;
  raspolozivo: number;
}
