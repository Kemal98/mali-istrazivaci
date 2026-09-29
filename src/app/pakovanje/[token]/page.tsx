import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { timingSafeEqualStr } from "@/lib/cms/auth";
import { listPackingQueue } from "@/lib/orders/repo";

/**
 * Lista za pakovanje — BEZ logina, namjerno.
 *
 * Ovo NIJE dio /admin/* (proxy.ts ga zato i ne štiti), jer treba biti
 * jednostavno kao otvaranje sačuvane prečice na telefonu, bez lozinke.
 * Zaštita je token u samom URL-u (PACKING_LIST_TOKEN) — dovoljno za
 * "neko slučajno ne naiđe na ovo", ne i za pravu autentifikaciju, pa
 * stranica namjerno pokazuje samo ime kupca i naziv proizvoda — ništa
 * osjetljivo (telefon, adresu, cijenu).
 *
 * Nema sopstveni <html>/<body> — koristi zajednički src/app/layout.tsx
 * kao i svaka druga stranica na sajtu.
 *
 * Uvijek svježe (force-dynamic): otvara se jednom dnevno, mora pokazati
 * trenutno stanje, ne keširanu stranicu.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Za pakovanje",
  robots: { index: false, follow: false },
};

export default async function PackingListPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ od?: string }>;
}) {
  const { token } = await params;
  const expected = process.env.PACKING_LIST_TOKEN;
  if (!expected || !timingSafeEqualStr(token, expected)) notFound();

  const sp = await searchParams;
  const fromDate = /^\d{4}-\d{2}-\d{2}$/.test(sp.od ?? "") ? sp.od : undefined;
  const items = await listPackingQueue(fromDate);

  const today = new Intl.DateTimeFormat("bs-BA", {
    timeZone: "Europe/Sarajevo",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div
      style={{
        margin: 0,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "#fafafa",
        color: "#14161a",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px 60px" }}>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 15,
            color: "#6b7280",
            textTransform: "capitalize",
          }}
        >
          {today}
        </p>
        <h1 style={{ margin: "0 0 16px", fontSize: 26, fontWeight: 800 }}>
          Za pakovanje ({items.length})
        </h1>

        <form
          method="get"
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontSize: 13, color: "#6b7280" }}>
            Prikaži od datuma
            <input
              type="date"
              name="od"
              defaultValue={fromDate ?? ""}
              style={{
                display: "block",
                marginTop: 4,
                padding: "8px 10px",
                fontSize: 15,
                border: "1px solid #e3e5e9",
                borderRadius: 8,
              }}
            />
          </label>
          <button
            type="submit"
            style={{
              padding: "9px 16px",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              borderRadius: 8,
              background: "#14161a",
              color: "#fff",
            }}
          >
            PRIKAŽI
          </button>
          {fromDate ? (
            <a
              href="?"
              style={{ fontSize: 13, color: "#6b7280", padding: "9px 4px" }}
            >
              prikaži sve
            </a>
          ) : null}
        </form>

        {items.length === 0 ? (
          <p style={{ fontSize: 19, color: "#6b7280" }}>
            Nema ništa za pakovanje trenutno. 🎉
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {items.map((it, i) => (
              <li
                key={`${it.orderNumber}-${i}`}
                style={{
                  background: "#fff",
                  border: "1px solid #e3e5e9",
                  borderRadius: 12,
                  padding: "16px 18px",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.3 }}>
                  {it.customerName}
                </div>
                <div style={{ fontSize: 18, marginTop: 4, color: "#333" }}>
                  {it.productName}
                  {it.quantity > 1 ? (
                    <b style={{ color: "#e0632a" }}> × {it.quantity}</b>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p style={{ marginTop: 28, fontSize: 13, color: "#9aa0aa" }}>
          Otvori ponovo sutra za novu listu — ažurira se sama.
        </p>
      </div>
    </div>
  );
}
