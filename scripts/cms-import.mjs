// Ubacuje sadržaj iz data/cms-export.json u Supabase Postgres.
// Prenosi SAMO neobrisane redove (obrisani test podaci se ne prenose).
// Idempotentno: ON CONFLICT DO NOTHING, pa ponovno pokretanje ne duplira.
//
//   npm run cms:import
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.error("DATABASE_URL nije postavljen (.env.local).");
  process.exit(1);
}

const file = path.join(process.cwd(), "scripts", "cms-seed.json");
if (!fs.existsSync(file)) {
  console.error("Nema scripts/cms-seed.json.");
  process.exit(1);
}
const dump = JSON.parse(fs.readFileSync(file, "utf8"));
const live = (rows) => rows.filter((r) => !r.deleted_at);

const sql = postgres(conn, { prepare: false, max: 1, onnotice: () => {} });
const b = (v) => Number(v) === 1 || v === true;

try {
  // 1) proizvodi
  for (const p of live(dump.products)) {
    await sql`
      INSERT INTO products (id, naziv, slug, sku, kategorija, status, cijena,
        stara_cijena, badge, hero, seo, sections, published_hero,
        published_sections, published_data, created_at, updated_at, published_at)
      VALUES (${p.id}, ${p.naziv}, ${p.slug}, ${p.sku}, ${p.kategorija},
              ${p.status}, ${p.cijena}, ${p.stara_cijena}, ${p.badge},
              ${p.hero}, ${p.seo}, ${p.sections}, ${p.published_hero},
              ${p.published_sections}, ${p.published_data}, ${p.created_at},
              ${p.updated_at}, ${p.published_at})
      ON CONFLICT (id) DO NOTHING`;
  }

  // 2) media (stari /img/... fajlovi ostaju u repou, storage_key je prazan)
  for (const m of live(dump.media)) {
    await sql`
      INSERT INTO media (id, filename, url, alt, mime, size, storage_key, created_at)
      VALUES (${m.id}, ${m.filename}, ${m.url}, ${m.alt}, ${m.mime},
              ${m.size}, ${""}, ${m.created_at})
      ON CONFLICT (id) DO NOTHING`;
  }

  // 3) recenzije — samo one koje pripadaju prenesenim proizvodima
  const okProducts = new Set(live(dump.products).map((p) => p.id));
  for (const r of live(dump.reviews)) {
    if (r.product_id && !okProducts.has(r.product_id)) continue;
    await sql`
      INSERT INTO reviews (id, product_id, ime, inicijal, rating, tekst,
        verified, slika, datum, status, sort_order, created_at)
      VALUES (${r.id}, ${r.product_id}, ${r.ime}, ${r.inicijal}, ${r.rating},
              ${r.tekst}, ${b(r.verified)}, ${r.slika}, ${r.datum}, ${r.status},
              ${r.sort_order}, ${r.created_at})
      ON CONFLICT (id) DO NOTHING`;
  }

  // 4) šabloni
  for (const t of dump.templates) {
    await sql`
      INSERT INTO templates (id, naziv, hero, sections, is_default, created_at)
      VALUES (${t.id}, ${t.naziv}, ${t.hero}, ${t.sections},
              ${b(t.is_default)}, ${t.created_at})
      ON CONFLICT (id) DO NOTHING`;
  }

  // 5) postavke
  for (const s of dump.settings) {
    await sql`
      INSERT INTO settings (key, value) VALUES (${s.key}, ${s.value})
      ON CONFLICT (key) DO UPDATE SET value = excluded.value`;
  }

  const [{ count: prod }] = await sql`
    SELECT COUNT(*) AS count FROM products WHERE deleted_at IS NULL`;
  const [{ count: rev }] = await sql`
    SELECT COUNT(*) AS count FROM reviews WHERE deleted_at IS NULL`;
  const [{ count: med }] = await sql`
    SELECT COUNT(*) AS count FROM media WHERE deleted_at IS NULL`;
  const [{ count: tpl }] = await sql`SELECT COUNT(*) AS count FROM templates`;
  console.log(
    `U bazi: ${prod} proizvod(a), ${rev} recenzija, ${med} fajlova, ${tpl} šablon(a).`
  );
  const pub = await sql`
    SELECT slug, status FROM products WHERE deleted_at IS NULL ORDER BY slug`;
  for (const p of pub) console.log(` /${p.slug} — ${p.status}`);
} catch (e) {
  console.error("Import pao:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
