import "server-only";
import { listOrdersByIds, listOrdersForExport } from "./repo";
import { isOrderStatus, type Order, type OrderStatus } from "./types";
import { sarajevoStartOfDay } from "@/lib/cms/datum";
import { str } from "@/lib/cms/sanitize";

/**
 * Dijeljena logika iza "koje narudžbe izvoziti" — ista za A2B i za
 * listu za pakovanje: ili tačno označene (checkbox, `ids` u body-ju),
 * ili po datumu/filterima iz query stringa. Jedno mjesto za ovo da se
 * izvoz za kurira i izvoz za pakovanje NIKAD ne razmimoiđu oko toga šta
 * znači "od/do datuma" ili "koji statusi".
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

// Podrazumijevano uzima i "Nova" i "Potvrđena" — narudžbe se često ručno
// potvrde u adminu (ili kroz "Narudžba van sajta") prije nego što stvarno
// odu kuriru, pa strogo samo "Nova" ostavlja te narudžbe da se nikad ne
// izvezu.
const DEFAULT_STATUSES: OrderStatus[] = ["NEW", "CONFIRMED"];

export async function resolveExportOrders(request: Request): Promise<Order[]> {
  const p = new URL(request.url).searchParams;

  // Ručno označene narudžbe (checkbox u tabeli) idu u body, ne u query —
  // imaju prednost nad filterima dolje, admin bira TAČNO te, bez obzira
  // na datum/status koji trenutno piše u listi.
  const body = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.slice(0, 500).map((x: unknown) => str(x, 64)).filter(Boolean)
    : [];

  if (ids.length) return listOrdersByIds(ids);

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

  return listOrdersForExport({
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
