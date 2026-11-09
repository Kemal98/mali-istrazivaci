import { NextResponse } from "next/server";
import { deleteOtherCost } from "@/lib/ads/repo";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await deleteOtherCost(id);
  return NextResponse.json({ ok: true });
}
