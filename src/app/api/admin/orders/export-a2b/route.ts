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
 * Izvoz SAM po sebi NE mijenja status narudžbi (ranije je automatski
 * prebacivao u "Potvrđena" — admin to eksplicitno nije htio). Umjesto
 * da se ta stara, neželjena automatika vrati, dodano je POSEBNO,
 * eksplicitno opt-in: `?markShipped=1` u query-ju (zove ga drugo dugme
 * u OrdersTable.tsx, "A2B TABELA + OZNAČI POSLANO") — tek TADA se
 * izvezene narudžbe prebace u "Poslana" (setStatusBulk, ista funkcija
 * koja se koristi i za ručnu promjenu statusa — idempotentna, ima
 * revizijski trag).
 */
export async function POST(request: Request) {
  const markShipped = new URL(request.url).searchParams.get("markShipped") === "1";
  const orders = await resolveExportOrders(request);

  if (!orders.length) {
    return Response.json({ error: "Nema narudžbi po ovim filterima." }, { status: 400 });
  }

  const { buffer, missingPostal } = await buildA2bWorkbook(orders);

  if (markShipped) {
    await setStatusBulk(orders.map((o) => o.id), "SHIPPED");
  }

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
