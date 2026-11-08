import { nowIso, parseJson, sql } from "@/lib/cms/db";
import { sanitizeHomeContent } from "./sanitize";
import { defaultHomeContent, type HomeContent } from "./types";

type Row = Record<string, unknown>;

/** Prvi put ikad pozvano — upiše default red. Idempotentno (ON CONFLICT DO NOTHING). */
async function ensureRow(): Promise<{ draft: string; published: string | null }> {
  const rows = await sql()<Row[]>`SELECT draft, published FROM home_content WHERE id = 'home'`;
  if (rows[0]) return { draft: String(rows[0].draft), published: rows[0].published ? String(rows[0].published) : null };

  const draft = JSON.stringify(defaultHomeContent());
  await sql()`
    INSERT INTO home_content (id, draft, published, updated_at)
    VALUES ('home', ${draft}, NULL, ${nowIso()})
    ON CONFLICT (id) DO NOTHING`;
  return { draft, published: null };
}

export async function getHomeDraft(): Promise<HomeContent> {
  const row = await ensureRow();
  return sanitizeHomeContent(parseJson<Partial<HomeContent>>(row.draft, {}));
}

/** Sprema SAMO nacrt. Nikad ne mijenja objavljenu verziju (vidi publishHome). */
export async function saveHomeDraft(patch: Partial<HomeContent>): Promise<HomeContent> {
  await ensureRow();
  const cur = await getHomeDraft();
  const merged = sanitizeHomeContent({ ...cur, ...patch });
  await sql()`
    UPDATE home_content SET draft = ${JSON.stringify(merged)}, updated_at = ${nowIso()}
     WHERE id = 'home'`;
  return merged;
}

/** Javna stranica čita SAMO ovo — null = nikad nije objavljeno (vidi page.tsx fallback). */
export async function getHomePublished(): Promise<HomeContent | null> {
  const rows = await sql()<Row[]>`SELECT published FROM home_content WHERE id = 'home'`;
  if (!rows[0]?.published) return null;
  return sanitizeHomeContent(parseJson<Partial<HomeContent>>(String(rows[0].published), {}));
}

/** Objavljuje nacrt — kopira draft u published snapshot (isti obrazac kao publishProduct). */
export async function publishHome(): Promise<{ ok: boolean; errors: string[] }> {
  const draft = await getHomeDraft();
  const errors: string[] = [];
  if (!draft.heroNaslov.trim()) errors.push("Dodajte naslov hero sekcije prije objave.");
  if (draft.kategorijeTiles.length !== 5) errors.push("Nedostaje jedna od 5 kategorija.");
  if (errors.length) return { ok: false, errors };

  await sql()`
    UPDATE home_content SET published = draft, published_at = ${nowIso()}
     WHERE id = 'home'`;
  return { ok: true, errors: [] };
}
