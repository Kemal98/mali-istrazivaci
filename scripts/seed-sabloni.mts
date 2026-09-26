// Upiše/ažurira 4 šablona proizvod-stranica (src/lib/cms/sabloni.ts) u tabelu
// templates. Idempotentno (fiksni id po šablonu). Pokretanje:
//   node --env-file=.env.local scripts/seed-sabloni.mts
import postgres from "postgres";
import { SABLONI, sablonHero, sablonSekcije } from "../src/lib/cms/sabloni.ts";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", prepare: false, max: 1 });
try {
  for (const def of SABLONI) {
    const id = `tpl_sablon_${def.kljuc}`;
    const hero = JSON.stringify(sablonHero(def.naziv));
    const sections = JSON.stringify(sablonSekcije(def));
    await sql`
      INSERT INTO templates (id, naziv, hero, sections, is_default, created_at)
      VALUES (${id}, ${def.naziv}, ${hero}, ${sections}, false, ${new Date().toISOString()})
      ON CONFLICT (id) DO UPDATE SET naziv = EXCLUDED.naziv, hero = EXCLUDED.hero,
        sections = EXCLUDED.sections`;
    console.log("šablon:", def.naziv);
  }
} finally {
  await sql.end();
}
