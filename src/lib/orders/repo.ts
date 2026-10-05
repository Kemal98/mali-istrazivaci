import { newId, nowIso, sql } from "@/lib/cms/db";
import { normalizePhone } from "./phone";
import {
  isOrderStatus,
  type Order,
  type OrderEvent,
  type OrderStatus,
} from "./types";

type Row = Record<string, unknown>;

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

function rowToOrder(r: Row): Order {
  return {
    id: s(r.id),
    orderNumber: s(r.order_number),
    createdAt: s(r.created_at),
    updatedAt: s(r.updated_at),

    customerName: s(r.customer_name),
    phone: s(r.phone),
    phoneNormalized: s(r.phone_normalized),
    email: s(r.email),
    city: s(r.city),
    address: s(r.address),
    postalCode: s(r.postal_code),
    note: s(r.note),

    productId: r.product_id ? s(r.product_id) : null,
    productName: s(r.product_name),
    quantity: n(r.quantity),
    unitPrice: n(r.unit_price),

    subtotal: n(r.subtotal),
    shippingPrice: n(r.shipping_price),
    discount: n(r.discount),
    totalPrice: n(r.total_price),

    costPrice: n(r.cost_price),
    costTotal: n(r.cost_total),

    paymentMethod: s(r.payment_method),
    status: (isOrderStatus(r.status) ? r.status : "NEW") as OrderStatus,

    courier: s(r.courier),
    trackingNumber: s(r.tracking_number),
    shippingStatus: s(r.shipping_status),
    shippedAt: r.shipped_at ? s(r.shipped_at) : null,
    deliveredAt: r.delivered_at ? s(r.delivered_at) : null,

    utmSource: s(r.utm_source),
    utmMedium: s(r.utm_medium),
    utmCampaign: s(r.utm_campaign),
    utmContent: s(r.utm_content),
    utmTerm: s(r.utm_term),
    fbclid: s(r.fbclid),
    landingPage: s(r.landing_page),
    referrer: s(r.referrer),

    sheetSynced: Boolean(r.sheet_synced),
    sheetSyncedAt: r.sheet_synced_at ? s(r.sheet_synced_at) : null,
    sheetError: s(r.sheet_error),
    sheetAttempts: n(r.sheet_attempts),

    source: s(r.source),
  };
}

function rowToEvent(r: Row): OrderEvent {
  return {
    id: s(r.id),
    orderId: s(r.order_id),
    createdAt: s(r.created_at),
    kind: s(r.kind),
    field: s(r.field),
    oldValue: s(r.old_value),
    newValue: s(r.new_value),
    actor: s(r.actor),
    note: s(r.note),
  };
}

/* ------------------------------ upis ------------------------------ */

export interface InsertOrderRow {
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  postalCode?: string;
  note?: string;
  productId?: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  shippingPrice: number;
  discount?: number;
  totalPrice: number;
  /** Fotografija nabavne cijene po komadu (0 = nepoznato). */
  costPrice?: number;
  costTotal?: number;
  paymentMethod?: string;
  status?: OrderStatus;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  fbclid?: string;
  landingPage?: string;
  referrer?: string;
  idempotencyKey?: string | null;
  importHash?: string | null;
  clientIp?: string;
  source?: string;
  createdAt?: string;
  /**
   * Za uvezene narudžbe: one su VEĆ u Google Sheetu (odatle i dolaze),
   * pa se odmah označe kao sinhronizovane — inače bi admin prikazivao
   * lažno upozorenje "N narudžbi nije sinhronizovano".
   */
  sheetSynced?: boolean;
}

export async function getOrderByIdempotencyKey(
  key: string
): Promise<Order | null> {
  if (!key) return null;
  const rows = await sql()<Row[]>`
    SELECT * FROM orders WHERE idempotency_key = ${key} LIMIT 1`;
  return rows[0] ? rowToOrder(rows[0]) : null;
}

export async function getOrderByImportHash(hash: string): Promise<Order | null> {
  if (!hash) return null;
  const rows = await sql()<Row[]>`
    SELECT * FROM orders WHERE import_hash = ${hash} LIMIT 1`;
  return rows[0] ? rowToOrder(rows[0]) : null;
}

