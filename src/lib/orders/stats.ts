import { sql } from "@/lib/cms/db";
import type { OrderStatus } from "./types";

/**
 * Sva statistika se računa AGREGATNIM SQL UPITIMA, nikad u browseru.
 * Ni jedan od ovih upita ne dovlači redove narudžbi — samo brojeve — pa
 * dashboard radi isto brzo i sa 10 i sa 100.000 narudžbi.
 *
 * Upiti idu SEKVENCIJALNO (ne Promise.all): pool ima malo konekcija, a
 * previše paralelnih upita je ostavljalo jedan trajno zaglavljen u redu.
 */

type Row = Record<string, unknown>;
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** Zaokruži na 2 decimale (novac). */
const money = (v: unknown) => Math.round(n(v) * 100) / 100;

export interface Period {
  from?: string;
  to?: string;
}

/** WHERE za period — koristi ga svaki upit ispod. */
function within(p: Period) {
  const db = sql();
  let w = db`deleted_at IS NULL`;
  if (p.from) w = db`${w} AND created_at >= ${p.from}`;
  if (p.to) w = db`${w} AND created_at <= ${p.to}`;
  return w;
}

/**
 * Kanal (facebook / instagram / google / direct / other) se izvodi u SQL-u
 * da grupisanje ostane na bazi. Logika prati channelOf() iz attribution.ts:
 * prvo UTM source, pa referrer ako UTM-a nema.
 */
const CHANNEL_SQL = () => sql()`
  CASE
    WHEN utm_source ILIKE '%facebook%' OR utm_source ILIKE '%meta%'
      OR lower(utm_source) IN ('fb','fbads') THEN 'facebook'
    WHEN utm_source ILIKE '%instagram%' OR lower(utm_source) = 'ig'
      THEN 'instagram'
    WHEN utm_source ILIKE '%google%' OR utm_source ILIKE '%adwords%'
      THEN 'google'
    WHEN utm_source ILIKE '%tiktok%' THEN 'tiktok'
    WHEN utm_source <> '' THEN lower(utm_source)
    WHEN referrer ILIKE '%facebook%' THEN 'facebook'
    WHEN referrer ILIKE '%instagram%' THEN 'instagram'
    WHEN referrer ILIKE '%google%' THEN 'google'
    WHEN referrer ILIKE '%tiktok%' THEN 'tiktok'
    WHEN referrer = '' THEN 'direct'
    ELSE 'other'
  END`;

/* ------------------------------ glavni KPI ------------------------------ */

export interface Kpi {
  orders: number;
  /** Bruto vrijednost svih narudžbi (proizvod + dostava). */
  gross: number;
  /** Bruto samo proizvodi, bez dostave. */
  productGross: number;
  shipping: number;
  /** Prosječna vrijednost narudžbe. */
  avg: number;
  /** Realizovan promet — SAMO dostavljene narudžbe. */
  realized: number;
  realizedProduct: number;
  countNew: number;
  confirmed: number;
  packing: number;
  shipped: number;
  delivered: number;
  returned: number;
  cancelled: number;
  /** DELIVERED / (DELIVERED + RETURNED) × 100 */
  deliveryRate: number;
  /** RETURNED / (DELIVERED + RETURNED) × 100 */
  returnRate: number;
  /** CANCELLED / ukupno × 100 */
  cancellationRate: number;
}

