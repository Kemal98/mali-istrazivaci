import "server-only";
import * as XLSX from "xlsx";
import type { Order } from "./types";
import { postalCodeFor } from "./postalCodes";

/**
 * Fajl za A2B "Masovni import" — kolone i redoslijed su tačno prepisani
 * iz njihovog šablona (A2B Masovni import primjer.xlsx). Polja O–T su
 * fiksna za sve pošiljke (dogovor sa A2B, ne po narudžbi): pošiljalac
 * plaća, virman, i nijedna od dodatnih usluga (subota, osiguranje…).
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

function phoneForA2B(order: Order): string {
  // phoneNormalized je bez prefiksa (npr. "61123456") — A2B primjer
  // koristi +387 format.
  return order.phoneNormalized ? `+387${order.phoneNormalized}` : order.phone;
}

function money(v: number): string {
  // Isti zapis kao u A2B primjeru (zarez umjesto tačke): "79,99"
  return v.toFixed(2).replace(".", ",");
}

export function buildA2bWorkbook(orders: Order[]): Buffer {
  const rows = [
    HEADERS,
    ...orders.map((o) => [
      "", // ID Broj Posiljke — dodjeljuje A2B
      o.customerName,
      "", // Kompanija
      o.address, // cijela adresa — "Ulica"/"Broj" nisu odvojeni kod nas
      "", // Broj
      postalCodeFor(o.city),
      o.city,
      phoneForA2B(o),
      1, // Broj koleta
      "1", // Tezina (kg) — fiksno za sve pošiljke
      money(o.totalPrice), // Otkupnina = proizvod + dostava (plaća kupac kuriru)
      o.orderNumber, // Interna referenca — da se nazad prepozna narudžba
      "", // Dodatna referenca
      "", // Parent Package ID
      "Posiljalac",
      "Virman",
      "NE",
      "NE",
      "NE",
      "NE",
    ]),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Masovni import");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
