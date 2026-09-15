import { NextResponse } from "next/server";
import { getProduct, listTemplates, saveTemplate } from "@/lib/cms/repo";
import { bool, sanitizeHero, sanitizeSections, str } from "@/lib/cms/sanitize";

export async function GET() {
  return NextResponse.json({ templates: await listTemplates() });
}

/** Snimi šablon — ili iz poslanih sekcija, ili iz postojećeg proizvoda. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const naziv = str(body?.naziv, 80) || "Novi šablon";

  if (body?.fromProductId) {
    const p = await getProduct(str(body.fromProductId, 64));
    if (!p) return NextResponse.json({ error: "Nema proizvoda." }, { status: 404 });
    const t = await saveTemplate({
      id: body.id ? str(body.id, 64) : undefined,
      naziv,
      hero: p.hero,
      sections: p.sections,
      isDefault: bool(body.isDefault),
    });
    return NextResponse.json({ template: t });
  }

  const t = await saveTemplate({
    id: body.id ? str(body.id, 64) : undefined,
    naziv,
    hero: sanitizeHero(body.hero),
    sections: sanitizeSections(body.sections),
    isDefault: bool(body.isDefault),
  });
  return NextResponse.json({ template: t });
}
