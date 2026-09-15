import { NextResponse } from "next/server";
import { deleteTemplate } from "@/lib/cms/repo";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await deleteTemplate(id);
  return NextResponse.json({ ok: true });
}