/**
 * Upisuje narudžbu. Broj narudžbe (MI-000001) generiše Postgres sequence
 * unutar samog INSERT-a — dvije paralelne narudžbe ne mogu dobiti isti
 * broj. ON CONFLICT DO NOTHING pokriva slučaj kad dva requesta sa istim
 * idempotency ključem stignu u isto vrijeme.
 */
export async function insertOrder(input: InsertOrderRow): Promise<Order> {
  const id = newId("ord");
  const ts = input.createdAt || nowIso();

  const rows = await sql()<Row[]>`
    INSERT INTO orders (
      id, order_number, created_at, updated_at,
      customer_name, phone, phone_normalized, email, city, address,
      postal_code, note,
      product_id, product_name, quantity, unit_price,
      subtotal, shipping_price, discount, total_price,
      cost_price, cost_total,
      payment_method, status,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      fbclid, landing_page, referrer,
      idempotency_key, import_hash, client_ip, source,
      sheet_synced, sheet_synced_at
    ) VALUES (
      ${id},
      'MI-' || lpad(nextval('orders_number_seq')::text, 6, '0'),
      ${ts}, ${ts},
      ${input.customerName}, ${input.phone}, ${normalizePhone(input.phone)},
      ${input.email ?? ""}, ${input.city}, ${input.address},
      ${input.postalCode ?? ""}, ${input.note ?? ""},
      ${input.productId ?? null}, ${input.productName}, ${input.quantity},
      ${input.unitPrice},
      ${input.subtotal}, ${input.shippingPrice}, ${input.discount ?? 0},
      ${input.totalPrice},
      ${input.costPrice ?? 0}, ${input.costTotal ?? 0},
      ${input.paymentMethod ?? "pouzecem"}, ${input.status ?? "NEW"},
      ${input.utmSource ?? ""}, ${input.utmMedium ?? ""},
      ${input.utmCampaign ?? ""}, ${input.utmContent ?? ""},
      ${input.utmTerm ?? ""},
      ${input.fbclid ?? ""}, ${input.landingPage ?? ""}, ${input.referrer ?? ""},
      ${input.idempotencyKey ?? null}, ${input.importHash ?? null},
      ${input.clientIp ?? ""}, ${input.source ?? "web"},
      ${input.sheetSynced ?? false},
      ${input.sheetSynced ? ts : null}
    )
    ON CONFLICT DO NOTHING
    RETURNING *`;

  if (rows[0]) {
    const order = rowToOrder(rows[0]);
    await addEvent(order.id, {
      kind: "created",
      newValue: order.status,
      actor: input.source === "import" ? "import" : "kupac",
    });
    return order;
  }

  // Konflikt: neko je u međuvremenu upisao isti ključ — vrati postojeću
  const existing =
    (input.idempotencyKey
      ? await getOrderByIdempotencyKey(input.idempotencyKey)
      : null) ??
    (input.importHash ? await getOrderByImportHash(input.importHash) : null);

  if (existing) return existing;
  throw new Error("Narudžba nije upisana (konflikt bez postojećeg zapisa).");
}

/* ------------------------------ audit log ------------------------------ */

export async function addEvent(
  orderId: string,
  e: {
    kind: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
    actor?: string;
    note?: string;
  }
) {
  await sql()`
    INSERT INTO order_events
      (id, order_id, created_at, kind, field, old_value, new_value, actor, note)
    VALUES (
      ${newId("evt")}, ${orderId}, ${nowIso()}, ${e.kind},
      ${e.field ?? ""}, ${e.oldValue ?? ""}, ${e.newValue ?? ""},
      ${e.actor ?? "admin"}, ${e.note ?? ""}
    )`;
}

export async function listEvents(orderId: string): Promise<OrderEvent[]> {
  const rows = await sql()<Row[]>`
    SELECT * FROM order_events WHERE order_id = ${orderId}
     ORDER BY created_at ASC`;
  return rows.map(rowToEvent);
}

