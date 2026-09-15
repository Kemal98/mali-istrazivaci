import { NextResponse } from "next/server";
import {
  createReview,
  getProduct,
  listReviews,
  reorderReviews,
} from "@/lib/cms/repo";
import { bool, mediaUrl, num, str } from "@/lib/cms/sanitize";

export async function GET(request: Request) {
  const pid = new URL(request.url).searchParams.get("productId");
  const reviews = pid ? await listReviews(pid) : await listReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  // product_id ima FK na products — nepostojeći id bi bio greška iz baze,
  // pa se provjerava ovdje i vraća jasna poruka na bosanskom.
  const productId = body.productId ? str(body.productId, 64) : null;
  if (productId && !(await getProduct(productId))) {
    return NextResponse.json(
      { error: "Taj proizvod ne postoji." },
      { status: 400 }
    );
  }

  const review = await createReview({
    productId,
    ime: str(body.ime, 80),
    inicijal: str(body.inicijal, 2),
    rating: Math.min(5, Math.max(1, Number(num(body.rating) ?? 5))),
    tekst: str(body.tekst, 4000),
    verified: body.verified === undefined ? true : bool(body.verified),
    slika: mediaUrl(body.slika),
    datum: str(body.datum, 40),
    status: body.status === "hidden" ? "hidden" : "published",
  });
  return NextResponse.json({ review });
}

/** Novi redoslijed recenzija (drag & drop). */
export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.slice(0, 300).map((x: unknown) => str(x, 64)).filter(Boolean)
    : [];
  await reorderReviews(ids);
  return NextResponse.json({ ok: true });
}
