import { NextResponse, after } from "next/server";
import { importProductImages, startImport } from "@/lib/cms/import";

/**
 * Zaštićeno preko proxy.ts (matcher /api/admin/:path*).
 *
 * Slike se skidaju POSLIJE odgovora (after()) — do 8 slika sekvencijalno
 * lako pređe Vercelov limit za funkciju (~10s), isti problem i isto
 * rješenje kao Google Sheets sync (vidi lib/orders/service.ts). Admin
 * dobije productId odmah i ide na editor; slike se pojave par sekundi
 * kasnije kad osvježi.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { url?: string };
  const url = String(body.url || "").trim();
  if (!url) return NextResponse.json({ error: "Nedostaje link." }, { status: 400 });

  const res = await startImport(url);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });

  if (res.images?.length && res.productId) {
    const { productId, images, title } = res;
    after(async () => {
      try {
        await importProductImages(productId, images, title || "");
      } catch (e) {
        console.error("[import] skidanje slika palo:", e);
      }
    });
  }

  return NextResponse.json({
    ok: true,
    productId: res.productId,
    imagesQueued: res.images?.length ?? 0,
  });
}
