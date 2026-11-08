import { NextResponse } from "next/server";
import { insertCorrection, listCorrections } from "@/lib/nabavke/repo";
import { KOREKCIJA_VRSTE, type KorekcijaVrsta } from "@/lib/nabavke/types";
import { str, num } from "@/lib/cms/sanitize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") || undefined;
  return NextResponse.json({ items: await listCorrections(productId) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const productId = str(body.productId, 64);
  const vrsta = str(body.vrsta, 20);
  const kolicina = num(body.kolicina);
  const razlog = str(body.razlog, 500);
  const batchId = str(body.batchId, 64);
  const cijenaPoKomaduProcjena = num(body.cijenaPoKomaduProcjena);

  if (!productId) return NextResponse.json({ error: "Izaberite proizvod." }, { status: 400 });
  if (!(KOREKCIJA_VRSTE as readonly string[]).includes(vrsta))
    return NextResponse.json({ error: "Neispravna vrsta korekcije." }, { status: 400 });
  if (kolicina === null || !Number.isInteger(kolicina) || kolicina <= 0)
    return NextResponse.json({ error: "Količina mora biti cijeli broj veći od 0." }, { status: 400 });
  if (!razlog.trim())
    return NextResponse.json({ error: "Razlog je obavezan." }, { status: 400 });

  const result = await insertCorrection({
    productId,
    vrsta: vrsta as KorekcijaVrsta,
    kolicina,
    razlog,
    batchId: batchId || undefined,
    cijenaPoKomaduProcjena: cijenaPoKomaduProcjena ?? undefined,
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ korekcija: result.korekcija, novaPartija: result.novaPartija });
}
