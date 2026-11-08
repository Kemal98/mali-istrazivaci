import { sql, nowIso, newId } from "@/lib/cms/db";
import type {
  NabavkaPartija,
  NabavkaStatus,
  DocumentType,
  StatusLogEntry,
  Korekcija,
  KorekcijaVrsta,
  StockSummary,
} from "./types";

type Row = Record<string, unknown>;
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

function rowToPartija(r: Row): NabavkaPartija {
  return {
    id: s(r.id),
    productId: s(r.product_id),
    productName: s(r.naziv ?? ""),
    dobavljac: s(r.dobavljac),
    datumNabavke: s(r.datum_nabavke),
    nabavljenoKolicina: n(r.nabavljeno_kolicina),
    preostalo: n(r.preostalo),
    cijenaPoKomadu: n(r.cijena_po_komadu),
    dodatniTroskovi: n(r.dodatni_troskovi),
    tipDokumenta: s(r.tip_dokumenta) as DocumentType,
    brojDokumenta: s(r.broj_dokumenta),
    datumDokumenta: r.datum_dokumenta === null ? null : s(r.datum_dokumenta),
    dokumentUrl: r.dokument_url === null ? null : s(r.dokument_url),
    napomena: s(r.napomena),
    status: s(r.status) as NabavkaStatus,
    origin: s(r.origin) as "manual" | "legacy_import",
    createdAt: s(r.created_at),
    updatedAt: s(r.updated_at),
  };
}

export interface CreateBatchInput {
  productId: string;
  dobavljac: string;
  datumNabavke: string;
  nabavljenoKolicina: number;
  cijenaPoKomadu: number;
  dodatniTroskovi: number;
  tipDokumenta: DocumentType;
  brojDokumenta: string;
  datumDokumenta: string | null;
  napomena: string;
}

/** Nova partija — uvijek kreće sa status='ceka_dokumentaciju', preostalo = puna količina. */
export async function createBatch(input: CreateBatchInput): Promise<NabavkaPartija> {
  const id = newId("nab");
  const ts = nowIso();
  await sql()`
    INSERT INTO nabavke_partije (
      id, product_id, dobavljac, datum_nabavke,
      nabavljeno_kolicina, preostalo, cijena_po_komadu, dodatni_troskovi,
      tip_dokumenta, broj_dokumenta, datum_dokumenta,
      napomena, status, origin, created_at, updated_at
    ) VALUES (
      ${id}, ${input.productId}, ${input.dobavljac}, ${input.datumNabavke},
      ${input.nabavljenoKolicina}, ${input.nabavljenoKolicina},
      ${input.cijenaPoKomadu}, ${input.dodatniTroskovi},
      ${input.tipDokumenta}, ${input.brojDokumenta}, ${input.datumDokumenta},
      ${input.napomena}, 'ceka_dokumentaciju', 'manual', ${ts}, ${ts}
    )`;
  const batch = await getBatch(id);
  if (!batch) throw new Error("Partija nije pronađena nakon upisa.");
  return batch;
}

export interface UpdateBatchInput {
  dobavljac?: string;
  datumNabavke?: string;
  cijenaPoKomadu?: number;
  dodatniTroskovi?: number;
  tipDokumenta?: DocumentType;
  brojDokumenta?: string;
  datumDokumenta?: string | null;
  napomena?: string;
  /** Samo ako ništa iz partije još nije potrošeno (preostalo === nabavljenoKolicina). */
  nabavljenoKolicina?: number;
}

export async function updateBatch(
  id: string,
  patch: UpdateBatchInput
): Promise<NabavkaPartija | null> {
  const cur = await getBatch(id);
  if (!cur) return null;

  let nabavljenoKolicina = cur.nabavljenoKolicina;
  let preostalo = cur.preostalo;
  if (patch.nabavljenoKolicina !== undefined) {
    if (cur.preostalo !== cur.nabavljenoKolicina) {
      throw new Error(
        "Količina se ne može mijenjati — iz ove partije je već nešto potrošeno. Koristi korekciju."
      );
    }
    nabavljenoKolicina = Math.max(1, Math.trunc(patch.nabavljenoKolicina));
    preostalo = nabavljenoKolicina;
  }

  await sql()`
    UPDATE nabavke_partije SET
      dobavljac = ${patch.dobavljac ?? cur.dobavljac},
      datum_nabavke = ${patch.datumNabavke ?? cur.datumNabavke},
      nabavljeno_kolicina = ${nabavljenoKolicina},
      preostalo = ${preostalo},
      cijena_po_komadu = ${patch.cijenaPoKomadu ?? cur.cijenaPoKomadu},
      dodatni_troskovi = ${patch.dodatniTroskovi ?? cur.dodatniTroskovi},
      tip_dokumenta = ${patch.tipDokumenta ?? cur.tipDokumenta},
      broj_dokumenta = ${patch.brojDokumenta ?? cur.brojDokumenta},
      datum_dokumenta = ${patch.datumDokumenta === undefined ? cur.datumDokumenta : patch.datumDokumenta},
      napomena = ${patch.napomena ?? cur.napomena},
      updated_at = ${nowIso()}
     WHERE id = ${id}`;

  return getBatch(id);
}