/* ------------------------------ čitanje ------------------------------ */

export async function getOrder(id: string): Promise<Order | null> {
  const rows = await sql()<Row[]>`
    SELECT * FROM orders WHERE id = ${id} AND deleted_at IS NULL LIMIT 1`;
  return rows[0] ? rowToOrder(rows[0]) : null;
}

export type OrderSort = "newest" | "oldest" | "highest" | "lowest";

export interface OrderFilters {
  search?: string;
  status?: OrderStatus | "ALL";
  /** Više statusa odjednom (npr. A2B izvoz: Nova + Potvrđena) — ako je zadano, ima prednost nad `status`. */
  statusIn?: OrderStatus[];
  from?: string;
  to?: string;
  product?: string;
  city?: string;
  unsyncedOnly?: boolean;
}

export interface ListOrdersOptions extends OrderFilters {
  sort?: OrderSort;
  page?: number;
  perPage?: number;
}

/** Sastavi WHERE dio — koristi ga i lista i export i statistika. */
function buildWhere(f: OrderFilters) {
  const db = sql();
  const parts = [db`deleted_at IS NULL`];

  if (f.statusIn && f.statusIn.length) parts.push(db`status IN ${db(f.statusIn)}`);
  else if (f.status && f.status !== "ALL") parts.push(db`status = ${f.status}`);
  if (f.from) parts.push(db`created_at >= ${f.from}`);
  if (f.to) parts.push(db`created_at <= ${f.to}`);
  if (f.product) parts.push(db`product_name = ${f.product}`);
  if (f.city) parts.push(db`lower(city) = ${f.city.toLowerCase()}`);
  if (f.unsyncedOnly) parts.push(db`sheet_synced = false`);

  const q = f.search?.trim();
  if (q) {
    const like = `%${q.toLowerCase()}%`;
    const digits = normalizePhone(q);
    // pretraga: broj narudžbe, ime, grad, adresa + telefon (normalizovan,
    // pa "061 123 456" i "+38761123456" nađu isti zapis)
    parts.push(
      digits
        ? db`(lower(order_number) LIKE ${like}
              OR lower(customer_name) LIKE ${like}
              OR lower(city) LIKE ${like}
              OR lower(address) LIKE ${like}
              OR phone_normalized LIKE ${"%" + digits + "%"})`
        : db`(lower(order_number) LIKE ${like}
              OR lower(customer_name) LIKE ${like}
              OR lower(city) LIKE ${like}
              OR lower(address) LIKE ${like})`
    );
  }

  return parts.reduce((a, b) => db`${a} AND ${b}`);
}

