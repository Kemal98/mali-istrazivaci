import { NextResponse } from "next/server";
import { deleteAdSpend } from "@/lib/ads/repo";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await deleteAdSpend(id);
  return NextResponse.json({ ok: true });
}
