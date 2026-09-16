import { NextResponse } from "next/server";
import { getOrder, setStatusBulk } from "@/lib/orders/repo";
import { retrySheetSync } from "@/lib/orders/service";
import { isOrderStatus } from "@/lib/orders/types";
import { str } from "@/lib/cms/sanitize";

/** Grupne akcije nad označenim narudžbama. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.slice(0, 500).map((x: unknown) => str(x, 64)).filter(Boolean)
    : [];
  if (!ids.length)
    return NextResponse.json(
      { error: "Nije označena ni jedna narudžba." },
      { status: 400 }
    );

  const action = str(body?.action, 30);

  if (action === "status") {
    if (!isOrderStatus(body.status))
      return NextResponse.json({ error: "Nepoznat status." }, { status: 400 });
    const changed = await setStatusBulk(ids, body.status);
    return NextResponse.json({ ok: true, changed });
  }

  if (action === "retry-sheet") {
    let ok = 0;
    let failed = 0;
    for (const id of ids) {
      const order = await getOrder(id);
      if (!order) continue;
      const res = await retrySheetSync(order);
      if (res.ok) ok++;
      else failed++;
    }
    return NextResponse.json({ ok: true, synced: ok, failed });
  }

  return NextResponse.json({ error: "Nepoznata akcija." }, { status: 400 });
}
