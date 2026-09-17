import { newId, nowIso, parseJson, sql } from "./db";
import {
  Block,
  GlobalSettings,
  Hero,
  Media,
  Product,
  ProductStatus,
  PublishedData,
  Review,
  Seo,
  Template,
  defaultHero,
} from "./types";
import { slugify, uniqueSlug } from "./slug";

// Sve funkcije su async jer Postgres driver je async (SQLite je bio sinhron).
// Pozivaoci (API rute i server komponente) rade `await`.

/* ---------------------------------- red -> objekt ---------------------------------- */

type Row = Record<string, unknown>;

function rowToProduct(r: Row): Product {
  return {
    id: String(r.id),
    naziv: String(r.naziv ?? ""),
    slug: String(r.slug ?? ""),
    sku: String(r.sku ?? ""),
    kategorija: String(r.kategorija ?? ""),
    status: (String(r.status) === "published" ? "published" : "draft") as ProductStatus,
    cijena: r.cijena === null || r.cijena === undefined ? null : Number(r.cijena),
    staraCijena:
      r.stara_cijena === null || r.stara_cijena === undefined
        ? null
        : Number(r.stara_cijena),
    nabavnaCijena:
      r.nabavna_cijena === null || r.nabavna_cijena === undefined
        ? null
        : Number(r.nabavna_cijena),
    badge: String(r.badge ?? ""),
    hero: { ...defaultHero(), ...parseJson<Partial<Hero>>(r.hero as string, {}) },
    seo: parseJson<Seo>(r.seo as string, {}),
    sections: parseJson<Block[]>(r.sections as string, []),
    publishedHero: r.published_hero
      ? { ...defaultHero(), ...parseJson<Partial<Hero>>(r.published_hero as string, {}) }
      : null,
    publishedSections: r.published_sections
      ? parseJson<Block[]>(r.published_sections as string, [])
      : null,
    publishedData: r.published_data
      ? parseJson<PublishedData | null>(r.published_data as string, null)
      : null,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
    publishedAt: r.published_at ? String(r.published_at) : null,
  };
}

function rowToReview(r: Row): Review {
  return {
    id: String(r.id),
    productId: r.product_id ? String(r.product_id) : null,
    ime: String(r.ime ?? ""),
    inicijal: String(r.inicijal ?? ""),
    rating: Number(r.rating ?? 5),
    tekst: String(r.tekst ?? ""),
    verified: Boolean(r.verified),
    slika: String(r.slika ?? ""),
    datum: String(r.datum ?? ""),
    status: String(r.status) === "hidden" ? "hidden" : "published",
    sortOrder: Number(r.sort_order ?? 0),
  };
}

function rowToMedia(r: Row): Media {
  return {
    id: String(r.id),
    filename: String(r.filename),
    url: String(r.url),
    alt: String(r.alt ?? ""),
    mime: String(r.mime ?? ""),
    size: Number(r.size ?? 0),
    storageKey: String(r.storage_key ?? ""),
    createdAt: String(r.created_at),
  };
}

/* ---------------------------------- proizvodi ---------------------------------- */

