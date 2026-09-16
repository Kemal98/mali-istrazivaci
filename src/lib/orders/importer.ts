import "server-only";

import { getOrderByImportHash, insertOrder } from "./repo";
import { normalizePhone } from "./phone";
import { ORDER_STATUSES, type OrderStatus } from "./types";

/**
 * Jednokratni import starih narudžbi iz Google Sheeta preko CSV-a.
 *
 * Google Sheet se NE DIRA — ovo samo čita fajl koji vlasnik izvuče sa
 * File -> Download -> Comma-separated values. Ništa se u tabeli ne briše
 * ni ne mijenja.
 *
 * Dvije stvari koje ovo mora izdržati na stvarnim podacima:
 *
 * 1) POMJERENE KOLONE. U tabeli je u nekom trenutku obrisana kolona
 *    "Datum", a Apps Script i dalje šalje datum kao prvi podatak — pa
 *    noviji redovi imaju sve pomjereno jedno mjesto udesno u odnosu na
 *    zaglavlje. Zato se za SVAKI red posebno provjeri da li ćelija pod
 *    zaglavljem "Ime" izgleda kao datum; ako da, taj red se čita sa
 *    pomjerajem +1. Tako rade i stari (poravnati) i novi (pomjereni).
 *
 * 2) DUPLIKATI. Stari redovi nemaju broj narudžbe, pa se ključ pravi od
 *    kombinacije: datum (dan) + normalizovan telefon + proizvod + ukupan
 *    iznos. Taj ključ ide u orders.import_hash koji ima UNIQUE indeks,
 *    pa se isti red ne može upisati dvaput ni da se import pokrene deset
 *    puta.
 */

/* ------------------------------ CSV parser ------------------------------ */

/** Parsira CSV po RFC 4180 (navodnici, zarezi i novi redovi unutar ćelija). */
export function parseCsv(text: string): string[][] {
  // skini BOM ako ga Google doda
  const src = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch === "\r") {
      // \r\n — preskoči, \n zatvara red
    } else {
      cell += ch;
    }
  }

  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }

  // izbaci potpuno prazne redove
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/* ------------------------------ mapiranje ------------------------------ */

/** "Količina" -> "kolicina", da zaglavlje nađemo bez obzira na dijakritike. */
function normHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/[čć]/g, "c")
    .replace(/ž/g, "z")
    .replace(/š/g, "s")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "");
}

/** Sinonimi po koloni — "prozivod" je stvarna tipfeler u tabeli. */
const FIELD_ALIASES: Record<string, string[]> = {
  datum: ["datum", "date", "vrijeme"],
  ime: ["ime", "imeiprezime", "kupac", "name"],
  telefon: ["telefon", "tel", "brojtelefona", "phone"],
  adresa: ["adresa", "ulicaibroj", "address"],
  grad: ["grad", "mjesto", "city"],
  napomena: ["napomena", "note", "komentar"],
  proizvod: ["proizvod", "prozivod", "product", "artikal"],
  cijena: ["cijena", "iznos", "ukupno", "price", "total"],
  status: ["status"],
  kolicina: ["kolicina", "komada", "qty", "quantity"],
};

function buildHeaderMap(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  header.forEach((raw, i) => {
    const h = normHeader(raw);
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      // "cijenabroj" je pomoćna kolona sa formulom — nije iznos narudžbe
      if (h === "cijenabroj") continue;
      if (aliases.includes(h) && map[field] === undefined) map[field] = i;
    }
  });
  return map;
}

/** Da li ćelija izgleda kao datum/vrijeme iz tabele? */
function looksLikeTimestamp(v: string): boolean {
  const s = (v ?? "").trim();
  if (!s) return false;
  return (
    /^\d{4}-\d{2}-\d{2}/.test(s) || // 2026-09-15 20:28:22
    /^\d{1,2}\.\s*\d{1,2}\.\s*\d{4}/.test(s) || // 15. 9. 2026. u 15:05
    /^\d{1,2}\/\d{1,2}\/\d{4}/.test(s) // 9/15/2026
  );
}

