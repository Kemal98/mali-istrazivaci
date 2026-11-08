import { NextResponse } from "next/server";
import { getBatch, setBatchDocument } from "@/lib/nabavke/repo";
import { newId } from "@/lib/cms/db";
import { uploadToStorage, removeFromStorage } from "@/lib/cms/storage";

// Poseban whitelist od media/route.ts (slike proizvoda) — ovdje su u
// pitanju skenovi/fotografije ulaznih dokumenata, PDF uključen.
const ALLOWED: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const batch = await getBatch(id);
  if (!batch) return NextResponse.json({ error: "Partija nije pronađena." }, { status: 404 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Neispravan upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nije poslan fajl." }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: `Nedozvoljen tip fajla (${file.type || "nepoznat"}) — dozvoljeno: PDF, JPG, PNG.` },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Fajl je ${(file.size / 1024 / 1024).toFixed(1)} MB — limit je 4 MB.` },
      { status: 400 }
    );
  }

  try {
    const key = `nabavke/${id}/${newId()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadToStorage(key, buf, file.type);

    const prevKey = batch.dokumentUrl;
    await setBatchDocument(id, url);
    // Stari fajl se briše tek NAKON što je novi uspješno upisan u bazu —
    // da greška na pola puta nikad ne ostavi partiju bez ikakvog dokumenta.
    if (prevKey) await removeFromStorage(extractKey(prevKey)).catch(() => {});

    return NextResponse.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Greška pri uploadu.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const batch = await getBatch(id);
  if (!batch) return NextResponse.json({ error: "Partija nije pronađena." }, { status: 404 });
  if (batch.dokumentUrl) await removeFromStorage(extractKey(batch.dokumentUrl)).catch(() => {});
  await setBatchDocument(id, null);
  return NextResponse.json({ ok: true });
}

function extractKey(url: string): string {
  const marker = "/object/public/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  // .../object/public/<bucket>/<key> — key je sve nakon imena bucketa
  const rest = url.slice(i + marker.length);
  const slash = rest.indexOf("/");
  return slash === -1 ? rest : rest.slice(slash + 1);
}
