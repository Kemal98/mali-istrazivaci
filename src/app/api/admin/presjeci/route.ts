import { NextResponse } from "next/server";
import { insertCutoff, listCutoffs } from "@/lib/orders/cutoffs";
import { str } from "@/lib/cms/sanitize";

export async function GET() {
  return NextResponse.json({ items: await listCutoffs() });
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const date = str(body.date, 10);
  if (!DATE_RE.test(date))
    return NextResponse.json({ error: "Neispravan datum." }, { status: 400 });

  const item = await insertCutoff(date, str(body.note, 300));
  return NextResponse.json({ item });
}