export async function kpi(p: Period = {}): Promise<Kpi> {
  const db = sql();
  const rows = await db<Row[]>`
    SELECT
      COUNT(*)::int AS orders,
      COALESCE(SUM(total_price), 0) AS gross,
      COALESCE(SUM(subtotal), 0) AS product_gross,
      COALESCE(SUM(shipping_price), 0) AS shipping,
      COALESCE(SUM(total_price) FILTER (WHERE status = 'DELIVERED'), 0) AS realized,
      COALESCE(SUM(subtotal) FILTER (WHERE status = 'DELIVERED'), 0) AS realized_product,
      COUNT(*) FILTER (WHERE status = 'NEW')::int       AS c_new,
      COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int AS c_confirmed,
      COUNT(*) FILTER (WHERE status = 'PACKING')::int   AS c_packing,
      COUNT(*) FILTER (WHERE status = 'SHIPPED')::int   AS c_shipped,
      COUNT(*) FILTER (WHERE status = 'DELIVERED')::int AS c_delivered,
      COUNT(*) FILTER (WHERE status = 'RETURNED')::int  AS c_returned,
      COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS c_cancelled
     FROM orders WHERE ${within(p)}`;

  const r = rows[0] ?? {};
  const orders = n(r.orders);
  const delivered = n(r.c_delivered);
  const returned = n(r.c_returned);
  const cancelled = n(r.c_cancelled);
  const closed = delivered + returned;

  return {
    orders,
    gross: money(r.gross),
    productGross: money(r.product_gross),
    shipping: money(r.shipping),
    avg: orders ? money(n(r.gross) / orders) : 0,
    realized: money(r.realized),
    realizedProduct: money(r.realized_product),
    countNew: n(r.c_new),
    confirmed: n(r.c_confirmed),
    packing: n(r.c_packing),
    shipped: n(r.c_shipped),
    delivered,
    returned,
    cancelled,
    // Namjerno se računa samo na ZATVORENIM narudžbama (dostavljene +
    // vraćene). Da je imenilac ukupan broj, svaka nova narudžba bi
    // obarala procenat dok je još u obradi, što ne bi ništa značilo.
    deliveryRate: closed ? Math.round((delivered / closed) * 1000) / 10 : 0,
    returnRate: closed ? Math.round((returned / closed) * 1000) / 10 : 0,
    cancellationRate: orders
      ? Math.round((cancelled / orders) * 1000) / 10
      : 0,
  };
}

/* ------------------------------ grafikon ------------------------------ */

export interface DayPoint {
  day: string; // YYYY-MM-DD (lokalni dan, Europe/Sarajevo)
  orders: number;
  gross: number;
  realized: number;
}

/**
 * Narudžbe i promet po danima. Dan se računa u lokalnoj zoni, ne UTC —
 * inače bi narudžbe od 01:00 ujutro padale u prethodni dan.
 */
export async function dailySeries(p: Period): Promise<DayPoint[]> {
  const db = sql();
  const rows = await db<Row[]>`
    SELECT
      to_char((created_at::timestamptz) AT TIME ZONE 'Europe/Sarajevo',
              'YYYY-MM-DD') AS day,
      COUNT(*)::int AS orders,
      COALESCE(SUM(total_price), 0) AS gross,
      COALESCE(SUM(total_price) FILTER (WHERE status = 'DELIVERED'), 0) AS realized
     FROM orders WHERE ${within(p)}
     GROUP BY 1 ORDER BY 1`;

  return rows.map((r) => ({
    day: s(r.day),
    orders: n(r.orders),
    gross: money(r.gross),
    realized: money(r.realized),
  }));
}

