import { NextResponse } from "next/server";
import { aiImportProduct } from "@/lib/cms/aiImport";

/**
 * Zaštićeno preko proxy.ts (matcher /api/admin/:path*).
 * Slike se NAMJERNO ne diraju (vidi aiImport.ts) — samo tekst, pa nema
 * potrebe za after()-based skidanjem slika kao kod običnog uvoza.
 */
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    url?: string;
    sablon?: string;
  };
  const url = String(body.url || "").trim();
  const sablon = String(body.sablon || "").trim();
  if (!url) return NextResponse.json({ error: "Nedostaje link." }, { status: 400 });
  if (!sablon) return NextResponse.json({ error: "Nedostaje šablon." }, { status: 400 });

  const res = await aiImportProduct(url, sablon);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });

  return NextResponse.json({
    ok: true,
    productId: res.productId,
    popunjeno: res.popunjeno ?? [],
    nedostaje: res.nedostaje ?? [],
    aiError: res.aiError,
    truncated: res.truncated ?? false,
  });
}
