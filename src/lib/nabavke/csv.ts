import { datum } from "@/lib/cms/datum";
import { DOCUMENT_TYPE_LABEL, STATUS_LABEL, batchUnitCost, type NabavkaPartija } from "./types";

/** Escapuje jednu ćeliju po CSV pravilima (RFC 4180) — isti obrazac kao orders/csv.ts. */
function cell(v: unknown): string {
  const str = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r;]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

const COLUMNS = [
  "Proizvod",
  "Dobavljač",
  "Datum nabavke",
  "Količina",
  "Preostalo",
  "Cijena/kom",
  "Dodatni troškovi",
  "Cijena/kom (sa troškovima)",
  "Tip dokumenta",
  "Broj dokumenta",
  "Status",
  "Napomena",
  "Dodano",
] as const;

/** Izvoz za knjigovođu — isti RFC4180 + BOM obrazac kao ordersToCsv. */
export function partijeToCsv(items: NabavkaPartija[]): string {
  const rows = items.map((b) =>
    [
      b.productName,
      b.dobavljac,
      b.datumNabavke,
      b.nabavljenoKolicina,
      b.preostalo,
      b.cijenaPoKomadu,
      b.dodatniTroskovi,
      batchUnitCost(b),
      DOCUMENT_TYPE_LABEL[b.tipDokumenta],
      b.brojDokumenta,
      STATUS_LABEL[b.status],
      b.napomena,
      datum(b.createdAt),
    ]
      .map(cell)
      .join(",")
  );

  return "﻿" + [COLUMNS.join(","), ...rows].join("\r\n");
}