export async function listProducts(search?: string): Promise<Product[]> {
  const db = sql();
  const rows = search
    ? await db<Row[]>`
        SELECT * FROM products
         WHERE deleted_at IS NULL
           AND (naziv ILIKE ${"%" + search + "%"} OR slug ILIKE ${"%" + search + "%"})
         ORDER BY updated_at DESC`
    : await db<Row[]>`
        SELECT * FROM products WHERE deleted_at IS NULL ORDER BY updated_at DESC`;
  return rows.map(rowToProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const rows = await sql()<Row[]>`
    SELECT * FROM products WHERE id = ${id} AND deleted_at IS NULL`;
  return rows[0] ? rowToProduct(rows[0]) : null;
}

/**
 * Samo nabavna cijena, za snapshot na narudžbi. Checkout je "hot path" —
 * nema smisla vući cijeli proizvod (hero/sections JSON) samo za jedan broj.
 */
export async function getProductCostPrice(id: string): Promise<number | null> {
  const rows = await sql()<{ nabavna_cijena: number | null }[]>`
    SELECT nabavna_cijena FROM products
     WHERE id = ${id} AND deleted_at IS NULL`;
  const v = rows[0]?.nabavna_cijena;
  return v === null || v === undefined ? null : Number(v);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await sql()<Row[]>`
    SELECT * FROM products WHERE slug = ${slug} AND deleted_at IS NULL`;
  return rows[0] ? rowToProduct(rows[0]) : null;
}

/** Samo objavljeni proizvodi — ovo čita javna stranica. */
export async function getPublishedBySlug(slug: string): Promise<Product | null> {
  const p = await getProductBySlug(slug);
  if (!p || p.status !== "published" || !p.publishedSections) return null;
  return p;
}

export async function listPublishedSlugs(): Promise<string[]> {
  const rows = await sql()<Row[]>`
    SELECT slug FROM products
     WHERE deleted_at IS NULL AND status = 'published'
       AND published_sections IS NOT NULL`;
  return rows.map((r) => String(r.slug));
}

export async function slugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const rows = await sql()<Row[]>`
    SELECT id FROM products
     WHERE slug = ${slug} AND deleted_at IS NULL
       AND (${exceptId ?? null}::text IS NULL OR id <> ${exceptId ?? ""})`;
  return rows.length > 0;
}

export async function allSlugs(): Promise<string[]> {
  const rows = await sql()<Row[]>`
    SELECT slug FROM products WHERE deleted_at IS NULL`;
  return rows.map((r) => String(r.slug));
}

export interface CreateProductInput {
  naziv: string;
  slug?: string;
  templateId?: string | null;
  copyFromId?: string | null;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const id = newId("prod");
  const ts = nowIso();
  const base = input.slug?.trim() ? slugify(input.slug) : slugify(input.naziv);
  const slug = uniqueSlug(base || "novi-proizvod", await allSlugs());

  let hero = defaultHero();
  let sections: Block[] = [];
  let cijena: number | null = null;
  let staraCijena: number | null = null;
  let nabavnaCijena: number | null = null;
  let badge = "";

  if (input.copyFromId) {
    const src = await getProduct(input.copyFromId);
    if (src) {
      hero = { ...src.hero };
      sections = regenIds(src.sections);
      cijena = src.cijena;
      staraCijena = src.staraCijena;
      nabavnaCijena = src.nabavnaCijena;
      badge = src.badge;
    }
  } else if (input.templateId) {
    const t = await getTemplate(input.templateId);
    if (t) {
      hero = { ...t.hero };
      sections = regenIds(t.sections);
    }
  }

  hero.naslovLinija1 = hero.naslovLinija1 || input.naziv;

  await sql()`
    INSERT INTO products
      (id, naziv, slug, sku, kategorija, status, cijena, stara_cijena,
       nabavna_cijena, badge, hero, seo, sections, created_at, updated_at)
    VALUES (${id}, ${input.naziv}, ${slug}, '', '', 'draft', ${cijena},
            ${staraCijena}, ${nabavnaCijena}, ${badge}, ${JSON.stringify(hero)}, ${"{}"},
            ${JSON.stringify(sections)}, ${ts}, ${ts})`;

  return (await getProduct(id))!;
}

function regenIds(sections: Block[]): Block[] {
  return sections.map((s) => ({ ...s, id: newId("blk") }));
}

export interface UpdateProductInput {
  naziv?: string;
  slug?: string;
  sku?: string;
  kategorija?: string;
  cijena?: number | null;
  staraCijena?: number | null;
  nabavnaCijena?: number | null;
  badge?: string;
  hero?: Hero;
  seo?: Seo;
  sections?: Block[];
}

