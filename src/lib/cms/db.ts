import postgres from "postgres";

// Postgres (Supabase). Prije je ovdje bio SQLite fajl, ali shop je na
// Vercelu — tamo je disk efemeran, pa bi se baza brisala na svaki deploy.
//
// Konekcija ide preko Supabase POOLER-a (port 6543, transaction mode), jer
// serverless funkcije prave mnogo kratkih konekcija. Zato i `prepare: false`
// — pgBouncer u transaction modu ne podržava prepared statemente.
const CONN = process.env.DATABASE_URL ?? "";

// Klijent se kešira na globalThis, ne u modulskoj varijabli: u dev-u
// Turbopack re-instancira module na hot-reload, pa bi se svaki put
// otvarao novi pool i konekcije bi se gomilale prema Supabaseu.
const g = globalThis as { __miSql?: postgres.Sql };

export function sql(): postgres.Sql {
  if (g.__miSql) return g.__miSql;
  if (!CONN) {
    throw new Error(
      "DATABASE_URL nije postavljen. Upišite Supabase connection string " +
        "(Connection pooling / Transaction mode, port 6543) u .env.local."
    );
  }
  const client = postgres(CONN, {
    prepare: false,
    // Malo konekcija jer na Vercelu svaka serverless instanca drži svoj
    // pool. Ako pool zatreba više paralelnih upita nego što ima mjesta,
    // radi se sekvencijalno (vidi komentare u orders/repo.ts).
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
  g.__miSql = client;
  return client;
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
