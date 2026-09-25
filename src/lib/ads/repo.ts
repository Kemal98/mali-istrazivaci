import { newId, nowIso, sql } from "@/lib/cms/db";
import type { AdSpend, CampaignMapping } from "./types";
import { META_USD_TO_KM, adAmountKm } from "./currency";

type Row = Record<string, unknown>;
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

function rowToAdSpend(r: Row): AdSpend {
  return {
    id: s(r.id),
    date: s(r.date),
    productName: s(r.product_name),
    amount: Math.round(adAmountKm(n(r.amount), s(r.source)) * 100) / 100,
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
    SELECT product_name,
           COALESCE(SUM(CASE WHEN source = 'meta' THEN amount * ${META_USD_TO_KM} ELSE amount END), 0) AS total
      FROM ad_spend WHERE ${w}
     GROUP BY product_name`;
  const out: Record<string, number> = {};
  for (const r of rows) out[r.product_name] = Math.round(n(r.total) * 100) / 100;
  return out;
}

/**
 * Upiši/ažuriraj JEDAN dan potrošnje za JEDNU Meta kampanju. Id je
 * deterministički (izveden iz kampanje + datuma), pa je ponovni sync
 * istog dana bezopasan UPDATE, ne novi red — bitno jer se sync može
 * pozvati ručno više puta (dugme u adminu) ili dnevno preko croma.
 */
export async function upsertMetaAdSpend(input: {
  date: string;
  campaignId: string;
  productName: string;
  amount: number;
  note?: string;
}): Promise<AdSpend> {
  const id = `ads_meta_${input.campaignId}_${input.date}`;
  const rows = await sql()<Row[]>`
    INSERT INTO ad_spend (id, date, product_name, amount, note, source, created_at)
    VALUES (${id}, ${input.date}, ${input.productName}, ${input.amount},
            ${input.note ?? ""}, 'meta', ${nowIso()})
    ON CONFLICT (id) DO UPDATE SET
      product_name = EXCLUDED.product_name,
      amount = EXCLUDED.amount,
      note = EXCLUDED.note
    RETURNING *`;
  return rowToAdSpend(rows[0]);
}

/* ------------------------------ mapiranje kampanja ------------------------------ */

function rowToMapping(r: Row): CampaignMapping {
  return {
    campaignId: s(r.campaign_id),
    campaignName: s(r.campaign_name),
    productName: s(r.product_name),
    updatedAt: s(r.updated_at),
  };
}

export async function listCampaignMap(): Promise<CampaignMapping[]> {
  const rows = await sql()<Row[]>`
    SELECT * FROM ad_campaign_map ORDER BY campaign_name`;
  return rows.map(rowToMapping);
}

/** Upiši listu kampanja iz Meta API-ja — čuva postojeće mapiranje, dodaje nove. */
export async function upsertCampaignNames(
  campaigns: { id: string; name: string }[]
): Promise<void> {
  for (const c of campaigns) {
    await sql()`
      INSERT INTO ad_campaign_map (campaign_id, campaign_name, product_name, updated_at)
      VALUES (${c.id}, ${c.name}, '', ${nowIso()})
      ON CONFLICT (campaign_id) DO UPDATE SET campaign_name = EXCLUDED.campaign_name`;
  }
}

export async function setCampaignProduct(
  campaignId: string,
  productName: string
): Promise<void> {
  await sql()`
    UPDATE ad_campaign_map SET product_name = ${productName}, updated_at = ${nowIso()}
     WHERE campaign_id = ${campaignId}`;
}