/** Sprema NACRT. Nikad ne mijenja objavljenu verziju. */
export async function updateProduct(
  id: string,
  patch: UpdateProductInput
): Promise<Product | null> {
  const cur = await getProduct(id);
  if (!cur) return null;

  let slug = cur.slug;
  if (patch.slug !== undefined) {
    const s = slugify(patch.slug);
    if (s && s !== cur.slug) slug = (await slugTaken(s, id)) ? cur.slug : s;
  }

  const next = {
    naziv: patch.naziv ?? cur.naziv,
    slug,
    sku: patch.sku ?? cur.sku,
    kategorija: patch.kategorija ?? cur.kategorija,
    cijena: patch.cijena !== undefined ? patch.cijena : cur.cijena,
    staraCijena:
      patch.staraCijena !== undefined ? patch.staraCijena : cur.staraCijena,
    nabavnaCijena:
      patch.nabavnaCijena !== undefined ? patch.nabavnaCijena : cur.nabavnaCijena,
    badge: patch.badge ?? cur.badge,
    hero: patch.hero ?? cur.hero,
    seo: patch.seo ?? cur.seo,
    sections: patch.sections ?? cur.sections,
  };

  await sql()`
    UPDATE products SET
      naziv = ${next.naziv},
      slug = ${next.slug},
      sku = ${next.sku},
      kategorija = ${next.kategorija},
      cijena = ${next.cijena},
      stara_cijena = ${next.staraCijena},
      nabavna_cijena = ${next.nabavnaCijena},
      badge = ${next.badge},
      hero = ${JSON.stringify(next.hero)},
      seo = ${JSON.stringify(next.seo)},
      sections = ${JSON.stringify(next.sections)},
      updated_at = ${nowIso()}
     WHERE id = ${id}`;

  return getProduct(id);
}

export async function validateForPublish(p: Product): Promise<string[]> {
  const errors: string[] = [];
  if (!p.naziv.trim()) errors.push("Dodajte naziv proizvoda prije objave.");
  if (!p.slug.trim()) errors.push("Dodajte URL (slug) prije objave.");
  if (p.cijena === null || Number.isNaN(p.cijena))
    errors.push("Dodajte cijenu prije objave.");
  if (!p.hero.slika) errors.push("Dodajte glavnu fotografiju prije objave.");
  if (await slugTaken(p.slug, p.id))
    errors.push("Taj URL (slug) već koristi drugi proizvod.");
  return errors;
}

/** Objavljuje nacrt — kopira draft u published snapshot. */
export async function publishProduct(
  id: string
): Promise<{ ok: boolean; errors: string[]; slug?: string }> {
  const p = await getProduct(id);
  if (!p) return { ok: false, errors: ["Proizvod ne postoji."] };

  const errors = await validateForPublish(p);
  if (errors.length) return { ok: false, errors };

  const pub: PublishedData = {
    naziv: p.naziv,
    cijena: p.cijena,
    staraCijena: p.staraCijena,
    badge: p.badge,
    seo: p.seo,
  };

  const ts = nowIso();
  await sql()`
    UPDATE products SET
      status = 'published',
      published_hero = ${JSON.stringify(p.hero)},
      published_sections = ${JSON.stringify(p.sections)},
      published_data = ${JSON.stringify(pub)},
      published_at = ${ts},
      updated_at = ${ts}
     WHERE id = ${id}`;

  return { ok: true, errors: [], slug: p.slug };
}

export async function unpublishProduct(id: string): Promise<string | null> {
  const p = await getProduct(id);
  if (!p) return null;
  await sql()`
    UPDATE products SET status = 'draft', updated_at = ${nowIso()} WHERE id = ${id}`;
  return p.slug;
}

export async function duplicateProduct(id: string): Promise<Product | null> {
  const src = await getProduct(id);
  if (!src) return null;
  const copy = await createProduct({
    naziv: `${src.naziv} (kopija)`,
    slug: uniqueSlug(`${src.slug}-copy`, await allSlugs()),
    copyFromId: id,
  });
  // kopiraj i SEO/sku/kategoriju, ali ostaje DRAFT
  await updateProduct(copy.id, {
    sku: src.sku,
    kategorija: src.kategorija,
    seo: { ...src.seo, canonical: "" },
  });
  // kopiraj recenzije
  for (const r of await listReviews(id)) {
    await createReview({ ...r, id: undefined, productId: copy.id });
  }
  return getProduct(copy.id);
}

export async function softDeleteProduct(id: string): Promise<string | null> {
  const p = await getProduct(id);
  if (!p) return null;
  await sql()`
    UPDATE products SET deleted_at = ${nowIso()}, status = 'draft' WHERE id = ${id}`;
  return p.slug;
}

