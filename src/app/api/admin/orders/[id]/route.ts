import { NextResponse } from "next/server";
import { getOrder, listEvents, setShipping, setStatus } from "@/lib/orders/repo";
import { retrySheetSync } from "@/lib/orders/service";
import { isOrderStatus } from "@/lib/orders/types";
import { str } from "@/lib/cms/sanitize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order)
    return NextResponse.json({ error: "Nema narudžbe." }, { status: 404 });
  return NextResponse.json({ order, events: await listEvents(id) });
}

/** Promjena statusa i/ili kurira/tracking broja. Sve ide u audit log. */
export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  let order = await getOrder(id);
  if (!order)
    return NextResponse.json({ error: "Nema narudžbe." }, { status: 404 });

  if (body.status !== undefined) {
    if (!isOrderStatus(body.status)) {
      return NextResponse.json({ error: "Nepoznat status." }, { status: 400 });
    }
    order = await setStatus(id, body.status);
  }

  if (body.courier !== undefined || body.trackingNumber !== undefined) {
    order = await setShipping(id, {
      courier: body.courier !== undefined ? str(body.courier, 80) : undefined,
      trackingNumber:
        body.trackingNumber !== undefined
          ? str(body.trackingNumber, 80)
          : undefined,
    });
  }

  return NextResponse.json({ order, events: await listEvents(id) });
}

/** action: retry-sheet — ponovni pokušaj upisa u Google Sheet. */
export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (str(body?.action, 30) !== "retry-sheet") {
    return NextResponse.json({ error: "Nepoznata akcija." }, { status: 400 });
  }

  const order = await getOrder(id);
  if (!order)
    return NextResponse.json({ error: "Nema narudžbe." }, { status: 404 });

  const res = await retrySheetSync(order);
  return NextResponse.json({
    ok: res.ok,
    error: res.error,
    order: await getOrder(id),
  });
}
