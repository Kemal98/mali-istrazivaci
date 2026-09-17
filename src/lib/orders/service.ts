import "server-only";

import { getProductCostPrice } from "@/lib/cms/repo";
import {
  getOrderByIdempotencyKey,
  insertOrder,
  markSheetFailed,
  markSheetSynced,
  recentOrderCount,
} from "./repo";
import { looksLikeBHPhone, normalizePhone } from "./phone";
import { payloadFromOrder, sendToSheet } from "./sheets";
import type { CreateOrderInput, Order } from "./types";

/**
 * Jedno mjesto kroz koje prolazi svaka narudžba sa sajta.
 *
 * Redoslijed je namjeran i nije proizvoljan:
 *   1. validacija
 *   2. idempotency provjera (dupli klik / retry)
 *   3. rate limit
 *   4. UPIS U BAZU  <-- narudžba je od ovog trenutka sigurna
 *
 * Google Sheet se sinhronizuje POSLIJE toga, izvan ovog poziva (vidi
 * syncOrderToSheet + after() u /api/orders). Razlog: Apps Script
 * odgovara nepredvidivo (mjereno do 8.8s), a Vercel ubija funkciju nakon
 * 10s — čekanje na Sheet bi obaralo narudžbe koje su već uspjele, i
 * kupac bi bez potrebe čekao 5-9 sekundi na potvrdu.
 *
 * Baza je primarna evidencija. Sheet je kopija — ako padne, narudžba je
 * već sačuvana i admin je vidi sa oznakom "nije sinhronizovano" +
 * dugmetom za ponovni pokušaj.
 */

const MAX_TEXT = 500;
const MAX_NOTE = 2000;

