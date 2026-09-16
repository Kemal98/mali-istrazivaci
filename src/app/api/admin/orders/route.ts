import { NextResponse } from "next/server";
import { countUnsynced, listOrders, type OrderSort } from "@/lib/orders/repo";
import { isOrderStatus } from "@/lib/orders/types";

// Zaštićeno preko proxy.ts (matcher /api/admin/:path*) — bez validne
// admin sesije se ovdje ne stiže.

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;

  const statusRaw = p.get("status") ?? "ALL";
  const sortRaw = p.get("sort") ?? "newest";

  const res = await listOrders({
    search: p.get("q") ?? undefined,
    status: isOrderStatus(statusRaw) ? statusRaw : "ALL",
    from: p.get("from") ?? undefined,
    to: p.get("to") ?? undefined,
    product: p.get("product") ?? undefined,
    city: p.get("city") ?? undefined,
    unsyncedOnly: p.get("unsynced") === "1",
    sort: (["newest", "oldest", "highest", "lowest"] as OrderSort[]).includes(
      sortRaw as OrderSort
    )
      ? (sortRaw as OrderSort)
      : "newest",
    page: Number(p.get("page") ?? 1),
    perPage: Number(p.get("perPage") ?? 25),
  });

  return NextResponse.json({ ...res, unsynced: await countUnsynced() });
}
