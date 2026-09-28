import { NextResponse } from "next/server";
import { insertManualSale, listManualSales } from "@/lib/orders/repo";
import { num, str } from "@/lib/cms/sanitize";

export async function GET() {
  return NextResponse.json({ items: await listManualSales() });
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const date = str(body.date, 10);
  const productName = str(body.productName, 200);
  const quantity = num(body.quantity);

  if (!DATE_RE.test(date))
    return NextResponse.json({ error: "Neispravan datum." }, { status: 400 });
  if (!productName)
    return NextResponse.json({ error: "Izaberite proizvod." }, { status: 400 });
  if (quantity === null || !Number.isInteger(quantity) || quantity <= 0)
    return NextResponse.json({ error: "Broj komada mora biti cijeli broj veći od 0." }, { status: 400 });

  const item = await insertManualSale({
    date,
    productName,
    quantity,
    note: str(body.note, 300),
  });
  return NextResponse.json({ item });
}
