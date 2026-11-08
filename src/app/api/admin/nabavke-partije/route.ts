import { NextResponse } from "next/server";
import { createBatch, listBatches } from "@/lib/nabavke/repo";
import { DOCUMENT_TYPES, NABAVKA_STATUSES, type DocumentType, type NabavkaStatus } from "@/lib/nabavke/types";
import { str, num } from "@/lib/cms/sanitize";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const productId = searchParams.get("productId");
  const tipDokumenta = searchParams.get("tipDokumenta");

  const items = await listBatches({
    status: status && (NABAVKA_STATUSES as readonly string[]).includes(status)
      ? (status as NabavkaStatus)
      : undefined,
    productId: productId || undefined,
    tipDokumenta:
      tipDokumenta && (DOCUMENT_TYPES as readonly string[]).includes(tipDokumenta)
        ? (tipDokumenta as DocumentType)
        : undefined,
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const productId = str(body.productId, 64);
  const datumNabavke = str(body.datumNabavke, 10);
  const nabavljenoKolicina = num(body.nabavljenoKolicina);
  const cijenaPoKomadu = num(body.cijenaPoKomadu);
  const dodatniTroskovi = num(body.dodatniTroskovi) ?? 0;
  const tipDokumenta = str(body.tipDokumenta, 20);
  const datumDokumentaRaw = str(body.datumDokumenta, 10);

  if (!productId) return NextResponse.json({ error: "Izaberite proizvod." }, { status: 400 });
  if (!DATE_RE.test(datumNabavke))
    return NextResponse.json({ error: "Neispravan datum nabavke." }, { status: 400 });
  if (nabavljenoKolicina === null || !Number.isInteger(nabavljenoKolicina) || nabavljenoKolicina <= 0)
    return NextResponse.json({ error: "Količina mora biti cijeli broj veći od 0." }, { status: 400 });
  if (cijenaPoKomadu === null || cijenaPoKomadu < 0)
    return NextResponse.json({ error: "Upiši cijenu po komadu." }, { status: 400 });
  if (!(DOCUMENT_TYPES as readonly string[]).includes(tipDokumenta))
    return NextResponse.json({ error: "Neispravan tip dokumenta." }, { status: 400 });

  const batch = await createBatch({
    productId,
    dobavljac: str(body.dobavljac, 200),
    datumNabavke,
    nabavljenoKolicina,
    cijenaPoKomadu,
    dodatniTroskovi: dodatniTroskovi < 0 ? 0 : dodatniTroskovi,
    tipDokumenta: tipDokumenta as DocumentType,
    brojDokumenta: str(body.brojDokumenta, 100),
    datumDokumenta: DATE_RE.test(datumDokumentaRaw) ? datumDokumentaRaw : null,
    napomena: str(body.napomena, 500),
  });

  return NextResponse.json({ item: batch });
}
