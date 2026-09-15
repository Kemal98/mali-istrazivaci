// Jednokratni izvoz iz starog SQLite-a u JSON, da se sadržaj prenese u
// Supabase. Već je odrađen — rezultat je scripts/cms-seed.json.
// Ostavljen kao dokumentacija; za ponovno pokretanje treba
// `npm i better-sqlite3` (paket je uklonjen nakon prelaska na Postgres).
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const src = process.env.CMS_DB_PATH || path.join(process.cwd(), "data", "cms.db");
if (!fs.existsSync(src)) {
  console.error("Nema SQLite baze na", src);
  process.exit(1);
}
const db = new Database(src, { readonly: true });
const all = (t) => db.prepare(`SELECT * FROM ${t}`).all();

const dump = {
  exportedAt: new Date().toISOString(),
  products: all("products"),
  media: all("media"),
  reviews: all("reviews"),
  templates: all("templates"),
  settings: all("settings"),
};

const out = path.join(process.cwd(), "scripts", "cms-seed.json");
fs.writeFileSync(out, JSON.stringify(dump, null, 2));
console.log("Izvezeno u", out);
for (const k of ["products", "media", "reviews", "templates", "settings"]) {
  console.log(` ${k}: ${dump[k].length}`);
}
