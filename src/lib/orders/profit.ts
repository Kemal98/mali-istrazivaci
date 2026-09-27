import { sql } from "@/lib/cms/db";
import { META_USD_TO_KM } from "@/lib/ads/currency";
import type { Period } from "./stats";

// "Kao da je sve prodano": računaju se SVE narudžbe iz perioda (bez obzira
// na status), prihod je vrijednost proizvoda bez dostave, a nabavna cijena
// je TRENUTNA nabavna cijena proizvoda (ne snimak s dana narudžbe), pa
// stare narudžbe bez snimka također imaju trošak.

type Row = Record<string, unknown>;
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const r2 = (v: number) => Math.round(v * 100) / 100;
const norm = (v: string) => v.trim().toLowerCase();

export interface ProfitRow {
  productName: string;
  orders: number;
  quantity: number;
  revenue: number;
  cost: number;
  adSpend: number;
  profit: number;
  missingCost: boolean;
  unmapped: boolean;
  /** Kupljeno komada (sve vrijeme) i koliko je to koštalo — iz "Nabavka robe". */
  purchasedQty: number;
  purchasedCost: number;
  /** kupljeno − prodano (sve vrijeme); null ako nema unesenih nabavki. */
  stock: number | null;
}

export interface ProfitSummary {
  rows: ProfitRow[];
  orders: number;
  quantity: number;
  revenue: number;
  cost: number;
  adSpend: number;
  profit: number;
  /** Ukupno uloženo u kupljenu robu (sve vrijeme). */
  purchasedCost: number;
}

export async function profitAsIfSold(
  p: Period,
  fromDate: string,
  toDate: string
): Promise<ProfitSummary> {
  const db = sql();

  let w = db`o.deleted_at IS NULL AND o.product_name <> ''`;
  if (p.from) w = db`${w} AND o.created_at >= ${p.from}`;
  if (p.to) w = db`${w} AND o.created_at <= ${p.to}`;

  const orderRows = await db<Row[]>`
    SELECT COALESCE(pr.naziv, o.product_name) AS name,
           COUNT(*) AS orders,
           COALESCE(SUM(o.quantity), 0) AS qty,
           COALESCE(SUM(o.subtotal), 0) AS revenue,
           COALESCE(SUM(o.quantity * pr.nabavna_cijena), 0) AS cost,
           BOOL_OR(pr.nabavna_cijena IS NULL) AS missing
      FROM orders o
      LEFT JOIN products pr
        ON pr.deleted_at IS NULL
       AND (pr.id = o.product_id
            OR (o.product_id IS NULL AND lower(trim(pr.naziv)) = lower(trim(o.product_name))))
     WHERE ${w}
     GROUP BY 1`;

  const spendRows = await db<Row[]>`
    SELECT product_name,
           COALESCE(SUM(CASE WHEN source = 'meta' THEN amount * ${META_USD_TO_KM} ELSE amount END), 0) AS total
      FROM ad_spend
     WHERE date >= ${fromDate} AND date <= ${toDate}
     GROUP BY 1`;

  // Nabavke (sve vrijeme) i ukupno prodano komada (sve vrijeme) po proizvodu
  const purchaseRows = await db<Row[]>`
    SELECT product_name, SUM(quantity) AS qty, SUM(total_cost) AS cost
      FROM stock_purchases GROUP BY 1`;
  const soldAllRows = await db<Row[]>`
    SELECT COALESCE(pr.naziv, o.product_name) AS name, COALESCE(SUM(o.quantity), 0) AS qty
      FROM orders o
      LEFT JOIN products pr
        ON pr.deleted_at IS NULL
       AND (pr.id = o.product_id
            OR (o.product_id IS NULL AND lower(trim(pr.naziv)) = lower(trim(o.product_name))))
     WHERE o.deleted_at IS NULL AND o.product_name <> ''
     GROUP BY 1`;
  const purchased = new Map<string, { qty: number; cost: number }>();
  for (const r of purchaseRows) {
    purchased.set(norm(String(r.product_name)), { qty: n(r.qty), cost: n(r.cost) });
  }
  const soldAll = new Map<string, number>();
  for (const r of soldAllRows) soldAll.set(norm(String(r.name)), n(r.qty));

  const map = new Map<string, ProfitRow>();
  const blank = (name: string, unmapped = false): ProfitRow => ({
    productName: name.trim(),
    orders: 0,
    quantity: 0,
    revenue: 0,
    cost: 0,
    adSpend: 0,
    profit: 0,
    missingCost: false,
    unmapped,
    purchasedQty: 0,
    purchasedCost: 0,
    stock: null,
  });

  for (const r of orderRows) {
    const name = String(r.name);
    const row = map.get(norm(name)) ?? blank(name);
    row.orders += n(r.orders);
    row.quantity += n(r.qty);
    row.revenue += n(r.revenue);
    row.cost += n(r.cost);
    row.missingCost = row.missingCost || Boolean(r.missing);
    map.set(norm(name), row);
  }

  const unmappedRow = blank("Reklame bez proizvoda (nemapirane kampanje)", true);
  for (const r of spendRows) {
    const name = String(r.product_name);
    const total = n(r.total);
    if (name.startsWith("Nemapirano:") || name === "") {
      unmappedRow.adSpend += total;
      continue;
    }
    const row = map.get(norm(name)) ?? blank(name);
    row.adSpend += total;
    map.set(norm(name), row);
  }

  // Proizvodi s nabavkom a bez narudžbi/reklama u periodu također dobiju red
  for (const [key, pu] of purchased) {
    if (!map.has(key)) {
      const nameRow = purchaseRows.find((r) => norm(String(r.product_name)) === key);
      map.set(key, blank(String(nameRow?.product_name ?? key)));
      void pu;
    }
  }

  for (const [key, row] of map) {
    const pu = purchased.get(key);
    if (!pu || pu.qty <= 0) continue;
    // Ima unesenih nabavki: stvarna prosječna cijena po komadu (plaćeno / kupljeno)
    row.cost = row.quantity * (pu.cost / pu.qty);
    row.missingCost = false;
    row.purchasedQty = pu.qty;
    row.purchasedCost = pu.cost;
    row.stock = pu.qty - (soldAll.get(key) ?? 0);
  }

  const rows = [...map.values()];
  if (unmappedRow.adSpend > 0) rows.push(unmappedRow);

  let orders = 0, quantity = 0, revenue = 0, cost = 0, adSpend = 0, purchasedCost = 0;
  for (const row of rows) {
    row.revenue = r2(row.revenue);
    row.cost = r2(row.cost);
    row.adSpend = r2(row.adSpend);
    row.profit = r2(row.revenue - row.cost - row.adSpend);
    orders += row.orders;
    quantity += row.quantity;
    revenue += row.revenue;
    cost += row.cost;
    adSpend += row.adSpend;
    purchasedCost += row.purchasedCost;
  }
  rows.sort((a, b) => b.revenue - a.revenue || b.adSpend - a.adSpend);

  return {
    rows,
    orders,
    quantity,
    revenue: r2(revenue),
    cost: r2(cost),
    adSpend: r2(adSpend),
    profit: r2(revenue - cost - adSpend),
    purchasedCost: r2(purchasedCost),
  };
}

