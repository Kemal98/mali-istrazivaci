import { NextResponse, after } from "next/server";
import { createManualOrder, syncOrderToSheet } from "@/lib/orders/service";

/** Ručni unos narudžbe u adminu (Messenger, Viber, telefon…). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const res = await createManualOrder({
    customerName: String(body.customerName ?? ""),
    phone: String(body.phone ?? ""),
    address: String(body.address ?? ""),
    city: String(body.city ?? ""),
    productId: body.productId ? String(body.productId) : null,
    productName: String(body.productName ?? ""),
    quantity: Number(body.quantity ?? 1),
    unitPrice: Number(body.unitPrice ?? 0),
    shippingPrice: Number(body.shippingPrice ?? 0),
    note: body.note ? String(body.note) : "",
    channel: body.channel ? String(body.channel) : "messenger",
  });

  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: res.status });
  }

  const { order } = res;
  after(async () => {
    try {
      await syncOrderToSheet(order);
    } catch (e) {
      console.error("[admin orders] Sheet sync pao:", e);
    }
  });

  return NextResponse.json({ order });
}
