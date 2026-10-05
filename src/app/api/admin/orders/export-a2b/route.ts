import { listOrdersByIds, listOrdersForExport, setStatusBulk } from "@/lib/orders/repo";
import { str } from "@/lib/cms/sanitize";
import { buildA2bWorkbook } from "@/lib/orders/a2bExport";
import { isOrderStatus, type OrderStatus } from "@/lib/orders/types";
import { sarajevoStartOfDay } from "@/lib/cms/datum";

/**
 * Fajl za A2B "Masovni import". Datum se bira POSEBNO od filtera na
 * listi (query param `date`, YYYY-MM-DD) — prazno znači sve narudžbe sa
 * statusom "Nova", bez obzira kad su primljene.
 *
 * Granica dana se računa po Sarajevu (sarajevoStartOfDay), ne po
 * vremenskoj zoni servera (Vercel je u UTC-u) — ista greška je ranije
 * pravila problem na dashboardu, vidi sarajevoStartOfDay komentar.
 *
 * POST (ne GET): izvoz ima nuspojavu — izvezene narudžbe prelaze u status
 * "Potvrđena", da se isti dan slučajno ne izvezu dvaput u A2B.
 */
// Podrazumijevano uzima i "Nova" i "Potvrđena" — narudžbe se često
// ručno potvrde u adminu (ili kroz "Narudžba van sajta") prije nego što
// stvarno odu kuriru, pa strogo samo "Nova" ostavlja te narudžbe da se
// nikad ne izvezu.
const DEFAULT_STATUSES: OrderStatus[] = ["NEW", "CONFIRMED"];

export async function POST(request: Request) {
  const p = new URL(request.url).searchParams;

  // Ručno označene narudžbe (checkbox u tabeli) idu u body, ne u query —
  // imaju prednost nad filterima dolje, admin bira TAČNO te, bez obzira
  // na datum/status koji trenutno piše u listi.
  const body = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.slice(0, 500).map((x: unknown) => str(x, 64)).filter(Boolean)
    : [];

  let orders;
  if (ids.length) {
    orders = await listOrdersByIds(ids);
  } else {
    const statusRaw = p.get("status") ?? "";
    const dateStr = p.get("date") ?? "";

    let from: string | undefined;
    let to: string | undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      // Podne kao sidro (ne ponoć) da se izbjegnu rubni slučajevi oko same
      // granice dana pri računanju offseta u sarajevoStartOfDay.
      const anchor = new Date(`${dateStr}T12:00:00.000Z`);
      const nextAnchor = new Date(anchor.getTime() + 24 * 3600 * 1000);
      from = sarajevoStartOfDay(anchor).toISOString();
      to = new Date(sarajevoStartOfDay(nextAnchor).getTime() - 1).toISOString();
    }

    orders = await listOrdersForExport({
      search: p.get("q") ?? undefined,
      status: isOrderStatus(statusRaw) ? statusRaw : "ALL",
      statusIn: isOrderStatus(statusRaw) ? undefined : DEFAULT_STATUSES,
      from,
      to,
      product: p.get("product") ?? undefined,
      city: p.get("city") ?? undefined,
      unsyncedOnly: p.get("unsynced") === "1",
    });
  }

  if (!orders.length) {
    return Response.json({ error: "Nema narudžbi po ovim filterima." }, { status: 400 });
  }

  const buf = buildA2bWorkbook(orders);
  await setStatusBulk(orders.map((o) => o.id), "CONFIRMED");

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
