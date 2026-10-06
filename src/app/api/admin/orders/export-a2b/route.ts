import { resolveExportOrders } from "@/lib/orders/exportSelection";
import { buildA2bWorkbook } from "@/lib/orders/a2bExport";

/**
 * Fajl za A2B "Masovni import". Datum se bira POSEBNO od filtera na
 * listi — query param `date` (jedan dan) ili `from`/`to` (raspon dana,
 * oba uključena), YYYY-MM-DD, ili tačno označene narudžbe (`ids` u
 * body-ju) — vidi resolveExportOrders. Prazno znači sve narudžbe sa
 * statusom "Nova" ili "Potvrđena", bez obzira kad su primljene.
 *
 * Izvoz NE mijenja status narudžbi (ranije je prebacivao u "Potvrđena" —
 * admin to eksplicitno ne želi, sam bira koje narudžbe izvozi preko
 * checkboxa, pa automatska promjena statusa samo smeta).
 */
export async function POST(request: Request) {
  const orders = await resolveExportOrders(request);

  if (!orders.length) {
    return Response.json({ error: "Nema narudžbi po ovim filterima." }, { status: 400 });
  }

  const buf = buildA2bWorkbook(orders);

  const stamp = new Date().toISOString().slice(0, 10);
  // Buffer/BlobPart tipovi se ovdje sudare zbog Node vs DOM lib definicija
  // (ista funkcija radi ispravno u runtime-u) — cast je namjeran.
  return new Response(new Blob([buf as unknown as BlobPart]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="a2b-masovni-import-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
