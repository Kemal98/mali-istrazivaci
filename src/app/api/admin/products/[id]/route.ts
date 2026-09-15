import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  duplicateProduct,
  getProduct,
  publishProduct,
  softDeleteProduct,
  unpublishProduct,
  updateProduct,
} from "@/lib/cms/repo";
import {
  num,
  sanitizeHero,
  sanitizeSeo,
  sanitizeSections,
  str,
} from "@/lib/cms/sanitize";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return NextResponse.json({ error: "Nema proizvoda." }, { status: 404 });
  return NextResponse.json({ product });
}

/** Sprema NACRT (ne objavljuje). */
export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const patch: Parameters<typeof updateProduct>[1] = {};
  if (body.naziv !== undefined) patch.naziv = str(body.naziv);
  if (body.slug !== undefined) patch.slug = str(body.slug, 120);
  if (body.sku !== undefined) patch.sku = str(body.sku, 60);
  if (body.kategorija !== undefined) patch.kategorija = str(body.kategorija, 60);
  if (body.cijena !== undefined) patch.cijena = num(body.cijena);
  if (body.staraCijena !== undefined) patch.staraCijena = num(body.staraCijena);
  if (body.badge !== undefined) patch.badge = str(body.badge, 40);
  if (body.hero !== undefined) patch.hero = sanitizeHero(body.hero);
  if (body.seo !== undefined) patch.seo = sanitizeSeo(body.seo);
  if (body.sections !== undefined) patch.sections = sanitizeSections(body.sections);

  const product = await updateProduct(id, patch);
  if (!product) return NextResponse.json({ error: "Nema proizvoda." }, { status: 404 });
  return NextResponse.json({ product });
}

/** action: publish | unpublish | duplicate */
export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = str(body?.action, 30);

  if (action === "publish") {
    const res = await publishProduct(id);
    if (!res.ok) return NextResponse.json({ errors: res.errors }, { status: 400 });
    // Javna stranica je keširana (ISR) — nakon objave je odmah osvježi,
    // da se izmjena vidi bez čekanja i bez force-dynamic na svaki pregled.
    // "/" se osvježava i, jer se nova/skinuta kartica pojavljuje/nestaje
    // sa početne stranice (HomeProductGrid čita objavljene CMS proizvode).
    if (res.slug) {
      revalidatePath(`/${res.slug}`);
      revalidatePath("/");
    }
    return NextResponse.json({ product: await getProduct(id) });
  }

  if (action === "unpublish") {
    const slug = await unpublishProduct(id);
    if (slug) {
      revalidatePath(`/${slug}`);
      revalidatePath("/");
    }
    return NextResponse.json({ product: await getProduct(id) });
  }

  if (action === "duplicate") {
    const copy = await duplicateProduct(id);
    if (!copy) return NextResponse.json({ error: "Nema proizvoda." }, { status: 404 });
    return NextResponse.json({ product: copy });
  }

  return NextResponse.json({ error: "Nepoznata akcija." }, { status: 400 });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const slug = await softDeleteProduct(id);
  if (slug) {
    revalidatePath(`/${slug}`);
    revalidatePath("/");
  }
  return NextResponse.json({ ok: true });
}
