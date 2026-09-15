import postgres from "postgres";

// Postgres (Supabase). Prije je ovdje bio SQLite fajl, ali shop je na
// Vercelu — tamo je disk efemeran, pa bi se baza brisala na svaki deploy.
//
// Konekcija ide preko Supabase POOLER-a (port 6543, transaction mode), jer
// serverless funkcije prave mnogo kratkih konekcija. Zato i `prepare: false`
// — pgBouncer u transaction modu ne podržava prepared statemente.
const CONN = process.env.DATABASE_URL ?? "";

let _sql: postgres.Sql | null = null;

export function sql(): postgres.Sql {
  if (_sql) return _sql;
  if (!CONN) {
    throw new Error(
      "DATABASE_URL nije postavljen. Upišite Supabase connection string " +
        "(Connection pooling / Transaction mode, port 6543) u .env.local."
    );
  }
  _sql = postgres(CONN, {
    prepare: false,
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
  return _sql;
}

export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix = "") {
  const raw = globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return prefix ? `${prefix}_${raw}` : raw;
}

export function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