/* ------------------------------ zarada po danima ------------------------------ */

export interface DayProfit {
  day: string; // YYYY-MM-DD (Europe/Sarajevo)
  orders: number;
  revenue: number;
  cost: number;
  adSpend: number;
  profit: number;
}

/**
 * Isti račun kao profitAsIfSold, ali razbijen po danu — da admin može
 * provjeriti "danas" ili bilo koji pojedinačni dan, ne samo zbir perioda.
 * Trošak po komadu je isti kao gore: stvarna prosječna nabavna cijena
 * (Nabavka robe) ako postoji, inače cijena iz proizvoda.
 */
export async function profitByDay(fromDate: string, toDate: string): Promise<DayProfit[]> {
  const db = sql();

  const purchaseRows = await db<Row[]>`
    SELECT product_name, SUM(quantity) AS qty, SUM(total_cost) AS cost
      FROM stock_purchases GROUP BY 1`;
  const avgCost = new Map<string, number>();
  for (const r of purchaseRows) {
    const qty = n(r.qty);
    if (qty > 0) avgCost.set(norm(String(r.product_name)), n(r.cost) / qty);
  }

  const orderRows = await db<Row[]>`
    SELECT to_char((o.created_at::timestamptz) AT TIME ZONE 'Europe/Sarajevo', 'YYYY-MM-DD') AS day,
           COALESCE(pr.naziv, o.product_name) AS name,
           COUNT(*) AS orders,
           COALESCE(SUM(o.quantity), 0) AS qty,
           COALESCE(SUM(o.subtotal), 0) AS revenue,
           COALESCE(SUM(o.quantity * pr.nabavna_cijena), 0) AS cost_default
      FROM orders o
      LEFT JOIN products pr
        ON pr.deleted_at IS NULL
       AND (pr.id = o.product_id
            OR (o.product_id IS NULL AND lower(trim(pr.naziv)) = lower(trim(o.product_name))))
     WHERE o.deleted_at IS NULL AND o.product_name <> ''
       AND (o.created_at::timestamptz) AT TIME ZONE 'Europe/Sarajevo' >= ${fromDate}::date
       AND (o.created_at::timestamptz) AT TIME ZONE 'Europe/Sarajevo' < (${toDate}::date + 1)
     GROUP BY 1, 2`;

  const spendRows = await db<Row[]>`
    SELECT date,
           COALESCE(SUM(CASE WHEN source = 'meta' THEN amount * ${META_USD_TO_KM} ELSE amount END), 0) AS total
      FROM ad_spend WHERE date >= ${fromDate} AND date <= ${toDate}
     GROUP BY 1`;

  const map = new Map<string, DayProfit>();
  const get = (day: string) => {
    let row = map.get(day);
    if (!row) {
      row = { day, orders: 0, revenue: 0, cost: 0, adSpend: 0, profit: 0 };
      map.set(day, row);
    }
    return row;
  };

  for (const r of orderRows) {
    const day = String(r.day);
    const qty = n(r.qty);
    const perUnit = avgCost.get(norm(String(r.name)));
    const cost = perUnit !== undefined ? perUnit * qty : n(r.cost_default);
    const row = get(day);
    row.orders += n(r.orders);
    row.revenue += n(r.revenue);
    row.cost += cost;
  }
  for (const r of spendRows) {
    get(String(r.date)).adSpend += n(r.total);
  }

  const rows = [...map.values()].map((r) => ({
    ...r,
    revenue: r2(r.revenue),
    cost: r2(r.cost),
    adSpend: r2(r.adSpend),
    profit: r2(r.revenue - r.cost - r.adSpend),
  }));
  rows.sort((a, b) => b.day.localeCompare(a.day));
  return rows;
}