/** Dokument se prilaže posebno (upload ide prvo u Storage, pa se key upiše ovdje). */
export async function setBatchDocument(
  id: string,
  dokumentUrl: string | null
): Promise<void> {
  await sql()`
    UPDATE nabavke_partije SET dokument_url = ${dokumentUrl}, updated_at = ${nowIso()}
     WHERE id = ${id}`;
}

/**
 * Briše partiju — SAMO ako NIKAD nije bila dotaknuta narudžbom ili
 * korekcijom (ni u historiji, ni poslije otkazivanja/vraćanja). Provjera
 * preostalo === nabavljenoKolicina NIJE dovoljna: reversed potrošnja
 * vrati količinu, ali red u ledgeru ostaje (revizijski trag), pa bi
 * DELETE i tad pao na FK (nabavke_potrosnja/nabavke_korekcije i dalje
 * referenciraju batch_id). Umjesto da se to otkrije kao 500 greška,
 * provjerava se ovdje unaprijed, s jasnom porukom.
 */
export async function deleteBatch(id: string): Promise<{ ok: boolean; error?: string }> {
  const cur = await getBatch(id);
  if (!cur) return { ok: false, error: "Partija ne postoji." };
  if (cur.preostalo !== cur.nabavljenoKolicina) {
    return {
      ok: false,
      error: "Ne može se obrisati — iz ove partije je već nešto potrošeno ili korigovano.",
    };
  }
  const [pot, kor] = await Promise.all([
    sql()<Row[]>`SELECT 1 FROM nabavke_potrosnja WHERE batch_id = ${id} LIMIT 1`,
    sql()<Row[]>`SELECT 1 FROM nabavke_korekcije WHERE batch_id = ${id} LIMIT 1`,
  ]);
  if (pot.length > 0 || kor.length > 0) {
    return {
      ok: false,
      error:
        "Ne može se obrisati — partija je u prošlosti bila dio narudžbe ili korekcije (čak i ako je poništena). Promijeni status u 'neaktivno' umjesto brisanja.",
    };
  }
  await sql()`DELETE FROM nabavke_partije WHERE id = ${id}`;
  return { ok: true };
}

/**
 * Namjerna promjena statusa — NIKAD proizvoljan klik: svaki poziv upisuje
 * red u nabavke_status_log (samo datum/vrijeme, bez "ko" — jedna
 * zajednička admin lozinka, nema pojedinačnih korisnika).
 */
export async function setBatchStatus(
  id: string,
  newStatus: NabavkaStatus,
  napomena = ""
): Promise<NabavkaPartija | null> {
  const cur = await getBatch(id);
  if (!cur) return null;
  if (cur.status === newStatus) return cur;

  await sql()`
    UPDATE nabavke_partije SET status = ${newStatus}, updated_at = ${nowIso()}
     WHERE id = ${id}`;
  await sql()`
    INSERT INTO nabavke_status_log (id, batch_id, created_at, old_status, new_status, napomena)
    VALUES (${newId("stl")}, ${id}, ${nowIso()}, ${cur.status}, ${newStatus}, ${napomena})`;

  return getBatch(id);
}

export async function listStatusLog(batchId: string): Promise<StatusLogEntry[]> {
  const rows = await sql()<Row[]>`
    SELECT * FROM nabavke_status_log WHERE batch_id = ${batchId}
     ORDER BY created_at DESC`;
  return rows.map((r) => ({
    id: s(r.id),
    batchId: s(r.batch_id),
    createdAt: s(r.created_at),
    oldStatus: s(r.old_status),
    newStatus: s(r.new_status),
    napomena: s(r.napomena),
  }));
}

