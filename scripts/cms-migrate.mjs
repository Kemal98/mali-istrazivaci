// Kreira CMS tabele u Supabase Postgresu. Idempotentno (CREATE TABLE IF NOT
// EXISTS), pa se može pokrenuti više puta bez štete.
//
//   npm run cms:migrate
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.error(
    "DATABASE_URL nije postavljen.\n" +
      "Upišite ga u .env.local (Supabase -> Connect -> Connection pooling, port 6543)."
  );
  process.exit(1);
}

// Svi .sql fajlovi se puštaju redom. Redoslijed je važan: orders ima FK
// referencu samo unutar sebe, ali cms ide prvi jer je stariji.
const schemaFiles = [
  path.join(process.cwd(), "src", "lib", "cms", "schema.sql"),
  path.join(process.cwd(), "src", "lib", "orders", "schema.sql"),
  path.join(process.cwd(), "src", "lib", "ads", "schema.sql"),
];

const sql = postgres(conn, { prepare: false, max: 1, onnotice: () => {} });

try {
  for (const file of schemaFiles) {
    await sql.unsafe(fs.readFileSync(file, "utf8"));
    console.log("primijenjeno:", path.relative(process.cwd(), file));
  }
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('products','media','reviews','templates','settings',
                          'orders','order_events','ad_spend')
     ORDER BY table_name`;
  console.log("Tabele u bazi:", tables.map((t) => t.table_name).join(", "));
  console.log("Migracija završena.");
} catch (e) {
  console.error("Migracija pala:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