export interface ListOrdersResult {
  orders: Order[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}

export async function listOrders(
  opts: ListOrdersOptions = {}
): Promise<ListOrdersResult> {
  const db = sql();
  const where = buildWhere(opts);

  const perPage = [25, 50, 100].includes(Number(opts.perPage))
    ? Number(opts.perPage)
    : 25;
  const page = Math.max(1, Number(opts.page) || 1);
  const offset = (page - 1) * perPage;

  const order =
    opts.sort === "oldest"
      ? db`created_at ASC`
      : opts.sort === "highest"
        ? db`total_price DESC, created_at DESC`
        : opts.sort === "lowest"
          ? db`total_price ASC, created_at DESC`
          : db`created_at DESC`;

  const countRows = await db<Row[]>`
    SELECT COUNT(*) AS c FROM orders WHERE ${where}`;
  const total = n(countRows[0]?.c);

  const rows = await db<Row[]>`
    SELECT * FROM orders WHERE ${where}
     ORDER BY ${order}
     LIMIT ${perPage} OFFSET ${offset}`;

  return {
    orders: rows.map(rowToOrder),
    total,
    page,
    perPage,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/**
 * Sve narudžbe koje odgovaraju filteru — za CSV/A2B export (bez
 * paginacije). Redom kako su naručene (najstarija prva) — admin kod A2B
 * izvoza ide redom odozgo prema dolje (briše/kombinuje po potrebi), pa
 * mora biti hronološki, ne najnovije prvo kao na listi u adminu.
 */
export async function listOrdersForExport(
  f: OrderFilters,
  limit = 10000
): Promise<Order[]> {
  const db = sql();
  const rows = await db<Row[]>`
    SELECT * FROM orders WHERE ${buildWhere(f)}
     ORDER BY created_at ASC LIMIT ${limit}`;
  return rows.map(rowToOrder);
}

/**
 * Tačno izabrane narudžbe (po ID-u) — za ručno označen A2B izvoz.
 * Hronološki (najstarija prva), isto kao listOrdersForExport.
 */
export async function listOrdersByIds(ids: string[]): Promise<Order[]> {
  if (!ids.length) return [];
  const db = sql();
  const rows = await db<Row[]>`
    SELECT * FROM orders WHERE deleted_at IS NULL AND id IN ${db(ids)}
     ORDER BY created_at ASC`;
  return rows.map(rowToOrder);
}

/** Vrijednosti za dropdown filtere (proizvodi i gradovi koji stvarno postoje). */
export async function listFilterOptions(): Promise<{
  products: string[];
  cities: string[];
}> {
  const db = sql();
  // NAMJERNO sekvencijalno, ne Promise.all. Pool ima malo konekcija
  // (serverless), a uz veći broj paralelnih upita se dešavalo da jedan
  // upit ostane zaglavljen u redu i nikad ne dobije konekciju. Upiti su
  // pojedinačno ~50ms, pa sekvencijalno ne pravi razliku u brzini.
  const prods = await db<Row[]>`
    SELECT DISTINCT product_name AS v FROM orders
     WHERE deleted_at IS NULL AND product_name <> ''
     ORDER BY v`;
  const cities = await db<Row[]>`
    SELECT DISTINCT city AS v FROM orders
     WHERE deleted_at IS NULL AND city <> ''
     ORDER BY v`;
  return {
    products: prods.map((r) => s(r.v)),
    cities: cities.map((r) => s(r.v)),
  };
}

/* ------------------------------ izmjene ------------------------------ */

/**
 * Promjena statusa + zapis u audit log. Vraća null ako narudžba ne
 * postoji ili je status isti (nema šta logovati).
 */
export async function setStatus(
  id: string,
  status: OrderStatus,
  actor = "admin"
): Promise<Order | null> {
  const cur = await getOrder(id);
  if (!cur) return null;
  if (cur.status === status) return cur;

  const ts = nowIso();
  // shipped_at / delivered_at se popune prvi put kad status uđe u taj
  // stadij — kasnije promjene ih ne brišu (treba nam stvarni datum)
  const shippedAt =
    status === "SHIPPED" && !cur.shippedAt ? ts : cur.shippedAt;
  const deliveredAt =
    status === "DELIVERED" && !cur.deliveredAt ? ts : cur.deliveredAt;

  await sql()`
    UPDATE orders SET
      status = ${status},
      shipped_at = ${shippedAt},
      delivered_at = ${deliveredAt},
      updated_at = ${ts}
     WHERE id = ${id}`;

  await addEvent(id, {
    kind: "status",
    field: "status",
    oldValue: cur.status,
    newValue: status,
    actor,
  });

  return getOrder(id);
}

export async function setStatusBulk(
  ids: string[],
  status: OrderStatus,
  actor = "admin"
): Promise<number> {
  let changed = 0;
  for (const id of ids) {
    const res = await setStatus(id, status, actor);
    if (res && res.status === status) changed++;
  }
  return changed;
}

/**
 * Briše narudžbu (npr. greškom upisana/duplirana) — SOFT delete, isti
 * obrazac kao products.deleted_at. Čim je deleted_at postavljen, narudžba
 * nestaje iz liste, dashboarda, Zarade, liste za pakovanje i A2B izvoza
 * (svi upiti već filtriraju "deleted_at IS NULL"), ali ostaje u bazi za
 * slučaj da je greškom obrisana — vraćanje je moguće direktno u bazi.
 * NE briše red iz Google Sheeta (to je eksterni sistem, nema ovdje
 * referencu na konkretan red) — to po potrebi treba ručno obrisati tamo.
 */
export async function deleteOrder(
  id: string,
  actor = "admin"
): Promise<Order | null> {
  const cur = await getOrder(id);
  if (!cur) return null;

  await sql()`
    UPDATE orders SET deleted_at = ${nowIso()}, updated_at = ${nowIso()}
     WHERE id = ${id}`;

  await addEvent(id, {
    kind: "deleted",
    actor,
  });

  return cur;
}

export async function deleteOrderBulk(
  ids: string[],
  actor = "admin"
): Promise<number> {
  let changed = 0;
  for (const id of ids) {
    if (await deleteOrder(id, actor)) changed++;
  }
  return changed;
}

/**
 * Spaja više narudžbi ISTOG kupca u JEDNU — za slučaj kad je naručio
 * nekoliko puta posebno, a treba ići kao jedan paket. Shema ima "jedna
 * narudžba = jedan proizvod" (vidi schema.sql), pa prava narudžba sa
 * više stavki nije moguća — umjesto toga, NAJRANIJA od izabranih postaje
 * glavna (zadržava kupca/adresu/dostavu), njen "Proizvod" postaje spisak
 * svih stavki (npr. "1x Turpija, 2x Zvečke"), količina i vrijednost
 * proizvoda (subtotal) se saberu, a DOSTAVA SE NE SABIRA (jedan paket =
 * jedna dostava, uzima se dostava glavne narudžbe). Ostale narudžbe se
 * briše (deleteOrder) — nestaju iz liste/Zarade/pakovanja/A2B, uz trag u
 * audit logu da su spojene u glavnu, ne "otkazane" (da ne kvare stopu
 * otkazivanja u statistici).
 *
 * NAPOMENA: trošak (nabavna cijena) za spojeni red profit.ts računa po
 * imenu proizvoda — pošto "Proizvod" poslije spajanja više nije pravo
 * ime iz kataloga, taj jedan red će u Zaradi pokazati trošak 0 (ne
 * pogrešan, samo nepoznat) dok se ručno ne provjeri.
 */
export async function mergeOrders(
  ids: string[],
  actor = "admin"
): Promise<Order | null> {
  if (ids.length < 2) return null;
  const found = await Promise.all(ids.map((id) => getOrder(id)));
  const orders = found.filter((o): o is Order => o !== null);
  if (orders.length < 2) return null;

  orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const [primary, ...rest] = orders;

  const r2 = (v: number) => Math.round(v * 100) / 100;
  const items = orders.map((o) => `${o.quantity}x ${o.productName}`).join(", ");
  const subtotal = r2(orders.reduce((s, o) => s + o.subtotal, 0));
  const quantity = orders.reduce((s, o) => s + o.quantity, 0);
  const totalPrice = r2(subtotal + primary.shippingPrice);
  const mergedNote = [primary.note, `Spojeno u jedan paket: ${items}`]
    .filter(Boolean)
    .join(" — ");

  const ts = nowIso();
  await sql()`
    UPDATE orders SET
      product_name = ${items},
      quantity = ${quantity},
      subtotal = ${subtotal},
      total_price = ${totalPrice},
      note = ${mergedNote},
      updated_at = ${ts}
     WHERE id = ${primary.id}`;

  await addEvent(primary.id, {
    kind: "merged",
    note: `Spojene narudžbe: ${rest.map((o) => o.orderNumber).join(", ")}`,
    actor,
  });

  for (const o of rest) {
    await deleteOrder(o.id, actor);
    await addEvent(o.id, {
      kind: "merged_into",
      note: `Spojeno u ${primary.orderNumber}`,
      actor,
    });
  }

  return getOrder(primary.id);
}

/** Kurir / tracking broj — svaka izmjena ide u audit log. */
export async function setShipping(
  id: string,
  patch: { courier?: string; trackingNumber?: string },
  actor = "admin"
): Promise<Order | null> {
  const cur = await getOrder(id);
  if (!cur) return null;

  const courier = patch.courier !== undefined ? patch.courier : cur.courier;
  const tracking =
    patch.trackingNumber !== undefined ? patch.trackingNumber : cur.trackingNumber;

  await sql()`
    UPDATE orders SET courier = ${courier}, tracking_number = ${tracking},
      updated_at = ${nowIso()}
     WHERE id = ${id}`;

  if (courier !== cur.courier) {
    await addEvent(id, {
      kind: "field",
      field: "courier",
      oldValue: cur.courier,
      newValue: courier,
      actor,
    });
  }
  if (tracking !== cur.trackingNumber) {
    await addEvent(id, {
      kind: "field",
      field: "tracking_number",
      oldValue: cur.trackingNumber,
      newValue: tracking,
      actor,
    });
  }

  return getOrder(id);
}

/**
 * Podaci o kupcu (ime, telefon, adresa, grad) — za ispravku greške u
 * kucanju (npr. pogrešan broj telefona otkriven pri spajanju narudžbi).
 * Telefon se ponovo normalizuje (phone_normalized) da pretraga i
 * dedup i dalje rade sa ispravljenim brojem. Svaka promjena ide u audit
 * log, isti obrazac kao setShipping.
 */
export async function setCustomerInfo(
  id: string,
  patch: {
    customerName?: string;
    phone?: string;
    address?: string;
    city?: string;
  },
  actor = "admin"
): Promise<Order | null> {
  const cur = await getOrder(id);
  if (!cur) return null;

  const customerName = patch.customerName ?? cur.customerName;
  const phone = patch.phone ?? cur.phone;
  const address = patch.address ?? cur.address;
  const city = patch.city ?? cur.city;
  const phoneNormalized = normalizePhone(phone);

  await sql()`
    UPDATE orders SET
      customer_name = ${customerName},
      phone = ${phone},
      phone_normalized = ${phoneNormalized},
      address = ${address},
      city = ${city},
      updated_at = ${nowIso()}
     WHERE id = ${id}`;

  const changes: [string, string, string][] = [
    ["customer_name", cur.customerName, customerName],
    ["phone", cur.phone, phone],
    ["address", cur.address, address],
    ["city", cur.city, city],
  ];
  for (const [field, oldValue, newValue] of changes) {
    if (oldValue !== newValue) {
      await addEvent(id, { kind: "field", field, oldValue, newValue, actor });
    }
  }

  return getOrder(id);
}

/* ------------------------------ Sheets sync ------------------------------ */

export async function markSheetSynced(id: string) {
  const ts = nowIso();
  await sql()`
    UPDATE orders SET sheet_synced = true, sheet_synced_at = ${ts},
      sheet_error = '', sheet_attempts = sheet_attempts + 1,
      updated_at = ${ts}
     WHERE id = ${id}`;
  await addEvent(id, { kind: "sheet", newValue: "synced", actor: "sistem" });
}

export async function markSheetFailed(id: string, error: string) {
  await sql()`
    UPDATE orders SET sheet_synced = false, sheet_error = ${error.slice(0, 1000)},
      sheet_attempts = sheet_attempts + 1, updated_at = ${nowIso()}
     WHERE id = ${id}`;
  await addEvent(id, {
    kind: "sheet",
    newValue: "failed",
    note: error.slice(0, 500),
    actor: "sistem",
  });
}

export async function countUnsynced(): Promise<number> {
  const rows = await sql()<Row[]>`
    SELECT COUNT(*) AS c FROM orders
     WHERE deleted_at IS NULL AND sheet_synced = false`;
  return n(rows[0]?.c);
}

export async function listUnsynced(limit = 100): Promise<Order[]> {
  const rows = await sql()<Row[]>`
    SELECT * FROM orders
     WHERE deleted_at IS NULL AND sheet_synced = false
     ORDER BY created_at ASC LIMIT ${limit}`;
  return rows.map(rowToOrder);
}

/**
 * Narudžbe koje čekaju pakovanje — sve što još nije poslano (NOVA,
 * POTVRĐENA, PAKOVANJE), od najstarije ka najnovijoj. Koristi je stranica
 * za pakovanje (bez logina, za mamu) — namjerno samo minimum podataka.
 */
export interface PackingItem {
  orderNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  createdAt: string;
}

/**
 * `fromDate` (YYYY-MM-DD, Sarajevo kalendarski dan) je opciono — bira ga
 * onaj ko otvori link (obično admin, za sebe ili prije nego pošalje link
 * mami), da stara/već obrađena zaostala pošiljka ne zatrpava listu.
 * Izvor narudžbe (web, Messenger/"Narudžba van sajta"…) se NE filtrira —
 * sve što ima status za pakovanje ide na listu, bez obzira odakle stiglo.
 */
export async function listPackingQueue(fromDate?: string): Promise<PackingItem[]> {
  const db = sql();
  let where = db`deleted_at IS NULL AND status IN ('NEW', 'CONFIRMED', 'PACKING')`;
  if (fromDate) {
    where = db`${where} AND (created_at::timestamptz) AT TIME ZONE 'Europe/Sarajevo' >= ${fromDate}::date`;
  }
  const rows = await db<
    { order_number: string; customer_name: string; product_name: string; quantity: number; created_at: string }[]
  >`
    SELECT order_number, customer_name, product_name, quantity, created_at
      FROM orders
     WHERE ${where}
     ORDER BY created_at ASC`;
  return rows.map((r) => ({
    orderNumber: r.order_number,
    customerName: r.customer_name,
    productName: r.product_name,
    quantity: r.quantity,
    createdAt: r.created_at,
  }));
}

/* ------------------------------ anti-spam ------------------------------ */

/**
 * Koliko je narudžbi stiglo sa istog telefona / IP-a u zadnjih N minuta.
 * Rate limiting ide preko baze, ne preko memorije procesa — na Vercelu
 * svaki request može pasti na drugu instancu, pa in-memory brojač ne bi
 * ništa zaštitio.
 */
export async function recentOrderCount(
  phoneNormalized: string,
  clientIp: string,
  minutes = 10
): Promise<{ byPhone: number; byIp: number }> {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const db = sql();
  // sekvencijalno, iz istog razloga kao listFilterOptions
  const p = phoneNormalized
    ? await db<Row[]>`SELECT COUNT(*) AS c FROM orders
                       WHERE phone_normalized = ${phoneNormalized}
                         AND created_at >= ${since}`
    : ([{ c: 0 }] as Row[]);
  const i = clientIp
    ? await db<Row[]>`SELECT COUNT(*) AS c FROM orders
                       WHERE client_ip = ${clientIp} AND created_at >= ${since}`
    : ([{ c: 0 }] as Row[]);
  return { byPhone: n(p[0]?.c), byIp: n(i[0]?.c) };
}

/* --------------------------- ručni brojač prodaje --------------------------- */

export interface ManualSale {
  id: string;
  date: string;
  productName: string;
  quantity: number;
  note: string;
  createdAt: string;
}

function rowToManualSale(r: Row): ManualSale {
  return {
    id: s(r.id),
    date: s(r.date),
    productName: s(r.product_name),
    quantity: Math.round(n(r.quantity)),
    note: s(r.note),
    createdAt: s(r.created_at),
  };
}

export async function insertManualSale(input: {
  date: string;
  productName: string;
  quantity: number;
  note?: string;
}): Promise<ManualSale> {
  const rows = await sql()<Row[]>`
    INSERT INTO manual_sales (id, date, product_name, quantity, note, created_at)
    VALUES (${newId("msl")}, ${input.date}, ${input.productName}, ${input.quantity},
            ${input.note ?? ""}, ${nowIso()})
    RETURNING *`;
  return rowToManualSale(rows[0]);
}

export async function deleteManualSale(id: string): Promise<void> {
  await sql()`DELETE FROM manual_sales WHERE id = ${id}`;
}

export async function listManualSales(limit = 200): Promise<ManualSale[]> {
  const rows = await sql()<Row[]>`
    SELECT * FROM manual_sales ORDER BY date DESC, created_at DESC LIMIT ${limit}`;
  return rows.map(rowToManualSale);
}
