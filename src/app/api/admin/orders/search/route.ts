import { NextResponse } from "next/server";
import { listOrders } from "@/lib/orders/repo";

/**
 * Brza pretraga narudžbi za "Ne isporučeno" — admin kuca ime/broj
 * telefona/broj narudžbe, dobije par rezultata da klikne pravu osobu,
 * umjesto da prvo ide u Narudžbe pa traži ručno.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ orders: [] });

  const res = await listOrders({ search: q, sort: "newest", perPage: 8 });
  return NextResponse.json({
    orders: res.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      phone: o.phone,
      city: o.city,
      productName: o.productName,
      createdAt: o.createdAt,
    })),
  });
}
