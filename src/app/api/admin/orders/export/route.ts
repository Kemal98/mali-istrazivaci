import { listOrdersForExport } from "@/lib/orders/repo";
import { ordersToCsv } from "@/lib/orders/csv";
import { isOrderStatus } from "@/lib/orders/types";

/**
 * CSV export TRENUTNO FILTRIRANIH narudžbi — isti filteri kao lista, pa
 * ako je u adminu izabrano "Dostavljene, 01.09–30.09", u fajlu su tačno
 * te narudžbe.
 */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const statusRaw = p.get("status") ?? "ALL";

  const orders = await listOrdersForExport({
    search: p.get("q") ?? undefined,
    status: isOrderStatus(statusRaw) ? statusRaw : "ALL",
    from: p.get("from") ?? undefined,
    to: p.get("to") ?? undefined,
    product: p.get("product") ?? undefined,
    city: p.get("city") ?? undefined,
    unsyncedOnly: p.get("unsynced") === "1",
  });

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(ordersToCsv(orders), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="narudzbe-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
