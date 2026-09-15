import { NextResponse } from "next/server";
import { softDeleteMedia, updateMediaAlt } from "@/lib/cms/repo";
import { str } from "@/lib/cms/sanitize";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  await updateMediaAlt(id, str(body?.alt, 300));
  return NextResponse.json({ ok: true });
}

// Soft delete — fajl ostaje u Storage bucketu, samo se sakrije iz
// biblioteke, da se ne pokvari stranica koja ga eventualno još koristi.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await softDeleteMedia(id);
  return NextResponse.json({ ok: true });
}
