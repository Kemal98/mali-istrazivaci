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

const schemaPath = path.join(process.cwd(), "src", "lib", "cms", "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

const sql = postgres(conn, { prepare: false, max: 1, onnotice: () => {} });

try {
  await sql.unsafe(schema);
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('products','media','reviews','templates','settings')
     ORDER BY table_name`;
  console.log("Tabele u bazi:", tables.map((t) => t.table_name).join(", "));
  console.log("Migracija završena.");
} catch (e) {
  console.error("Migracija pala:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