/** Dopuni dane bez narudžbi nulama, da grafikon nema praznine. */
export function fillDays(points: DayPoint[], from: Date, to: Date): DayPoint[] {
  const byDay = new Map(points.map((p) => [p.day, p]));
  const out: DayPoint[] = [];
  const cur = new Date(from);
  cur.setHours(12, 0, 0, 0); // podne, da DST skok ne preskoči dan
  const end = new Date(to);
  end.setHours(12, 0, 0, 0);

  while (cur <= end) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
    out.push(byDay.get(key) ?? { day: key, orders: 0, gross: 0, realized: 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/* ------------------------------ proizvodi ------------------------------ */

export interface ProductStat {
  productName: string;
  orders: number;
  quantity: number;
  gross: number;
  delivered: number;
  returned: number;
  cancelled: number;
  realized: number;
  deliveryRate: number;
}

export async function topProducts(
  p: Period,
  limit = 20
): Promise<ProductStat[]> {
  const db = sql();
  const rows = await db<Row[]>`
    SELECT
      product_name,
      COUNT(*)::int AS orders,
      COALESCE(SUM(quantity), 0)::int AS qty,
      COALESCE(SUM(total_price), 0) AS gross,
      COUNT(*) FILTER (WHERE status = 'DELIVERED')::int AS delivered,
      COUNT(*) FILTER (WHERE status = 'RETURNED')::int  AS returned,
      COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled,
      COALESCE(SUM(total_price) FILTER (WHERE status = 'DELIVERED'), 0) AS realized
     FROM orders WHERE ${within(p)} AND product_name <> ''
     GROUP BY product_name
     ORDER BY gross DESC, orders DESC
     LIMIT ${limit}`;

  return rows.map((r) => {
    const delivered = n(r.delivered);
    const returned = n(r.returned);
    const closed = delivered + returned;
    return {
      productName: s(r.product_name),
      orders: n(r.orders),
      quantity: n(r.qty),
      gross: money(r.gross),
      delivered,
      returned,
      cancelled: n(r.cancelled),
      realized: money(r.realized),
      deliveryRate: closed ? Math.round((delivered / closed) * 1000) / 10 : 0,
    };
  });
}

/* ------------------------------ gradovi ------------------------------ */

export interface CityStat {
  city: string;
  orders: number;
  gross: number;
  delivered: number;
  returned: number;
}

export async function topCities(p: Period, limit = 15): Promise<CityStat[]> {
  const db = sql();
  const rows = await db<Row[]>`
    SELECT
      initcap(trim(city)) AS city,
      COUNT(*)::int AS orders,
      COALESCE(SUM(total_price), 0) AS gross,
      COUNT(*) FILTER (WHERE status = 'DELIVERED')::int AS delivered,
      COUNT(*) FILTER (WHERE status = 'RETURNED')::int  AS returned
     FROM orders WHERE ${within(p)} AND trim(city) <> ''
     GROUP BY initcap(trim(city))
     ORDER BY orders DESC, gross DESC
     LIMIT ${limit}`;

  return rows.map((r) => ({
    city: s(r.city),
    orders: n(r.orders),
    gross: money(r.gross),
    delivered: n(r.delivered),
    returned: n(r.returned),
  }));
}

/* ------------------------------ marketing ------------------------------ */

export interface SourceStat {
  channel: string;
  orders: number;
  gross: number;
  realized: number;
  delivered: number;
  returned: number;
  deliveryRate: number;
}

export async function bySource(p: Period): Promise<SourceStat[]> {
  const db = sql();
  const rows = await db<Row[]>`
    SELECT
      ${CHANNEL_SQL()} AS channel,
      COUNT(*)::int AS orders,
      COALESCE(SUM(total_price), 0) AS gross,
      COALESCE(SUM(total_price) FILTER (WHERE status = 'DELIVERED'), 0) AS realized,
      COUNT(*) FILTER (WHERE status = 'DELIVERED')::int AS delivered,
      COUNT(*) FILTER (WHERE status = 'RETURNED')::int  AS returned
     FROM orders WHERE ${within(p)}
     GROUP BY 1
     ORDER BY orders DESC`;

  return rows.map((r) => {
    const delivered = n(r.delivered);
    const returned = n(r.returned);
    const closed = delivered + returned;
    return {
      channel: s(r.channel),
      orders: n(r.orders),
      gross: money(r.gross),
      realized: money(r.realized),
      delivered,
      returned,
      deliveryRate: closed ? Math.round((delivered / closed) * 1000) / 10 : 0,
    };
  });
}

export interface CampaignStat {
  campaign: string;
  content: string;
  orders: number;
  gross: number;
  realized: number;
  returned: number;
}

/**
 * Kampanja + oglas (utm_campaign / utm_content). Priprema za kasnije
 * poređenje sa Meta Ads brojevima — podaci se čuvaju već sada, Meta API
 * se može dodati kad zatreba.
 */
export async function byCampaign(
  p: Period,
  limit = 30
): Promise<CampaignStat[]> {
  const db = sql();
  const rows = await db<Row[]>`
    SELECT
      utm_campaign AS campaign,
      utm_content  AS content,
      COUNT(*)::int AS orders,
      COALESCE(SUM(total_price), 0) AS gross,
      COALESCE(SUM(total_price) FILTER (WHERE status = 'DELIVERED'), 0) AS realized,
      COUNT(*) FILTER (WHERE status = 'RETURNED')::int AS returned
     FROM orders
     WHERE ${within(p)} AND (utm_campaign <> '' OR utm_content <> '')
     GROUP BY utm_campaign, utm_content
     ORDER BY gross DESC, orders DESC
     LIMIT ${limit}`;

  return rows.map((r) => ({
    campaign: s(r.campaign) || "(bez kampanje)",
    content: s(r.content) || "—",
    orders: n(r.orders),
    gross: money(r.gross),
    realized: money(r.realized),
    returned: n(r.returned),
  }));
}

/* ------------------------------ statusi ------------------------------ */

export interface StatusStat {
  status: OrderStatus;
  orders: number;
  gross: number;
}

export async function byStatus(p: Period): Promise<StatusStat[]> {
  const db = sql();
  const rows = await db<Row[]>`
    SELECT status, COUNT(*)::int AS orders,
           COALESCE(SUM(total_price), 0) AS gross
     FROM orders WHERE ${within(p)}
     GROUP BY status`;
  return rows.map((r) => ({
    status: s(r.status) as OrderStatus,
    orders: n(r.orders),
    gross: money(r.gross),
  }));
}
