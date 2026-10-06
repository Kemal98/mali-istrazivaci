import "server-only";
import * as XLSX from "xlsx";
import type { Order } from "./types";
import { postalCodeFor } from "./postalCodes";

/**
 * Fajl za A2B "Masovni import" — kolone i redoslijed su tačno prepisani
 * iz njihovog šablona (A2B Masovni import primjer.xlsx). Polja O–T
 * (plaća, način plaćanja, povrat otpremnice, subota, osiguranje…) se
 * NAMJERNO ostavljaju prazna — admin ih ne popunjava, valjda su to
 * podešavanja na A2B nalogu, ne po pošiljci.
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
  // Broj ostaje TAČNO kakav je upisan — ništa se ne mijenja/dodaje osim
  // nedostajuće vodeće nule (npr. "63390030" -> "063390030"). Ranije se
  // ovdje lijepio "+387" prefiks, što je mijenjalo originalan broj.
  return order.phoneNormalized ? `0${order.phoneNormalized}` : order.phone;
}

function money(v: number): string {
  // Isti zapis kao u A2B primjeru (zarez umjesto tačke): "79,99"
  return v.toFixed(2).replace(".", ",");
}

export function buildA2bWorkbook(orders: Order[]): Buffer {
  // Prazan red odmah ispod naslova — u A2B primjeru prva ćelija tog reda
  // piše "Kontrolni red ostaje prazan" (sve ostalo prazno). Ne znamo
  // sigurno da li je to stvarni zahtjev njihovog parsera ili samo njihova
  // napomena u šablonu, ali prazan red ne može ništa pokvariti, pa ga
  // dodajemo za svaki slučaj da tačno pratimo njihov format.
  const controlRow = HEADERS.map(() => "");
  const rows = [
    HEADERS,
    controlRow,
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
      "", // Placa
      "", // Nacin placanja
      "", // Povrat otpremnice
      "", // Dostava Subotom
      "", // Dodatno osiguranje
      "", // Povrat otkupnine u sigurnosnoj vrecici
    ]),
  ];

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Masovni import");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
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
