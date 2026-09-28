import { listOrdersForExport, setStatusBulk } from "@/lib/orders/repo";
import { buildA2bWorkbook } from "@/lib/orders/a2bExport";
import { isOrderStatus } from "@/lib/orders/types";

/**
 * Fajl za A2B "Masovni import" — isti filteri kao lista narudžbi (status,
 * datum, grad, proizvod, pretraga), pa "Danas" + status "Nova" izveze baš
 * dnevne rezervacije, a bez filtera izveze SVE nove bez obzira na datum.
 *
 * POST (ne GET): izvoz ima nuspojavu — izvezene narudžbe prelaze u status
 * "Potvrđena", da se isti dan slučajno ne izvezu dvaput u A2B.
 */
export async function POST(request: Request) {
  const p = new URL(request.url).searchParams;
  const statusRaw = p.get("status") ?? "NEW";

  const orders = await listOrdersForExport({
    search: p.get("q") ?? undefined,
    status: isOrderStatus(statusRaw) ? statusRaw : "ALL",
    from: p.get("from") ?? undefined,
    to: p.get("to") ?? undefined,
    product: p.get("product") ?? undefined,
    city: p.get("city") ?? undefined,
    unsyncedOnly: p.get("unsynced") === "1",
  });

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
