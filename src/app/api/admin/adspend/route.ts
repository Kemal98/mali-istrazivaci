import { NextResponse } from "next/server";
import { insertAdSpend, listAdSpend } from "@/lib/ads/repo";
import { num, str } from "@/lib/cms/sanitize";

// Zaštićeno preko proxy.ts (matcher /api/admin/:path*).

export async function GET() {
  return NextResponse.json({ items: await listAdSpend() });
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const date = str(body.date, 10);
  const productName = str(body.productName, 200);
  const amount = num(body.amount);

  if (!DATE_RE.test(date))
    return NextResponse.json({ error: "Neispravan datum." }, { status: 400 });
  if (!productName)
    return NextResponse.json({ error: "Izaberite proizvod." }, { status: 400 });
  if (amount === null || amount < 0)
    return NextResponse.json({ error: "Neispravan iznos." }, { status: 400 });

  const item = await insertAdSpend({
    date,
    productName,
    amount,
    note: str(body.note, 300),
    source: "manual",
  });

  return NextResponse.json({ item });
}