export async function productStats() {
  const rows = await sql()<Row[]>`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'published') AS published,
      COUNT(*) FILTER (WHERE status = 'draft') AS draft
     FROM products WHERE deleted_at IS NULL`;
  const r = rows[0] ?? {};
  return {
    total: Number(r.total ?? 0),
    published: Number(r.published ?? 0),
    draft: Number(r.draft ?? 0),
  };
}

/* ---------------------------------- media ---------------------------------- */

export async function listMedia(): Promise<Media[]> {
  const rows = await sql()<Row[]>`
    SELECT * FROM media WHERE deleted_at IS NULL ORDER BY created_at DESC`;
  return rows.map(rowToMedia);
}

export async function getMedia(id: string): Promise<Media | null> {
  const rows = await sql()<Row[]>`SELECT * FROM media WHERE id = ${id}`;
  return rows[0] ? rowToMedia(rows[0]) : null;
}

export async function createMedia(
  m: Omit<Media, "id" | "createdAt">
): Promise<Media> {
  const id = newId("med");
  await sql()`
    INSERT INTO media (id, filename, url, alt, mime, size, storage_key, created_at)
    VALUES (${id}, ${m.filename}, ${m.url}, ${m.alt}, ${m.mime}, ${m.size},
            ${m.storageKey ?? ""}, ${nowIso()})`;
  return (await getMedia(id))!;
}

export async function updateMediaAlt(id: string, alt: string) {
  await sql()`UPDATE media SET alt = ${alt} WHERE id = ${id}`;
}

export async function softDeleteMedia(id: string) {
  await sql()`UPDATE media SET deleted_at = ${nowIso()} WHERE id = ${id}`;
}

/* ---------------------------------- recenzije ---------------------------------- */

export async function listReviews(productId?: string | null): Promise<Review[]> {
  const db = sql();
  const rows =
    productId === undefined
      ? await db<Row[]>`
          SELECT * FROM reviews WHERE deleted_at IS NULL
           ORDER BY sort_order ASC, created_at ASC`
      : await db<Row[]>`
          SELECT * FROM reviews
           WHERE deleted_at IS NULL
             AND product_id IS NOT DISTINCT FROM ${productId}
           ORDER BY sort_order ASC, created_at ASC`;
  return rows.map(rowToReview);
}

export async function listPublishedReviews(productId: string): Promise<Review[]> {
  const rows = await listReviews(productId);
  return rows.filter((r) => r.status === "published");
}

export async function createReview(
  r: Partial<Review> & { id?: string | undefined }
): Promise<Review> {
  const id = newId("rev");
  const maxRows = await sql()<Row[]>`
    SELECT COALESCE(MAX(sort_order), -1) AS m FROM reviews
     WHERE product_id IS NOT DISTINCT FROM ${r.productId ?? null}
       AND deleted_at IS NULL`;
  const order = r.sortOrder ?? Number(maxRows[0]?.m ?? -1) + 1;

  await sql()`
    INSERT INTO reviews
      (id, product_id, ime, inicijal, rating, tekst, verified, slika, datum,
       status, sort_order, created_at)
    VALUES (
      ${id},
      ${r.productId ?? null},
      ${r.ime ?? ""},
      ${r.inicijal ?? (r.ime ?? "?").trim().charAt(0).toUpperCase()},
      ${r.rating ?? 5},
      ${r.tekst ?? ""},
      ${r.verified !== false},
      ${r.slika ?? ""},
      ${r.datum ?? ""},
      ${r.status === "hidden" ? "hidden" : "published"},
      ${order},
      ${nowIso()})`;

  const rows = await sql()<Row[]>`SELECT * FROM reviews WHERE id = ${id}`;
  return rowToReview(rows[0]);
}

