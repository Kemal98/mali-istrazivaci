import { NextResponse } from "next/server";
import { setBatchStatus } from "@/lib/nabavke/repo";
import { NABAVKA_STATUSES, type NabavkaStatus } from "@/lib/nabavke/types";
import { str } from "@/lib/cms/sanitize";

// Namjerno POSEBNA ruta od generičkog PATCH-a: promjena statusa je
// NAJOSJETLJIVIJA radnja u ovom modulu (nedokumentovana roba ne smije
// postati "spremno za prodaju" slučajnim klikom), pa ima svoj endpoint i
// svoj revizijski trag (nabavke_status_log).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const status = str(body.status, 40);
  const napomena = str(body.napomena, 500);

  if (!(NABAVKA_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "Neispravan status." }, { status: 400 });
  }

  const item = await setBatchStatus(id, status as NabavkaStatus, napomena);
  if (!item) return NextResponse.json({ error: "Partija nije pronađena." }, { status: 404 });
  return NextResponse.json({ item });
}
