import { NextResponse } from "next/server";
import { deleteManualSale } from "@/lib/orders/repo";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await deleteManualSale(id);
  return NextResponse.json({ ok: true });
}
