import { NextResponse } from "next/server";
import { deleteBatch, getBatch, updateBatch } from "@/lib/nabavke/repo";
import { DOCUMENT_TYPES, type DocumentType } from "@/lib/nabavke/types";
import { str, num } from "@/lib/cms/sanitize";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Parameters<typeof updateBatch>[1] = {};
  if (body.dobavljac !== undefined) patch.dobavljac = str(body.dobavljac, 200);
  if (body.datumNabavke !== undefined) {
    const d = str(body.datumNabavke, 10);
    if (!DATE_RE.test(d))
      return NextResponse.json({ error: "Neispravan datum nabavke." }, { status: 400 });
    patch.datumNabavke = d;
  }
  if (body.cijenaPoKomadu !== undefined) {
    const v = num(body.cijenaPoKomadu);
    if (v === null || v < 0)
      return NextResponse.json({ error: "Neispravna cijena po komadu." }, { status: 400 });
    patch.cijenaPoKomadu = v;
  }
  if (body.dodatniTroskovi !== undefined) {
    const v = num(body.dodatniTroskovi);
    if (v === null || v < 0)
      return NextResponse.json({ error: "Neispravni dodatni troškovi." }, { status: 400 });
    patch.dodatniTroskovi = v;
  }
  if (body.tipDokumenta !== undefined) {
    const v = str(body.tipDokumenta, 20);
    if (!(DOCUMENT_TYPES as readonly string[]).includes(v))
      return NextResponse.json({ error: "Neispravan tip dokumenta." }, { status: 400 });
    patch.tipDokumenta = v as DocumentType;
  }
  if (body.brojDokumenta !== undefined) patch.brojDokumenta = str(body.brojDokumenta, 100);
  if (body.datumDokumenta !== undefined) {
    const d = str(body.datumDokumenta, 10);
    patch.datumDokumenta = DATE_RE.test(d) ? d : null;
  }
  if (body.napomena !== undefined) patch.napomena = str(body.napomena, 500);
  if (body.nabavljenoKolicina !== undefined) {
    const v = num(body.nabavljenoKolicina);
    if (v === null || !Number.isInteger(v) || v <= 0)
      return NextResponse.json({ error: "Neispravna količina." }, { status: 400 });
    patch.nabavljenoKolicina = v;
  }

  try {
    const item = await updateBatch(id, patch);
    if (!item) return NextResponse.json({ error: "Partija nije pronađena." }, { status: 404 });
    return NextResponse.json({ item });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Greška pri izmjeni.";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cur = await getBatch(id);
  if (!cur) return NextResponse.json({ error: "Partija nije pronađena." }, { status: 404 });

  const res = await deleteBatch(id);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 409 });
  return NextResponse.json({ ok: true });
}