/** "34 KM" -> 34 ; "1.234,50 KM" -> 1234.5 */
export function parseMoney(v: string): number | null {
  if (!v) return null;
  let s = String(v).replace(/km/gi, "").replace(/\s/g, "").trim();
  if (!s) return null;
  // ako ima i tačku i zarez, tačka je hiljadarka, zarez decimalni
  if (s.includes(".") && s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Vrijeme iz tabele je LOKALNO bosansko (tako ga generiše
 * toLocaleString("bs-BA") u checkoutu). Ako se komponente proslijede u
 * new Date(...), JS ih tumači u zoni SERVERA — na Vercelu je to UTC, pa
 * bi se svaka narudžba pomjerila za 1-2 sata i one oko ponoći bi pale u
 * pogrešan dan. Ovdje se offset za Europe/Sarajevo izračuna za taj
 * konkretan datum (ispravno i za zimsko i za ljetno vrijeme).
 */
function sarajevoToIso(
  y: number, mo: number, d: number, h: number, mi: number, se: number
): string {
  const asUtc = Date.UTC(y, mo - 1, d, h, mi, se);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo",
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = fmt.formatToParts(new Date(asUtc));
  const g = (t: string) => Number(parts.find((x) => x.type === t)?.value ?? 0);
  const localAsUtc = Date.UTC(
    g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second")
  );
  // offset = koliko Sarajevo ide naprijed od UTC-a u tom trenutku
  return new Date(asUtc - (localAsUtc - asUtc)).toISOString();
}

/** Datum iz tabele -> ISO. Podržava bs format "15. 9. 2026. u 15:05:55". */
export function parseDatum(v: string): string | null {
  const s = (v ?? "").trim();
  if (!s) return null;

  // 2026-09-15 20:28:22  /  2026-09-15T20:28:22
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T]?(\d{2})?:?(\d{2})?:?(\d{2})?/);
  if (iso) {
    const [, y, mo, d, h = "0", mi = "0", se = "0"] = iso;
    return sarajevoToIso(
      Number(y), Number(mo), Number(d), Number(h), Number(mi), Number(se)
    );
  }

  // 15. 9. 2026. u 15:05:55  |  15.9.2026 15:05
  const bs = s.match(
    /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\.?(?:\s*u)?\s*(\d{1,2})?:?(\d{2})?:?(\d{2})?/
  );
  if (bs) {
    const [, d, mo, y, h = "0", mi = "0", se = "0"] = bs;
    return sarajevoToIso(
      Number(y), Number(mo), Number(d), Number(h), Number(mi), Number(se)
    );
  }

  const fallback = new Date(s);
  return Number.isNaN(fallback.getTime()) ? null : fallback.toISOString();
}

/** Status iz tabele -> status u bazi. */
export function mapStatus(v: string): OrderStatus {
  const s = normHeader(v || "");
  if (!s) return "NEW";
  if (s.startsWith("novo") || s === "new") return "NEW";
  if (s.startsWith("pozvano") || s.startsWith("potvrd")) return "CONFIRMED";
  if (s.startsWith("pakov")) return "PACKING";
  if (s.startsWith("poslano") || s.startsWith("shipped")) return "SHIPPED";
  if (s.startsWith("isporuc") || s.startsWith("dostavlj")) return "DELIVERED";
  if (s.startsWith("vrac") || s.startsWith("return")) return "RETURNED";
  if (s.startsWith("otkaz") || s.startsWith("cancel")) return "CANCELLED";
  // nepoznat status iz tabele — ne izmišljamo, ide kao nova
  return (ORDER_STATUSES as readonly string[]).includes(v.toUpperCase())
    ? (v.toUpperCase() as OrderStatus)
    : "NEW";
}

