import { NextResponse } from "next/server";
import { deletePurchase } from "@/lib/ads/repo";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await deletePurchase(id);
  return NextResponse.json({ ok: true });
}