function clean(v: unknown, max = MAX_TEXT): string {
  if (typeof v !== "string") return "";
  // kontrolni znakovi van (uključujući NUL koji Postgres ne prima u text)
  return v
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export type CreateOrderResult =
  | { ok: true; order: Order; duplicate: boolean; sheetSynced: boolean }
  | { ok: false; status: number; error: string };

export async function createOrder(
  raw: CreateOrderInput & { honeypot?: string; clientIp?: string }
): Promise<CreateOrderResult> {
  /* ---------- 1. validacija ---------- */

  // Bot zamka: skriveno polje koje pravi kupac nikad ne vidi ni ne popuni.
  // Vraćamo "ok" bez upisa da bot ne zna da je odbijen.
  if (clean(raw.honeypot)) {
    return { ok: false, status: 400, error: "Neispravan zahtjev." };
  }

  const customerName = clean(raw.customerName, 120);
  const phone = clean(raw.phone, 40);
  const address = clean(raw.address);
  const city = clean(raw.city, 120);
  const productName = clean(raw.productName, 200);

  if (customerName.length < 2)
    return { ok: false, status: 400, error: "Upišite ime i prezime." };
  if (!looksLikeBHPhone(phone))
    return { ok: false, status: 400, error: "Upišite ispravan broj telefona." };
  if (address.length < 2)
    return { ok: false, status: 400, error: "Upišite adresu." };
  if (city.length < 2)
    return { ok: false, status: 400, error: "Upišite grad." };
  if (!productName)
    return { ok: false, status: 400, error: "Nedostaje proizvod." };

  const quantity = Math.min(50, Math.max(1, Math.trunc(Number(raw.quantity) || 1)));
  const unitPrice = Math.max(0, Number(raw.unitPrice) || 0);
  const shippingPrice = Math.max(0, Number(raw.shippingPrice) || 0);
  if (!Number.isFinite(unitPrice) || !Number.isFinite(shippingPrice))
    return { ok: false, status: 400, error: "Neispravna cijena." };

  const subtotal = Math.round(unitPrice * quantity * 100) / 100;
  const totalPrice = Math.round((subtotal + shippingPrice) * 100) / 100;

  const idempotencyKey = clean(raw.idempotencyKey, 100);
  if (!idempotencyKey)
    return { ok: false, status: 400, error: "Nedostaje idempotency ključ." };

  /* ---------- 2. dupli klik / retry ---------- */

  const existing = await getOrderByIdempotencyKey(idempotencyKey);
  if (existing) {
    // Isti ključ = isti pokušaj naručivanja. Ne pravimo drugu narudžbu,
    // vraćamo prvu kao uspjeh — kupac ide na /hvala kao i prvi put.
    return {
      ok: true,
      order: existing,
      duplicate: true,
      sheetSynced: existing.sheetSynced,
    };
  }

  /* ---------- 3. rate limit ---------- */

  const phoneNormalized = normalizePhone(phone);
  const clientIp = clean(raw.clientIp, 60);
  const recent = await recentOrderCount(phoneNormalized, clientIp, 10);
  if (recent.byPhone >= 3 || recent.byIp >= 10) {
    return {
      ok: false,
      status: 429,
      error:
        "Primili smo već nekoliko narudžbi s ovog broja. Javit ćemo se, " +
        "ili nam pišite na mail ako treba ispravka.",
    };
  }

  /* ---------- 4. upis u bazu ---------- */

  const productId = raw.productId ? clean(raw.productId, 64) : null;

  // Nabavna cijena se "fotografiše" ovdje, u trenutku prodaje — ne
  // referenciše proizvod, pa kasnija promjena cijene kod dobavljača ne
  // mijenja retroaktivno stare narudžbe. Ako lookup padne (baza, ili
  // proizvod bez productId-a/bez unesene cijene), ostaje 0 = nepoznato;
  // ovo NIKAD ne smije oboriti narudžbu, pa je namjerno best-effort.
  let costPrice = 0;
  if (productId) {
    try {
      costPrice = (await getProductCostPrice(productId)) ?? 0;
    } catch (e) {
      console.error("[orders] lookup nabavne cijene pao:", e);
    }
  }
  const costTotal = Math.round(costPrice * quantity * 100) / 100;

  const a = raw.attribution ?? {};
  const order = await insertOrder({
    customerName,
    phone,
    email: clean(raw.email, 200),
    city,
    address,
    postalCode: clean(raw.postalCode, 20),
    note: clean(raw.note, MAX_NOTE),
    productId,
    productName,
    quantity,
    unitPrice,
    subtotal,
    shippingPrice,
    totalPrice,
    costPrice,
    costTotal,
    utmSource: clean(a.utmSource, 120),
    utmMedium: clean(a.utmMedium, 120),
    utmCampaign: clean(a.utmCampaign, 200),
    utmContent: clean(a.utmContent, 200),
    utmTerm: clean(a.utmTerm, 200),
    fbclid: clean(a.fbclid, 300),
    landingPage: clean(a.landingPage, 400),
    referrer: clean(a.referrer, 400),
    idempotencyKey,
    clientIp,
    source: "web",
  });

  // Sheet sync NE ide ovdje — radi se poslije odgovora kupcu.
  return { ok: true, order, duplicate: false, sheetSynced: false };
}

/**
 * Upis u Google Sheet. Zove se iz after() — dakle POSLIJE nego što je
 * kupac dobio potvrdu, pa ga čekanje na Apps Script ne odgađa.
 */
export async function syncOrderToSheet(
  order: Order,
  extras: Record<string, unknown> = {}
): Promise<void> {
  const res = await sendToSheet(payloadFromOrder(order, extras));
  if (res.ok) {
    await markSheetSynced(order.id);
    return;
  }
  console.error(
    `[orders] Sheet sync pao za ${order.orderNumber}: ${res.error}`
  );
  await markSheetFailed(order.id, res.error ?? "nepoznata greška");
}

/** Ponovni pokušaj sinhronizacije iz admina. */
export async function retrySheetSync(
  order: Order
): Promise<{ ok: boolean; error?: string }> {
  const res = await sendToSheet(payloadFromOrder(order));
  if (res.ok) {
    await markSheetSynced(order.id);
    return { ok: true };
  }
  await markSheetFailed(order.id, res.error ?? "nepoznata greška");
  return { ok: false, error: res.error };
}
