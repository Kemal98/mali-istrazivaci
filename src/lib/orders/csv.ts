import { datum } from "@/lib/cms/datum";
import { STATUS_LABEL, type Order } from "./types";

/** Escapuje jednu ćeliju po CSV pravilima (RFC 4180). */
function cell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  // Ako ima zarez, navodnik ili novi red — cijelu vrijednost u navodnike,
  // a navodnike unutra udvostruči.
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const COLUMNS = [
  "Order ID",
  "Datum",
  "Kupac",
  "Telefon",
  "Grad",
  "Adresa",
  "Proizvod",
  "Količina",
  "Cijena proizvoda",
  "Dostava",
  "Ukupno",
  "Status",
  "Courier",
  "Tracking",
  "UTM source",
  "UTM campaign",
  "UTM content",
] as const;

export function ordersToCsv(orders: Order[]): string {
  const rows = orders.map((o) =>
    [
      o.orderNumber,
      datum(o.createdAt),
      o.customerName,
      o.phone,
      o.city,
      o.address,
      o.productName,
      o.quantity,
      o.subtotal,
      o.shippingPrice,
      o.totalPrice,
      STATUS_LABEL[o.status],
      o.courier,
      o.trackingNumber,
      o.utmSource,
      o.utmCampaign,
      o.utmContent,
    ]
      .map(cell)
      .join(",")
  );

  // BOM na početku: bez njega Excel na Windowsu prikaže č/ž/ć kao smeće.
  return "﻿" + [COLUMNS.join(","), ...rows].join("\r\n");
}
