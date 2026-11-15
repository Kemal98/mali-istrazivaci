import "server-only";
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import type { Order } from "./types";
import { splitAddress, phoneForA2B, extractPostalCode, formatWeight, formatMoney } from "./a2bFormat";

/**
 * Fajl za A2B "Masovni import" — kolone, redoslijed i format tačno po
 * A2B specifikaciji (20 kolona, list "Report", kontrolni red odmah
 * ispod naslova). Logika pretvaranja podataka (adresa, telefon,
 * poštanski broj, težina) je u a2bFormat.ts, testirana u
 * a2bFormat.test.ts — ovdje se samo poziva i upisuje u exceljs.
 *
 * Plaća / Način plaćanja / Povrat otpremnice / Dostava Subotom /
 * Dodatno osiguranje / Povrat otkupnine u sigurnosnoj vrecici ostaju
 * NAMJERNO prazne (eksplicitna admin odluka) — nisu po pošiljci, nego
 * podešavanja na A2B nalogu.
 */
const HEADERS = [
  "ID Broj Posiljke",
  "Ime i Prezime",
  "Kompanija",
  "Ulica",
  "Broj",
  "Postanski broj",
  "Grad/Mjesto",
  "Kontakt telefon",
  "Broj koleta",
  "Tezina",
  "Otkupnina",
  "Interna referenca",
  "Dodatna referenca",
  "Parent Package ID",
  "Placa",
  "Nacin placanja",
  "Povrat otpremnice",
  "Dostava Subotom",
  "Dodatno osiguranje",
  "Povrat otkupnine u sigurnosnoj vrecici",
];

export interface A2bExportResult {
  buffer: Buffer;
  /** Brojevi narudžbi (Interna referenca) kojima poštanski broj nije poznat. */
  missingPostal: string[];
}

export async function buildA2bWorkbook(orders: Order[]): Promise<A2bExportResult> {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Report");

  sheet.addRow(HEADERS);
  // Kontrolni red — u pravom A2B šablonu prva ćelija ovog reda doslovno
  // piše ovaj tekst, ostatak reda prazan.
  sheet.addRow(["Kontrolni red ostaje prazan"]);

  const missingPostal: string[] = [];

  // Cross-sell dodaci (linked_order_id — vidi products.upsell_* u
  // cms/schema.sql) NISU zasebna pošiljka: kurir fizički nosi JEDNU
  // kutiju za glavnu narudžbu + dodatak, pa se njihov iznos spaja u
  // otkupninu GLAVNE narudžbe, a sami se NE prikazuju kao svoj red. Ako
  // je admin izvezao SAMO dodatak (glavna narudžba nije u istom izvozu —
  // rijedak, ručni slučaj), tretira se kao obična samostalna pošiljka,
  // bolje nego da se tiho izgubi iz izvoza.
  const byId = new Map(orders.map((o) => [o.id, o]));
  const dodaciZaGlavnu = new Map<string, Order[]>();
  const preskociKaoDodatak = new Set<string>();
  for (const o of orders) {
    if (o.linkedOrderId && byId.has(o.linkedOrderId)) {
      preskociKaoDodatak.add(o.id);
      const lista = dodaciZaGlavnu.get(o.linkedOrderId) ?? [];
      lista.push(o);
      dodaciZaGlavnu.set(o.linkedOrderId, lista);
    }
  }

  for (const o of orders) {
    if (preskociKaoDodatak.has(o.id)) continue;
    const dodaci = dodaciZaGlavnu.get(o.id) ?? [];
    const otkupnina = o.totalPrice + dodaci.reduce((sum, d) => sum + d.totalPrice, 0);
    const internaReferenca = [o.orderNumber, ...dodaci.map((d) => d.orderNumber)].join("+");

    const { ulica, broj } = splitAddress(o.address);
    const { city, postalCode } = extractPostalCode(o.city, o.postalCode);
    if (!postalCode) missingPostal.push(o.orderNumber);

    const row = sheet.addRow([
      "", // ID Broj Posiljke — dodjeljuje A2B
      o.customerName,
      "", // Kompanija — ne postoji polje u narudžbi
      ulica,
      broj,
      postalCode ? Number(postalCode) : "",
      city,
      phoneForA2B(o.phone),
      1, // Broj koleta
      formatWeight(undefined), // težina nije poznata ni za jedan proizvod -> uvijek "1,000"
      formatMoney(otkupnina), // Otkupnina = proizvod (+ cross-sell dodatak) + dostava
      internaReferenca, // Interna referenca — da se nazad prepozna narudžba(e)
      "", // Dodatna referenca
      "", // Parent Package ID
      "", // Placa
      "", // Nacin placanja
      "", // Povrat otpremnice
      "", // Dostava Subotom
      "", // Dodatno osiguranje
      "", // Povrat otkupnine u sigurnosnoj vrecici
    ]);

    // Telefon i težina MORAJU ostati tekst (ne broj) — inače Excel može
    // pojesti vodeću nulu na telefonu ili zarez u težini.
    row.getCell(8).numFmt = "@";
    row.getCell(10).numFmt = "@";
    row.getCell(11).numFmt = "@";
  }

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return { buffer: Buffer.from(arrayBuffer), missingPostal };
}

/**
 * Fajl za OSOBE KOJE PAKUJU — isti skup narudžbi kao A2B izvoz (ista
 * selekcija: checkbox ili datum), ali druga svrha: A2B tabela nema
 * nikakav podatak o proizvodu (kurira ne zanima šta je u paketu), a
 * pakeru treba TAČNO to, ne adresa/telefon/cijena. Zato poseban,
 * jednostavniji fajl, ne dodatne kolone u A2B tabeli.
 */
const PACKING_HEADERS = ["Narudžba", "Ime i prezime", "Proizvod", "Količina", "Grad", "Napomena"];

export function buildPackingWorkbook(orders: Order[]): Buffer {
  const rows = [
    PACKING_HEADERS,
    ...orders.map((o) => [
      o.orderNumber,
      o.customerName,
      o.productName,
      o.quantity,
      o.city,
      o.note,
    ]),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Za pakovanje");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