export async function getBatch(id: string): Promise<NabavkaPartija | null> {
  const rows = await sql()<Row[]>`
    SELECT b.*, p.naziv FROM nabavke_partije b
    JOIN products p ON p.id = b.product_id
    WHERE b.id = ${id}`;
  return rows[0] ? rowToPartija(rows[0]) : null;
}

export interface ListBatchesFilter {
  status?: NabavkaStatus;
  productId?: string;
  tipDokumenta?: DocumentType;
  limit?: number;
}

export async function listBatches(filter: ListBatchesFilter = {}): Promise<NabavkaPartija[]> {
  const db = sql();
  let w = db`1 = 1`;
  if (filter.status) w = db`${w} AND b.status = ${filter.status}`;
  if (filter.productId) w = db`${w} AND b.product_id = ${filter.productId}`;
  if (filter.tipDokumenta) w = db`${w} AND b.tip_dokumenta = ${filter.tipDokumenta}`;
  const rows = await db<Row[]>`
    SELECT b.*, p.naziv FROM nabavke_partije b
    JOIN products p ON p.id = b.product_id
    WHERE ${w}
    ORDER BY b.datum_nabavke DESC, b.created_at DESC
    LIMIT ${filter.limit ?? 500}`;
  return rows.map(rowToPartija);
}

/** Za padajuću listu partija koje mogu primiti FIFO potrošnju (koristi se i u consume.ts posredno kroz SQL, ovo je samo za prikaz). */
export async function listReadyBatchesForProduct(productId: string): Promise<NabavkaPartija[]> {
  return listBatches({ productId, status: "spremno" });
}

// ---------------------------------------------------------------------------
// Korekcije
// ---------------------------------------------------------------------------

export interface InsertCorrectionInput {
  productId: string;
  vrsta: KorekcijaVrsta;
  kolicina: number;
  razlog: string;
  /** Obavezno za manjak/ostecena/otpis/povrat (koja partija). Ignoriše se za visak. */
  batchId?: string;
  /** Samo za visak — procijenjena cijena po komadu nove (čeka_dokumentaciju) partije. */
  cijenaPoKomaduProcjena?: number;
}

export async function insertCorrection(
  input: InsertCorrectionInput
): Promise<{ ok: boolean; error?: string; korekcija?: Korekcija; novaPartija?: NabavkaPartija }> {
  const kolicina = Math.trunc(input.kolicina);
  if (!Number.isFinite(kolicina) || kolicina <= 0) {
    return { ok: false, error: "Količina mora biti veća od nule." };
  }
  if (!input.razlog.trim()) {
    return { ok: false, error: "Razlog je obavezan." };
  }

  const ts = nowIso();

  // VIŠAK: nikad direktno ne uveća postojeću partiju — nova partija ide
  // kroz isti status workflow kao svaka druga ("čeka dokumentaciju"), da
  // popisni višak ne postane prodajna roba proizvoljnim klikom.
  if (input.vrsta === "visak") {
    const batchId = newId("nab");
    await sql()`
      INSERT INTO nabavke_partije (
        id, product_id, dobavljac, datum_nabavke,
        nabavljeno_kolicina, preostalo, cijena_po_komadu, dodatni_troskovi,
        tip_dokumenta, napomena, status, origin, created_at, updated_at
      ) VALUES (
        ${batchId}, ${input.productId}, '', ${ts.slice(0, 10)},
        ${kolicina}, ${kolicina}, ${input.cijenaPoKomaduProcjena ?? 0}, 0,
        'nedostaje', ${"Popisni višak — " + input.razlog},
        'ceka_dokumentaciju', 'manual', ${ts}, ${ts}
      )`;
    const korId = newId("kor");
    await sql()`
      INSERT INTO nabavke_korekcije (id, product_id, batch_id, vrsta, kolicina, razlog, created_at)
      VALUES (${korId}, ${input.productId}, ${batchId}, 'visak', ${kolicina}, ${input.razlog}, ${ts})`;
    const novaPartija = await getBatch(batchId);
    return {
      ok: true,
      korekcija: {
        id: korId,
        productId: input.productId,
        batchId,
        vrsta: "visak",
        kolicina,
        razlog: input.razlog,
        createdAt: ts,
      },
      novaPartija: novaPartija ?? undefined,
    };
  }

  // manjak/ostecena/otpis: smanjuju preostalo POSTOJEĆE partije.
  // povrat (ručni unos, van FIFO ledgera narudžbe): uvećava preostalo.
  if (!input.batchId) {
    return { ok: false, error: "Partija je obavezna za ovu vrstu korekcije." };
  }
  const batch = await getBatch(input.batchId);
  if (!batch || batch.productId !== input.productId) {
    return { ok: false, error: "Partija nije pronađena za ovaj proizvod." };
  }

  if (input.vrsta === "povrat") {
    const novoPreostalo = Math.min(batch.nabavljenoKolicina, batch.preostalo + kolicina);
    await sql()`
      UPDATE nabavke_partije SET preostalo = ${novoPreostalo}, updated_at = ${ts}
       WHERE id = ${batch.id}`;
  } else {
    const novoPreostalo = Math.max(0, batch.preostalo - kolicina);
    await sql()`
      UPDATE nabavke_partije SET preostalo = ${novoPreostalo}, updated_at = ${ts}
       WHERE id = ${batch.id}`;
  }

  const korId = newId("kor");
  await sql()`
    INSERT INTO nabavke_korekcije (id, product_id, batch_id, vrsta, kolicina, razlog, created_at)
    VALUES (${korId}, ${input.productId}, ${batch.id}, ${input.vrsta}, ${kolicina}, ${input.razlog}, ${ts})`;

  return {
    ok: true,
    korekcija: {
      id: korId,
      productId: input.productId,
      batchId: batch.id,
      vrsta: input.vrsta,
      kolicina,
      razlog: input.razlog,
      createdAt: ts,
    },
  };
}

