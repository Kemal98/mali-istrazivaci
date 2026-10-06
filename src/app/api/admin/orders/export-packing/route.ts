import { resolveExportOrders } from "@/lib/orders/exportSelection";
import { buildPackingWorkbook } from "@/lib/orders/a2bExport";

/**
 * Fajl za OSOBE KOJE PAKUJU — ISTA selekcija narudžbi kao A2B izvoz
 * (resolveExportOrders: checkbox ili datum), ali druga tabela: A2B
 * tabela nema nikakav podatak o proizvodu (kurira ne zanima šta je u
 * paketu), a paker treba tačno to — vidi buildPackingWorkbook.
 */
export async function POST(request: Request) {
  const orders = await resolveExportOrders(request);

  if (!orders.length) {
    return Response.json({ error: "Nema narudžbi po ovim filterima." }, { status: 400 });
  }

  const buf = buildPackingWorkbook(orders);

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(new Blob([buf as unknown as BlobPart]), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="za-pakovanje-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
