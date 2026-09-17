import { newId, nowIso, sql } from "@/lib/cms/db";
import type { AdSpend } from "./types";

type Row = Record<string, unknown>;
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

function rowToAdSpend(r: Row): AdSpend {
  return {
    id: s(r.id),
    date: s(r.date),
    productName: s(r.product_name),
    amount: Math.round(n(r.amount) * 100) / 100,
    note: s(r.note),
    source: r.source === "meta" ? "meta" : "manual",
    createdAt: s(r.created_at),
  };
}

export interface InsertAdSpendInput {
  date: string;
  productName: string;
  amount: number;
  note?: string;
  source?: "manual" | "meta";
}

export async function insertAdSpend(input: InsertAdSpendInput): Promise<AdSpend> {
  const id = newId("ads");
  const rows = await sql()<Row[]>`
    INSERT INTO ad_spend (id, date, product_name, amount, note, source, created_at)
    VALUES (${id}, ${input.date}, ${input.productName}, ${input.amount},
            ${input.note ?? ""}, ${input.source ?? "manual"}, ${nowIso()})
    RETURNING *`;
  return rowToAdSpend(rows[0]);
}

export async function deleteAdSpend(id: string): Promise<void> {
  await sql()`DELETE FROM ad_spend WHERE id = ${id}`;
}

/** Zadnjih N unosa, najnoviji prvo — za pregled/uređivanje u adminu. */
export async function listAdSpend(limit = 200): Promise<AdSpend[]> {
  const rows = await sql()<Row[]>`
    SELECT * FROM ad_spend ORDER BY date DESC, created_at DESC LIMIT ${limit}`;
  return rows.map(rowToAdSpend);
}

/**
 * Ukupan trošak po proizvodu za period — koristi ga dashboard da spoji
 * sa topProducts() (prihod/nabavna cijena) u jednu profit tabelu.
 * `from`/`to` su YYYY-MM-DD (kalendarski dani), ne ISO timestamp.
 */
export async function sumAdSpendByProduct(
  from?: string,
  to?: string
): Promise<Record<string, number>> {
  const db = sql();
  let w = db`1=1`;
  if (from) w = db`${w} AND date >= ${from}`;
  if (to) w = db`${w} AND date <= ${to}`;
  const rows = await db<{ product_name: string; total: number }[]>`
    SELECT product_name, COALESCE(SUM(amount), 0) AS total
      FROM ad_spend WHERE ${w}
     GROUP BY product_name`;
  const out: Record<string, number> = {};
  for (const r of rows) out[r.product_name] = Math.round(n(r.total) * 100) / 100;
  return out;
}
