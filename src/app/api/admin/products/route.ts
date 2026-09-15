import { NextResponse } from "next/server";
import { createProduct, listProducts } from "@/lib/cms/repo";
import { str } from "@/lib/cms/sanitize";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? undefined;
  return NextResponse.json({ products: await listProducts(q || undefined) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const naziv = str(body?.naziv);
  if (!naziv.trim()) {
    return NextResponse.json(
      { error: "Upišite naziv proizvoda." },
      { status: 400 }
    );
  }
  const product = await createProduct({
    naziv,
    slug: str(body?.slug, 120),
    templateId: body?.templateId ? str(body.templateId, 64) : null,
    copyFromId: body?.copyFromId ? str(body.copyFromId, 64) : null,
  });
  return NextResponse.json({ product });
}
