import { NextResponse } from "next/server";
import { runImport } from "@/lib/orders/importer";

/**
 * Import starih narudžbi iz CSV-a izvučenog iz Google Sheeta.
 *
 * Zaštićeno admin sesijom (proxy.ts). Google Sheet se NE mijenja — ovo
 * samo čita fajl. Bez `commit: true` radi se DRY RUN: prikaže se šta bi
 * se uvezlo, bez ijednog upisa u bazu.
 */

const MAX_BYTES = 4 * 1024 * 1024; // Vercel limit na tijelo zahtjeva

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Neispravan upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Nije poslan CSV fajl." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: `Fajl je ${(file.size / 1024 / 1024).toFixed(1)} MB — limit je 4 MB.`,
      },
      { status: 400 }
    );
  }

  const commit = String(form.get("commit") ?? "") === "1";

  // Zamjenski datum za redove koji ga nemaju (kolona "Datum" je u nekom
  // trenutku obrisana iz tabele, pa stari redovi nemaju vrijeme).
  const rawFallback = String(form.get("fallbackDate") ?? "").trim();
  let fallbackDate: string | undefined;
  if (rawFallback) {
    const d = new Date(`${rawFallback}T12:00:00`);
    if (!Number.isNaN(d.getTime())) fallbackDate = d.toISOString();
  }

  try {
    const text = await file.text();
    const report = await runImport(text, { commit, fallbackDate });
    return NextResponse.json({ ok: true, commit, report });
  } catch (e) {
    console.error("[import] pao:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Import nije uspio." },
      { status: 500 }
    );
  }
}
