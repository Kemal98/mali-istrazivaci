import { NextResponse } from "next/server";
import { insertStockAdjustment } from "@/lib/ads/repo";
import { profitAsIfSold } from "@/lib/orders/profit";
import { sarajevoDateOnly } from "@/lib/cms/datum";
import { str } from "@/lib/cms/sanitize";

/**
 * "Presjek zaliha" — od danas, za SVE proizvode koji imaju stanje ≠ 0,
 * zatvori razliku do 0 (ili do upisanog broja ako admin zna da nešto
 * stvarno ima). Ništa se ne briše: stare nabavke i narudžbe ostaju, ovo
 * samo doda red koji je OZNAČEN kao presjek (vidi insertStockAdjustment),
 * pa ne kvari prosječnu nabavnu cijenu ni izvještaj Zarada.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { note?: string };
  const date = sarajevoDateOnly();
  const note = str(body.note, 200) || "Presjek zaliha — kreni od 0";

  const all = await profitAsIfSold({}, "2000-01-01", "2100-01-01");
  const toReset = all.rows.filter((r) => r.stock !== null && r.stock !== 0);

  const reset: { productName: string; from: number }[] = [];
  for (const r of toReset) {
    await insertStockAdjustment({
      date,
      productName: r.productName,
      quantity: -(r.stock as number),
      note,
    });
    reset.push({ productName: r.productName, from: r.stock as number });
  }

  return NextResponse.json({ ok: true, reset });
}
