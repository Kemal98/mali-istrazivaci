import "server-only";

import { sql, nowIso, newId } from "@/lib/cms/db";
import { batchUnitCost } from "./types";

type Row = Record<string, unknown>;
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

export interface ConsumeResult {
  consumed: { batchId: string; qty: number; unitCost: number }[];
  uncoveredQty: number;
  uncoveredUnitCost: number;
}

/**
 * FIFO potrošnja: povlači iz najstarijih SPREMNIH partija tog proizvoda
 * dok ne pokrije quantity, upisuje ledger red po partiji. Ako partije ne
 * pokrivaju sve, ostatak ide kao red sa batch_id=NULL (cost pada na
 * trenutnu products.nabavna_cijena — identično današnjem fallback-u u
 * profit.ts).
 *
 * NIKAD ne baca dalje — greška se loguje i vraća null, poziv je ignoriše.
 * Isti obrazac kao getProductCostPrice u cms/repo.ts: "ovo nikad ne smije
 * oboriti narudžbu".
 */
export async function consumeFifo(
  productId: string,
  orderId: string,
  quantity: number
): Promise<ConsumeResult | null> {
  if (quantity <= 0) return { consumed: [], uncoveredQty: 0, uncoveredUnitCost: 0 };
  try {
    return await sql().begin(async (tx) => {
      const batches = await tx<Row[]>`
        SELECT id, preostalo, cijena_po_komadu, dodatni_troskovi, nabavljeno_kolicina
          FROM nabavke_partije
         WHERE product_id = ${productId} AND status = 'spremno' AND preostalo > 0
         ORDER BY datum_nabavke ASC, created_at ASC
         FOR UPDATE`;

      let remaining = quantity;
      const consumed: ConsumeResult["consumed"] = [];
      const ts = nowIso();

      for (const b of batches) {
        if (remaining <= 0) break;
        const preostalo = n(b.preostalo);
        const take = Math.min(remaining, preostalo);
        if (take <= 0) continue;
        const unitCost = batchUnitCost({
          cijenaPoKomadu: n(b.cijena_po_komadu),
          dodatniTroskovi: n(b.dodatni_troskovi),
          nabavljenoKolicina: n(b.nabavljeno_kolicina),
        });

        await tx`UPDATE nabavke_partije SET preostalo = preostalo - ${take}, updated_at = ${ts} WHERE id = ${String(b.id)}`;
        await tx`
          INSERT INTO nabavke_potrosnja (id, order_id, batch_id, quantity, unit_cost, created_at)
          VALUES (${newId("pot")}, ${orderId}, ${String(b.id)}, ${take}, ${unitCost}, ${ts})`;

        consumed.push({ batchId: String(b.id), qty: take, unitCost });
        remaining -= take;
      }

      let uncoveredUnitCost = 0;
      if (remaining > 0) {
        const fallback = await tx<{ nabavna_cijena: number | null }[]>`
          SELECT nabavna_cijena FROM products WHERE id = ${productId}`;
        uncoveredUnitCost = n(fallback[0]?.nabavna_cijena);
        await tx`
          INSERT INTO nabavke_potrosnja (id, order_id, batch_id, quantity, unit_cost, created_at)
          VALUES (${newId("pot")}, ${orderId}, NULL, ${remaining}, ${uncoveredUnitCost}, ${ts})`;
      }

      return { consumed, uncoveredQty: Math.max(0, remaining), uncoveredUnitCost };
    });
  } catch (e) {
    console.error("[nabavke] FIFO potrošnja pala:", e);
    return null;
  }
}

/**
 * Vraća potrošnju narudžbe nazad u partije iz kojih je povučena (otkazana/
 * vraćena/obrisana narudžba) — markira reversed_at, NIKAD ne briše red
 * (revizijski trag). Partija koja je u međuvremenu postala 'neaktivno' i
 * dalje prima vraćenu količinu u preostalo (bezopasno bookkeeping — vidi
 * stockSummaryByProduct, "raspoloživo" broji SAMO status='spremno').
 */
export async function reverseConsumption(orderId: string): Promise<void> {
  try {
    await sql().begin(async (tx) => {
      const rows = await tx<Row[]>`
        SELECT id, batch_id, quantity FROM nabavke_potrosnja
         WHERE order_id = ${orderId} AND reversed_at IS NULL
         FOR UPDATE`;
      const ts = nowIso();
      for (const r of rows) {
        if (r.batch_id) {
          await tx`
            UPDATE nabavke_partije
               SET preostalo = LEAST(nabavljeno_kolicina, preostalo + ${n(r.quantity)}),
                   updated_at = ${ts}
             WHERE id = ${String(r.batch_id)}`;
        }
        await tx`UPDATE nabavke_potrosnja SET reversed_at = ${ts} WHERE id = ${String(r.id)}`;
      }
    });
  } catch (e) {
    console.error("[nabavke] Reverse potrošnje pao:", e);
  }
}

/**
 * Preusmjerava ledger potrošnje sa jedne narudžbe na drugu — koristi se
 * SAMO pri spajanju narudžbi (mergeOrders u orders/repo.ts). Spajanje
 * može kombinovati narudžbe RAZLIČITIH proizvoda (vidi komentar uz
 * mergeOrders), pa se potrošnja ne smije ponovo izračunati kao jedno
 * FIFO povlačenje za proizvod glavne narudžbe — to bi pogrešno pripisalo
 * tuđu količinu pogrešnom proizvodu. Umjesto toga: preknjiži postojeće,
 * već točne redove pod broj glavne narudžbe, ne diraj nijednu partiju.
 */
export async function reassignConsumption(
  fromOrderId: string,
  toOrderId: string
): Promise<void> {
  try {
    await sql()`
      UPDATE nabavke_potrosnja SET order_id = ${toOrderId}
       WHERE order_id = ${fromOrderId} AND reversed_at IS NULL`;
  } catch (e) {
    console.error("[nabavke] Preusmjeravanje potrošnje pri spajanju palo:", e);
  }
}