/* ------------------------------ red -> narudžba ------------------------------ */

/** Dostava je uvijek bila 10 KM, a u tabeli je zapisan samo ukupan iznos. */
const LEGACY_SHIPPING = 10;

export interface MappedRow {
  rowNumber: number;
  shifted: boolean;
  createdAt: string | null;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  productName: string;
  quantity: number;
  total: number | null;
  status: OrderStatus;
  importHash: string;
  error?: string;
}

function cell(row: string[], idx: number | undefined, shift: number): string {
  if (idx === undefined) return "";
  return (row[idx + shift] ?? "").trim();
}

export function mapRow(
  row: string[],
  hmap: Record<string, number>,
  rowNumber: number
): MappedRow {
  // Ako pod zaglavljem "Ime" stoji datum, cijeli red je pomjeren za +1
  // (posljedica obrisane kolone "Datum" u tabeli).
  const imeIdx = hmap.ime;
  const shifted =
    hmap.datum === undefined &&
    imeIdx !== undefined &&
    looksLikeTimestamp(row[imeIdx] ?? "");
  const shift = shifted ? 1 : 0;

  const datumRaw = shifted
    ? (row[imeIdx as number] ?? "")
    : cell(row, hmap.datum, 0);

  const customerName = cell(row, hmap.ime, shift);
  const phone = cell(row, hmap.telefon, shift);
  const address = cell(row, hmap.adresa, shift);
  const city = cell(row, hmap.grad, shift);
  const note = cell(row, hmap.napomena, shift);
  const productName = cell(row, hmap.proizvod, shift);
  const total = parseMoney(cell(row, hmap.cijena, shift));
  const qtyRaw = cell(row, hmap.kolicina, shift);
  const quantity = Math.max(1, Math.trunc(Number(qtyRaw) || 1));
  const status = mapStatus(cell(row, hmap.status, shift));
  const createdAt = parseDatum(datumRaw);

  // Ključ za duplikate: dan + telefon + proizvod + iznos. Stari redovi
  // nemaju broj narudžbe, pa je ovo najstabilnija kombinacija.
  const day = createdAt ? createdAt.slice(0, 10) : "bez-datuma";
  const importHash = [
    day,
    normalizePhone(phone) || "bez-telefona",
    normHeader(productName) || "bez-proizvoda",
    total ?? "bez-iznosa",
  ].join("|");

  let error: string | undefined;
  if (!customerName && !phone) error = "nema ni imena ni telefona";
  else if (total === null) error = "iznos se ne može pročitati";

  return {
    rowNumber,
    shifted,
    createdAt,
    customerName,
    phone,
    address,
    city,
    note,
    productName,
    quantity,
    total,
    status,
    importHash,
    error,
  };
}

/* ------------------------------ import ------------------------------ */

export interface ImportReport {
  found: number;
  wouldImport: number;
  imported: number;
  duplicates: number;
  errors: number;
  shiftedRows: number;
  /** Redovi bez datuma — preskočeni ako nije zadan zamjenski datum. */
  noDate: number;
  missingHeaders: string[];
  problems: { row: number; reason: string }[];
  preview: {
    row: number;
    datum: string;
    ime: string;
    telefon: string;
    grad: string;
    proizvod: string;
    ukupno: number | null;
    status: OrderStatus;
    stanje: "uvezlo bi se" | "duplikat" | "greška" | "bez datuma";
  }[];
}

