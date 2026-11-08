import { listBatches } from "@/lib/nabavke/repo";
import { partijeToCsv } from "@/lib/nabavke/csv";
import { DOCUMENT_TYPES, NABAVKA_STATUSES, type DocumentType, type NabavkaStatus } from "@/lib/nabavke/types";

/** CSV izvoz za knjigovođu — isti filteri kao stranica (status/proizvod/tip dokumenta). */
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const status = p.get("status");
  const productId = p.get("productId");
  const tipDokumenta = p.get("tipDokumenta");

  const items = await listBatches({
    status: status && (NABAVKA_STATUSES as readonly string[]).includes(status)
      ? (status as NabavkaStatus)
      : undefined,
    productId: productId || undefined,
    tipDokumenta:
      tipDokumenta && (DOCUMENT_TYPES as readonly string[]).includes(tipDokumenta)
        ? (tipDokumenta as DocumentType)
        : undefined,
    limit: 5000,
  });

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(partijeToCsv(items), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nabavke-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
