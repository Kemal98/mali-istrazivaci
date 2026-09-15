import { NextResponse } from "next/server";
import { getProduct, softDeleteReview, updateReview } from "@/lib/cms/repo";
import { bool, mediaUrl, num, str } from "@/lib/cms/sanitize";
import type { Review } from "@/lib/cms/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const patch: Partial<Review> = {};
  if (body.productId !== undefined) {
    const pid = body.productId ? str(body.productId, 64) : null;
    if (pid && !(await getProduct(pid))) {
      return NextResponse.json(
        { error: "Taj proizvod ne postoji." },
        { status: 400 }
      );
    }
    patch.productId = pid;
  }
  if (body.ime !== undefined) patch.ime = str(body.ime, 80);
  if (body.inicijal !== undefined) patch.inicijal = str(body.inicijal, 2);
  if (body.rating !== undefined)
    patch.rating = Math.min(5, Math.max(1, Number(num(body.rating) ?? 5)));
  if (body.tekst !== undefined) patch.tekst = str(body.tekst, 4000);
  if (body.verified !== undefined) patch.verified = bool(body.verified);
  if (body.slika !== undefined) patch.slika = mediaUrl(body.slika);
  if (body.datum !== undefined) patch.datum = str(body.datum, 40);
  if (body.status !== undefined)
    patch.status = body.status === "hidden" ? "hidden" : "published";
  await updateReview(id, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await softDeleteReview(id);
  return NextResponse.json({ ok: true });
}
