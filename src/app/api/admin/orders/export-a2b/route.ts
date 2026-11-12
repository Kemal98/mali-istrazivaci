import { resolveExportOrders } from "@/lib/orders/exportSelection";
import { buildA2bWorkbook } from "@/lib/orders/a2bExport";
import { setStatusBulk } from "@/lib/orders/repo";

/**
 * Fajl za A2B "Masovni import". Datum se bira POSEBNO od filtera na
 * listi — query param `date` (jedan dan) ili `from`/`to` (raspon dana,
 * oba uključena), YYYY-MM-DD, ili tačno označene narudžbe (`ids` u
 * body-ju) — vidi resolveExportOrders. Prazno znači sve narudžbe sa
 * statusom "Nova" ili "Potvrđena", bez obzira kad su primljene.
 *
 * Izvoz ODMAH prebacuje izvezene narudžbe u status "Dostavljena"
 * (setStatusBulk, ista funkcija kao i za ručnu promjenu statusa —
 * idempotentna, ima revizijski trag). Namjerno (admin odluka
 * 2026-11-12): izvoz za A2B/Brzu poštu = gotovo, računa se kao
 * prodano/zarađeno odmah. Ako nešto zakasni/vrati se, admin to ručno
 * vrati na "Vraćeno"/"Otkazano" (uklanja se iz zarade) preko dugmića
 * u tabeli — nema zasebnog "opt-in" dugmeta, ovo je zadano ponašanje.
 */
export async function POST(request: Request) {
  const orders = await resolveExportOrders(request);

  if (!orders.length) {
    return Response.json({ error: "Nema narudžbi po ovim filterima." }, { status: 400 });
  }

  const { buffer, missingPostal } = await buildA2bWorkbook(orders);

  await setStatusBulk(orders.map((o) => o.id), "DELIVERED");

  const stamp = new Date().toISOString().slice(0, 10);
  // Buffer/BlobPart tipovi se ovdje sudare zbog Node vs DOM lib definicija
  // (ista funkcija radi ispravno u runtime-u) — cast je namjeran.
  return new Response(new Blob([buffer as unknown as BlobPart]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="A2B_Masovni_import_${stamp}.xlsx"`,
      "Cache-Control": "no-store",
      // Narudžbe bez poštanskog broja — admin ih dopisuje ručno prije
      // uploada u A2B. Čitaju ga OrderFilters.tsx/OrdersTable.tsx poslije
      // uspješnog download-a i prikazuju kao upozorenje.
      "X-Missing-Postal-Orders": missingPostal.join(","),
      "Access-Control-Expose-Headers": "X-Missing-Postal-Orders, Content-Disposition",
    },
  });
}
