import { NextResponse } from "next/server";
import {
  addDeliveryIssue,
  deleteOrder,
  getOrder,
  listEvents,
  setCustomerInfo,
  setShipping,
  setStatus,
} from "@/lib/orders/repo";
import { retrySheetSync } from "@/lib/orders/service";
import { DELIVERY_ISSUE_REASONS, isOrderStatus } from "@/lib/orders/types";
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

  if (
    body.customerName !== undefined ||
    body.phone !== undefined ||
    body.address !== undefined ||
    body.city !== undefined
  ) {
    order = await setCustomerInfo(id, {
      customerName:
        body.customerName !== undefined ? str(body.customerName, 150) : undefined,
      phone: body.phone !== undefined ? str(body.phone, 40) : undefined,
      address: body.address !== undefined ? str(body.address, 300) : undefined,
      city: body.city !== undefined ? str(body.city, 80) : undefined,
    });
  }

  return NextResponse.json({ order, events: await listEvents(id) });
}

/** action: retry-sheet | add-delivery-issue */
export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = str(body?.action, 30);

  const order = await getOrder(id);
  if (!order)
    return NextResponse.json({ error: "Nema narudžbe." }, { status: 404 });

  if (action === "add-delivery-issue") {
    const reason = str(body?.reason, 40);
    if (!(DELIVERY_ISSUE_REASONS as readonly string[]).includes(reason)) {
      return NextResponse.json({ error: "Nepoznat razlog." }, { status: 400 });
    }
    await addDeliveryIssue(
      id,
      reason as (typeof DELIVERY_ISSUE_REASONS)[number],
      str(body?.note, 500)
    );
    return NextResponse.json({ ok: true, events: await listEvents(id) });
  }

  if (action !== "retry-sheet") {
    return NextResponse.json({ error: "Nepoznata akcija." }, { status: 400 });
  }

  const res = await retrySheetSync(order);
  return NextResponse.json({
    ok: res.ok,
    error: res.error,
    order: await getOrder(id),
  });
}

/** Briše narudžbu (npr. greškom upisana) — vidi deleteOrder u repo.ts. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const deleted = await deleteOrder(id);
  if (!deleted)
    return NextResponse.json({ error: "Nema narudžbe." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
