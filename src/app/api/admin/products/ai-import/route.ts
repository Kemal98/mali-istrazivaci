import { NextResponse, after } from "next/server";
import { aiImportProduct } from "@/lib/cms/aiImport";
import { importProductImages } from "@/lib/cms/import";

/**
 * Zaštićeno preko proxy.ts (matcher /api/admin/:path*).
 * Claude poziv traje nekoliko sekundi — slike se i dalje skidaju
 * POSLIJE odgovora (after()), isti razlog kao obični "Uvezi sa linka".
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

  if (res.pending?.length && res.productId) {
    const { productId, pending, title } = res;
    after(async () => {
      try {
        await importProductImages(productId, pending, title || "");
      } catch (e) {
        console.error("[ai-import] skidanje slika palo:", e);
      }
    });
  }

  return NextResponse.json({
    ok: true,
    productId: res.productId,
    imagesQueued: res.pending?.length ?? 0,
    popunjeno: res.popunjeno ?? [],
    nedostaje: res.nedostaje ?? [],
    aiError: res.aiError,
  });
}