export async function listCorrections(productId?: string): Promise<Korekcija[]> {
  const db = sql();
  const rows = productId
    ? await db<Row[]>`SELECT * FROM nabavke_korekcije WHERE product_id = ${productId} ORDER BY created_at DESC`
    : await db<Row[]>`SELECT * FROM nabavke_korekcije ORDER BY created_at DESC LIMIT 500`;
  return rows.map((r) => ({
    id: s(r.id),
    productId: s(r.product_id),
    batchId: r.batch_id === null ? null : s(r.batch_id),
    vrsta: s(r.vrsta) as KorekcijaVrsta,
    kolicina: n(r.kolicina),
    razlog: s(r.razlog),
    createdAt: s(r.created_at),
  }));
}

// ---------------------------------------------------------------------------
// Dashboard — 5 brojeva po proizvodu (FIZIČKI/DOKUMENTOVANO/ČEKA/REZERVISANO/RASPOLOŽIVO)
// ---------------------------------------------------------------------------

export async function stockSummaryByProduct(): Promise<StockSummary[]> {
  const db = sql();

  const batchRows = await db<Row[]>`
    SELECT b.product_id, p.naziv,
           COALESCE(SUM(b.preostalo) FILTER (WHERE b.status <> 'neaktivno'), 0) AS fizicki,
           COALESCE(SUM(b.preostalo) FILTER (
             WHERE b.status IN ('dokumentacija_zaprimljena','ceka_provjeru','spremno')
           ), 0) AS dokumentovano,
           COALESCE(SUM(b.preostalo) FILTER (WHERE b.status = 'ceka_dokumentaciju'), 0) AS ceka,
           COALESCE(SUM(b.preostalo) FILTER (WHERE b.status = 'spremno'), 0) AS raspolozivo
      FROM nabavke_partije b
      JOIN products p ON p.id = b.product_id
     GROUP BY b.product_id, p.naziv`;

  // Rezervisano — čisto informativno: narudžbe koje se još mogu
  // otkazati/vratiti (nisu poslane/dostavljene/otkazane/vraćene).
  const reservedRows = await db<Row[]>`
    SELECT product_id, COALESCE(SUM(quantity), 0) AS qty
      FROM orders
     WHERE deleted_at IS NULL AND product_id IS NOT NULL
       AND status NOT IN ('SHIPPED','DELIVERED','CANCELLED','RETURNED')
     GROUP BY product_id`;
  const reserved = new Map<string, number>();
  for (const r of reservedRows) reserved.set(s(r.product_id), n(r.qty));

  return batchRows.map((r) => ({
    productId: s(r.product_id),
    productName: s(r.naziv),
    fizicki: n(r.fizicki),
    dokumentovano: n(r.dokumentovano),
    cekaDokumentaciju: n(r.ceka),
    rezervisano: reserved.get(s(r.product_id)) ?? 0,
    raspolozivo: n(r.raspolozivo),
  }));
}
