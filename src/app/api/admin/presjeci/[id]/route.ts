import { NextResponse } from "next/server";
import { deleteCutoff } from "@/lib/orders/cutoffs";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await deleteCutoff(id);
  return NextResponse.json({ ok: true });
}
