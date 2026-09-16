import { sql } from "@/lib/cms/db";

/**
 * Brojevi iz CMS-a (proizvodi / recenzije / media) — ovo je prikazivao
 * stari dashboard na /admin, pa ostaje i na novom, ispod analitike.
 *
 * Namjerno COUNT(*) u jednom upitu, a ne listReviews()/listMedia().length:
 * te funkcije dovuku SVE redove u memoriju samo da bi se izbrojali, što
 * bi s rastom biblioteke postajalo sve sporije bez ikakve potrebe.
 */
export async function shopStats() {
  const rows = await sql()<Record<string, unknown>[]>`
    SELECT
      (SELECT COUNT(*)::int FROM products WHERE deleted_at IS NULL) AS total,
      (SELECT COUNT(*)::int FROM products
        WHERE deleted_at IS NULL AND status = 'published') AS published,
      (SELECT COUNT(*)::int FROM products
        WHERE deleted_at IS NULL AND status = 'draft') AS draft,
      (SELECT COUNT(*)::int FROM reviews WHERE deleted_at IS NULL) AS reviews,
      (SELECT COUNT(*)::int FROM media WHERE deleted_at IS NULL) AS media`;

  const r = rows[0] ?? {};
  const n = (v: unknown) => Number(v ?? 0);
  return {
    total: n(r.total),
    published: n(r.published),
    draft: n(r.draft),
    reviews: n(r.reviews),
    media: n(r.media),
  };
}
