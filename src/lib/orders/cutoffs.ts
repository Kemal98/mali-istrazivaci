import "server-only";
import { newId, nowIso, sql } from "@/lib/cms/db";

/**
 * "Presjek" — admin označi dan od kojeg zarada/statistika na Dashboardu
 * kreće "ispočetka" (zadani period postaje "od zadnjeg presjeka", vidi
 * resolvePeriod u dashboard/page.tsx). Narudžbe, kupci i sve ostalo
 * OSTAJU netaknuti — ovo je samo oznaka na vremenskoj liniji, stariji
 * period je i dalje dostupan preko drugih filtera (90 dana, datum od-do),
 * a istorija presjeka (i zarada zatvorena svakim od njih) je na
 * /admin/presjeci.
 */
export interface Cutoff {
  id: string;
  date: string; // YYYY-MM-DD, kalendarski dan (Europe/Sarajevo)
  note: string;
  createdAt: string;
}

type Row = Record<string, unknown>;
const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

function rowToCutoff(r: Row): Cutoff {
  return { id: s(r.id), date: s(r.date), note: s(r.note), createdAt: s(r.created_at) };
}

/** Svi presjeci, najnoviji prvi. */
export async function listCutoffs(): Promise<Cutoff[]> {
  const rows = await sql()<Row[]>`
    SELECT * FROM business_cutoffs ORDER BY date DESC, created_at DESC`;
  return rows.map(rowToCutoff);
}

/** Datum najnovijeg presjeka — Dashboard ga koristi kao zadani početak perioda. */
export async function latestCutoffDate(): Promise<string | null> {
  const rows = await sql()<Row[]>`
    SELECT date FROM business_cutoffs ORDER BY date DESC, created_at DESC LIMIT 1`;
  return rows[0] ? s(rows[0].date) : null;
}

export async function insertCutoff(date: string, note: string): Promise<Cutoff> {
  const rows = await sql()<Row[]>`
    INSERT INTO business_cutoffs (id, date, note, created_at)
    VALUES (${newId("cut")}, ${date}, ${note}, ${nowIso()})
    RETURNING *`;
  return rowToCutoff(rows[0]);
}

export async function deleteCutoff(id: string): Promise<void> {
  await sql()`DELETE FROM business_cutoffs WHERE id = ${id}`;
}
