import { listOrdersByIds, listOrdersForExport } from "@/lib/orders/repo";
import { str } from "@/lib/cms/sanitize";
import { buildA2bWorkbook } from "@/lib/orders/a2bExport";
import { isOrderStatus, type OrderStatus } from "@/lib/orders/types";
import { sarajevoStartOfDay } from "@/lib/cms/datum";

/**
 * Fajl za A2B "Masovni import". Datum se bira POSEBNO od filtera na
 * listi — query param `date` (jedan dan) ili `from`/`to` (raspon dana,
 * oba uključena), YYYY-MM-DD. Prazno znači sve narudžbe sa statusom
 * "Nova" ili "Potvrđena", bez obzira kad su primljene.
 *
 * Granica dana se računa po Sarajevu (sarajevoStartOfDay), ne po
 * vremenskoj zoni servera (Vercel je u UTC-u) — ista greška je ranije
 * pravila problem na dashboardu, vidi sarajevoStartOfDay komentar.
 *
 * Izvoz NE mijenja status narudžbi (ranije je prebacivao u "Potvrđena" —
 * admin to eksplicitno ne želi, sam bira koje narudžbe izvozi preko
 * checkboxa, pa automatska promjena statusa samo smeta).
 */
function sarajevoDayStart(dateStr: string): string {
  // Podne kao sidro (ne ponoć) da se izbjegnu rubni slučajevi oko same
  // granice dana pri računanju offseta u sarajevoStartOfDay.
  return sarajevoStartOfDay(new Date(`${dateStr}T12:00:00.000Z`)).toISOString();
}
function sarajevoDayEnd(dateStr: string): string {
  const next = new Date(`${dateStr}T12:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return new Date(sarajevoStartOfDay(next).getTime() - 1).toISOString();
}
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
    const fromStr = p.get("from") ?? "";
    const toStr = p.get("to") ?? "";

    let from: string | undefined;
    let to: string | undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      from = sarajevoDayStart(dateStr);
      to = sarajevoDayEnd(dateStr);
    } else {
      if (/^\d{4}-\d{2}-\d{2}$/.test(fromStr)) from = sarajevoDayStart(fromStr);
      if (/^\d{4}-\d{2}-\d{2}$/.test(toStr)) to = sarajevoDayEnd(toStr);
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
