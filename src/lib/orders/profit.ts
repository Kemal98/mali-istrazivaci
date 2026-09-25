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
}

export interface ProfitSummary {
  rows: ProfitRow[];
  orders: number;
  quantity: number;
  revenue: number;
  cost: number;
  adSpend: number;
  profit: number;
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

  const rows = [...map.values()];
  if (unmappedRow.adSpend > 0) rows.push(unmappedRow);

  let orders = 0, quantity = 0, revenue = 0, cost = 0, adSpend = 0;
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
  };
}