export async function updateReview(id: string, r: Partial<Review>) {
  const rows = await sql()<Row[]>`SELECT * FROM reviews WHERE id = ${id}`;
  if (!rows[0]) return;
  const c = rowToReview(rows[0]);
  await sql()`
    UPDATE reviews SET
      product_id = ${r.productId !== undefined ? r.productId : c.productId},
      ime = ${r.ime ?? c.ime},
      inicijal = ${r.inicijal ?? c.inicijal},
      rating = ${r.rating ?? c.rating},
      tekst = ${r.tekst ?? c.tekst},
      verified = ${r.verified !== undefined ? r.verified : c.verified},
      slika = ${r.slika ?? c.slika},
      datum = ${r.datum ?? c.datum},
      status = ${r.status ?? c.status},
      sort_order = ${r.sortOrder ?? c.sortOrder}
     WHERE id = ${id}`;
}

export async function softDeleteReview(id: string) {
  await sql()`UPDATE reviews SET deleted_at = ${nowIso()} WHERE id = ${id}`;
}

export async function reorderReviews(ids: string[]) {
  if (!ids.length) return;
  // Jedna transakcija — ili se cijeli novi redoslijed upiše, ili ništa
  await sql().begin(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx`UPDATE reviews SET sort_order = ${i} WHERE id = ${ids[i]}`;
    }
  });
}

/* ---------------------------------- šabloni ---------------------------------- */

export async function listTemplates(): Promise<Template[]> {
  const rows = await sql()<Row[]>`
    SELECT * FROM templates ORDER BY is_default DESC, created_at ASC`;
  return rows.map((r) => ({
    id: String(r.id),
    naziv: String(r.naziv),
    hero: { ...defaultHero(), ...parseJson<Partial<Hero>>(r.hero as string, {}) },
    sections: parseJson<Block[]>(r.sections as string, []),
    isDefault: Boolean(r.is_default),
  }));
}

export async function getTemplate(id: string): Promise<Template | null> {
  return (await listTemplates()).find((t) => t.id === id) ?? null;
}

export async function saveTemplate(t: {
  id?: string;
  naziv: string;
  hero: Hero;
  sections: Block[];
  isDefault?: boolean;
}): Promise<Template> {
  const id = t.id ?? newId("tpl");
  const exists = t.id ? await getTemplate(t.id) : null;

  if (exists) {
    await sql()`
      UPDATE templates SET
        naziv = ${t.naziv},
        hero = ${JSON.stringify(t.hero)},
        sections = ${JSON.stringify(t.sections)},
        is_default = ${!!t.isDefault}
       WHERE id = ${id}`;
  } else {
    await sql()`
      INSERT INTO templates (id, naziv, hero, sections, is_default, created_at)
      VALUES (${id}, ${t.naziv}, ${JSON.stringify(t.hero)},
              ${JSON.stringify(t.sections)}, ${!!t.isDefault}, ${nowIso()})`;
  }

  // Samo jedan šablon smije biti podrazumijevani
  if (t.isDefault) {
    await sql()`UPDATE templates SET is_default = false WHERE id <> ${id}`;
  }

  return (await getTemplate(id))!;
}

export async function deleteTemplate(id: string) {
  await sql()`DELETE FROM templates WHERE id = ${id}`;
}

/* ---------------------------------- postavke ---------------------------------- */

const DEFAULT_SETTINGS: GlobalSettings = {
  announcementBar: "Plaćanje pouzećem · Dostava po cijeloj BiH",
  placanjeTekst: "Plaćanje pouzećem",
  dostavaTekst: "Dostava širom BiH",
  garancijaTekst: "🛡️ 14 dana garancije za povrat",
  kontaktEmail: "svijetistrazivaca@gmail.com",
  defaultCtaTekst: "PORUČI SADA",
  footerTekst: "© Mali Istraživači",
};

export async function getSettings(): Promise<GlobalSettings> {
  const rows = await sql()<Row[]>`SELECT value FROM settings WHERE key = 'global'`;
  return {
    ...DEFAULT_SETTINGS,
    ...parseJson<Partial<GlobalSettings>>(rows[0]?.value as string, {}),
  };
}

export async function saveSettings(s: Partial<GlobalSettings>) {
  const merged = { ...(await getSettings()), ...s };
  await sql()`
    INSERT INTO settings (key, value) VALUES ('global', ${JSON.stringify(merged)})
    ON CONFLICT (key) DO UPDATE SET value = excluded.value`;
}