export async function runImport(
  csv: string,
  opts: {
    commit: boolean;
    /**
     * Datum koji se koristi za redove BEZ datuma. Stari redovi u tabeli
     * su izgubili datum kad je kolona "Datum" obrisana, a upisati im
     * DANAŠNJI datum bi pokvarilo svu statistiku po periodima (izgledalo
     * bi kao da je 40 narudžbi stiglo danas). Zato se bez ovog podatka
     * takvi redovi PRESKAČU, a ne izmišlja im se datum.
     */
    fallbackDate?: string;
  }
): Promise<ImportReport> {
  const rows = parseCsv(csv);
  if (rows.length < 2) {
    return {
      found: 0,
      wouldImport: 0,
      imported: 0,
      duplicates: 0,
      errors: 0,
      shiftedRows: 0,
      noDate: 0,
      missingHeaders: ["fajl je prazan ili nema zaglavlje"],
      problems: [],
      preview: [],
    };
  }

  const header = rows[0];
  const hmap = buildHeaderMap(header);
  const required = ["ime", "telefon", "proizvod", "cijena"];
  const missingHeaders = required.filter((f) => hmap[f] === undefined);

  const report: ImportReport = {
    found: rows.length - 1,
    wouldImport: 0,
    imported: 0,
    duplicates: 0,
    errors: 0,
    shiftedRows: 0,
    noDate: 0,
    missingHeaders,
    problems: [],
    preview: [],
  };

  if (missingHeaders.length) return report;

  // Ključevi unutar samog fajla — da dva identična reda u istom CSV-u ne
  // prođu oba (UNIQUE bi uhvatio, ali ovako je izvještaj tačan).
  const seen = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const m = mapRow(rows[i], hmap, i + 1);
    if (m.shifted) report.shiftedRows++;

    let stanje: "uvezlo bi se" | "duplikat" | "greška" | "bez datuma" =
      "uvezlo bi se";

    // Red bez datuma: preskoči, osim ako je vlasnik zadao zamjenski datum
    if (!m.error && !m.createdAt && !opts.fallbackDate) {
      report.noDate++;
      stanje = "bez datuma";
      if (report.preview.length < 25) {
        report.preview.push({
          row: m.rowNumber,
          datum: "—",
          ime: m.customerName,
          telefon: m.phone,
          grad: m.city,
          proizvod: m.productName,
          ukupno: m.total,
          status: m.status,
          stanje,
        });
      }
      continue;
    }

    if (m.error) {
      report.errors++;
      report.problems.push({ row: m.rowNumber, reason: m.error });
      stanje = "greška";
    } else if (seen.has(m.importHash) || (await getOrderByImportHash(m.importHash))) {
      report.duplicates++;
      stanje = "duplikat";
    } else {
      seen.add(m.importHash);
      report.wouldImport++;

      if (opts.commit) {
        const total = m.total as number;
        // Dostava nije bila zapisana odvojeno; uvijek je bila 10 KM.
        const shipping = total > LEGACY_SHIPPING ? LEGACY_SHIPPING : 0;
        const subtotal = Math.round((total - shipping) * 100) / 100;
        try {
          await insertOrder({
            customerName: m.customerName,
            phone: m.phone,
            city: m.city,
            address: m.address,
            note: m.note,
            productName: m.productName,
            quantity: m.quantity,
            unitPrice:
              m.quantity > 0
                ? Math.round((subtotal / m.quantity) * 100) / 100
                : subtotal,
            subtotal,
            shippingPrice: shipping,
            totalPrice: total,
            status: m.status,
            importHash: m.importHash,
            source: "import",
            createdAt: m.createdAt ?? opts.fallbackDate,
            // red je došao IZ tabele, dakle tamo već postoji
            sheetSynced: true,
          });
          report.imported++;
        } catch (e) {
          report.errors++;
          report.wouldImport--;
          report.problems.push({
            row: m.rowNumber,
            reason: e instanceof Error ? e.message : "upis nije uspio",
          });
          stanje = "greška";
        }
      }
    }

    if (report.preview.length < 25) {
      report.preview.push({
        row: m.rowNumber,
        datum: m.createdAt ? m.createdAt.slice(0, 16).replace("T", " ") : "—",
        ime: m.customerName,
        telefon: m.phone,
        grad: m.city,
        proizvod: m.productName,
        ukupno: m.total,
        status: m.status,
        stanje,
      });
    }
  }

  return report;
}
