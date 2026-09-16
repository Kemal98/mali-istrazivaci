import { NextResponse, after } from "next/server";
import { createOrder, syncOrderToSheet } from "@/lib/orders/service";

/**
 * JAVNI endpoint — ovo checkout forma zove kad kupac pošalje narudžbu.
 *
 * Namjerno NIJE pod /api/admin/, jer proxy.ts štiti samo /admin/* i
 * /api/admin/*. Ovo je jedina ruta vezana za narudžbe koja smije biti
 * dostupna bez prijave, i zato ima svoju zaštitu u service.ts:
 * validaciju, honeypot, rate limit po telefonu i IP-u, i idempotency
 * ključ protiv duplog klika.
 *
 * Google Apps Script URL se od sada nalazi SAMO na serveru (sheets.ts).
 * Prije ove izmjene je bio u klijentskom bundleu, pa je svako mogao
 * slati lažne redove direktno u tabelu.
 *
 * Upis u Google Sheet ide kroz after(): narudžba se snimi u bazu, kupac
 * ODMAH dobije potvrdu, a sinhronizacija sa tabelom se odvija nakon što
 * je odgovor poslan. Razlog: Apps Script zna odgovarati i 9 sekundi, a
 * Vercel ubija funkciju nakon 10 — čekanje bi obaralo narudžbe koje su
 * već uspjele i bez potrebe držalo kupca na ekranu.
 */

function clientIp(request: Request): string {
  // Vercel postavlja x-forwarded-for; prvi unos je stvarni klijent
  const fwd = request.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Neispravan zahtjev." }, { status: 400 });
  }

  try {
    const res = await createOrder({
      idempotencyKey: String(body.idempotencyKey ?? ""),
      customerName: String(body.customerName ?? ""),
      phone: String(body.phone ?? ""),
      address: String(body.address ?? ""),
      city: String(body.city ?? ""),
      email: body.email ? String(body.email) : "",
      postalCode: body.postalCode ? String(body.postalCode) : "",
      note: body.note ? String(body.note) : "",
      productId: body.productId ? String(body.productId) : null,
      productName: String(body.productName ?? ""),
      quantity: Number(body.quantity ?? 1),
      unitPrice: Number(body.unitPrice ?? 0),
      shippingPrice: Number(body.shippingPrice ?? 0),
      // prolazi kroz do Apps Scripta nepromijenjeno (Meta CAPI dedup)
      sheetExtras:
        body.sheetExtras && typeof body.sheetExtras === "object"
          ? (body.sheetExtras as Record<string, unknown>)
          : {},
      attribution:
        body.attribution && typeof body.attribution === "object"
          ? (body.attribution as Record<string, string>)
          : {},
      honeypot: body.honeypot ? String(body.honeypot) : "",
      clientIp: clientIp(request),
    });

    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: res.status });
    }

    // Sheet se puni tek nakon što kupac dobije odgovor. Ponovni pokušaj
    // (duplicate) se NE sinhronizuje opet — red je već upisan prvi put.
    if (!res.duplicate) {
      const { order } = res;
      const extras =
        body.sheetExtras && typeof body.sheetExtras === "object"
          ? (body.sheetExtras as Record<string, unknown>)
          : {};
      after(async () => {
        try {
          await syncOrderToSheet(order, extras);
        } catch (e) {
          console.error("[orders] after() sync pao:", e);
        }
      });
    }

    return NextResponse.json({
      ok: true,
      orderNumber: res.order.orderNumber,
      duplicate: res.duplicate,
    });
  } catch (e) {
    // Ovdje se stiže samo ako je baza nedostupna. Tada narudžba stvarno
    // nije sačuvana nigdje, pa kupac MORA vidjeti grešku i pokušati
    // ponovo (ili nam pisati) — tiho gubljenje bi bilo gore.
    console.error("[orders] createOrder pao:", e);
    return NextResponse.json(
      {
        error:
          "Greška pri slanju narudžbe. Pokušajte ponovo ili nam pišite na " +
          "svijetistrazivaca@gmail.com.",
      },
      { status: 500 }
    );
  }
}
