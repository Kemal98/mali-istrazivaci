// Jednokratno prebacivanje starih redova iz stock_purchases (flat ledger,
// bez dokumentacije) u novi nabavke_partije/nabavke_korekcije model.
//
// NE pokreće se automatski (nije u cms:migrate) — ovo pomiče PODATKE, ne
// shemu, i radi se samo jednom. Sigurno za ponovno pokretanje: ID-evi su
// deterministički (nab_legacy_<stari id>, kor_legacy_<stari id>) i svaki
// INSERT ima ON CONFLICT (id) DO NOTHING.
//
// Stara tabela stock_purchases se NE dira (ništa se ne briše/mijenja u njoj).
//
//   node --env-file=.env.local scripts/migrate-nabavke-legacy.mjs
import postgres from "postgres";

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.error("DATABASE_URL nije postavljen (.env.local).");
  process.exit(1);
}

const norm = (v) => String(v).trim().toLowerCase();
const nowIso = () => new Date().toISOString();

const sql = postgres(conn, { prepare: false, max: 1, onnotice: () => {} });

try {
  const products = await sql`
    SELECT id, naziv FROM products WHERE deleted_at IS NULL`;

  // Mapiranje normalizovano-ime -> product_id, uz detekciju sudara (dva
  // proizvoda koja bi se normalizovala na isto ime — tad je mapiranje
  // neizvjesno, pa se radije preskače nego nasumično pogađa).
  const nameToId = new Map();
  const ambiguous = new Set();
  for (const p of products) {
    const key = norm(p.naziv);
    if (nameToId.has(key)) ambiguous.add(key);
    else nameToId.set(key, p.id);
  }
  for (const key of ambiguous) nameToId.delete(key);

  const purchases = await sql`
    SELECT id, date, product_name, quantity, total_cost, is_adjustment, created_at
      FROM stock_purchases
     ORDER BY date ASC, created_at ASC`;

  // Grupisanje po normalizovanom imenu proizvoda.
  const groups = new Map();
  for (const row of purchases) {
    const key = norm(row.product_name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  let insertedBatches = 0;
  let insertedCorrections = 0;
  const skipped = [];

  for (const [key, rows] of groups) {
    const productId = nameToId.get(key);
    if (!productId) {
      skipped.push(rows[0].product_name);
      continue;
    }

    const buyRows = rows.filter((r) => !r.is_adjustment);
    const adjRows = rows.filter((r) => r.is_adjustment);

    // Isti formula kao profit.ts: stock = (sve iz stock_purchases, uključujući
    // presjeke) − (sve prodano, sve vrijeme, osim CANCELLED/RETURNED/obrisano).
    const totalInclAdjustments = rows.reduce((s, r) => s + Number(r.quantity), 0);
    const soldRows = await sql`
      SELECT COALESCE(SUM(quantity), 0) AS qty FROM orders
       WHERE product_id = ${productId} AND deleted_at IS NULL
         AND status NOT IN ('CANCELLED', 'RETURNED')`;
    const soldQty = Number(soldRows[0].qty);
    const stockNow = Math.max(0, totalInclAdjustments - soldQty);

    // Raspodjela preostale količine na partije pod FIFO logikom: najstarija
    // partija se prodaje prva, pa ono što je još "na stanju" leži najviše u
    // NAJNOVIJIM partijama. Zato se ide od najnovije unazad.
    const newestFirst = [...buyRows].sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at)
    );
    let running = stockNow;
    const preostaloById = new Map();
    for (const row of newestFirst) {
      const take = Math.min(Number(row.quantity), running);
      preostaloById.set(row.id, take);
      running -= take;
    }

    const batchIdByRowId = new Map();
    for (const row of buyRows) {
      const qty = Number(row.quantity);
      const cost = Number(row.total_cost);
      const batchId = `nab_legacy_${row.id}`;
      batchIdByRowId.set(row.id, batchId);
      const preostalo = preostaloById.get(row.id) ?? 0;
      const cijenaPoKomadu = qty > 0 ? Math.round((cost / qty) * 100) / 100 : 0;

      const res = await sql`
        INSERT INTO nabavke_partije (
          id, product_id, dobavljac, datum_nabavke,
          nabavljeno_kolicina, preostalo, cijena_po_komadu, dodatni_troskovi,
          tip_dokumenta, napomena, status, origin, created_at, updated_at
        ) VALUES (
          ${batchId}, ${productId}, '', ${row.date},
          ${qty}, ${preostalo}, ${cijenaPoKomadu}, 0,
          'nedostaje',
          ${"Naslijeđeno — provjeri dokumentaciju (uvezeno iz stare Nabavke robe, " + row.date + ")"},
          'spremno', 'legacy_import', ${row.created_at}, ${nowIso()}
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id`;
      if (res.length > 0) insertedBatches++;
    }

    // Presjeci/korekcije (is_adjustment=true) -> nabavke_korekcije. batch_id
    // se postavlja SAMO ako postoji TAČNO JEDNA partija za ovaj proizvod
    // (jednoznačno) — inače ostaje NULL, ne nagađa se.
    const singleBatchId =
      buyRows.length === 1 ? batchIdByRowId.get(buyRows[0].id) : null;

    for (const row of adjRows) {
      const qty = Number(row.quantity);
      if (qty === 0) continue;
      const vrsta = qty < 0 ? "manjak" : "visak";
      const korId = `kor_legacy_${row.id}`;
      const res = await sql`
        INSERT INTO nabavke_korekcije (
          id, product_id, batch_id, vrsta, kolicina, razlog, created_at
        ) VALUES (
          ${korId}, ${productId}, ${singleBatchId}, ${vrsta}, ${Math.abs(qty)},
          'Naslijeđeno iz presjeka zaliha (stara Nabavka robe)', ${row.created_at}
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id`;
      if (res.length > 0) insertedCorrections++;
    }
  }

  console.log(`Partije (nabavke_partije) upisano: ${insertedBatches}`);
  console.log(`Korekcije (nabavke_korekcije) upisano: ${insertedCorrections}`);
  if (skipped.length > 0) {
    console.log(
      "\nPRESKOČENO (nije nađen tačan proizvod po imenu, provjeri ručno):"
    );
    for (const name of new Set(skipped)) console.log("  -", name);
  }
  if (ambiguous.size > 0) {
    console.log(
      "\nUPOZORENJE — više proizvoda ima isto ime, preskočeno iz mapiranja:"
    );
    for (const key of ambiguous) console.log("  -", key);
  }
  console.log("\nGotovo.");
} catch (e) {
  console.error("Migracija starih zaliha pala:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
