"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Row {
  productName: string;
  stock: number;
}

/**
 * "Presjek zaliha" — za sve proizvode sa stanjem ≠ 0 doda poravnanje do 0
 * (vidi /api/admin/nabavke/presjek i insertStockAdjustment u ads/repo.ts).
 * Ništa se ne briše — stare nabavke/narudžbe ostaju, ovo je novi red u
 * istoj tabeli, datiran danas, pa "Na stanju" od danas kreće od 0.
 */
export default function StockCutoffButton({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    const spisak = rows
      .map((r) => `${r.productName}: ${r.stock > 0 ? "+" : ""}${r.stock}`)
      .join("\n");
    if (
      !window.confirm(
        `Presjek zaliha — od danas "Na stanju" kreće od 0 za ${rows.length} ` +
          `${rows.length === 1 ? "proizvod" : "proizvoda"}:\n\n${spisak}\n\n` +
          `Stare nabavke i narudžbe OSTAJU (ništa se ne briše), ovo samo zatvara ` +
          `trenutnu razliku. Nastaviti?`
      )
    )
      return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/nabavke/presjek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Presjek zaliha — kreni od 0" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || "Greška pri presjeku.");
        return;
      }
      setMsg(`Gotovo — ${data.reset?.length ?? 0} proizvoda sad ima "Na stanju" = 0.`);
      router.refresh();
    } catch {
      setMsg("Nema veze sa internetom. Pokušajte ponovo.");
    } finally {
      setBusy(false);
    }
  }

  if (!rows.length) return null;

  return (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      <button type="button" className="adm-btn adm-btn-danger" onClick={run} disabled={busy}>
        {busy ? "Radim presjek…" : "📐 PRESJEK ZALIHA — KRENI OD 0"}
      </button>
      <p className="adm-hint" style={{ margin: 0 }}>
        Za sve proizvode iznad: od danas &bdquo;Na stanju&rdquo; postaje 0. Stare nabavke i
        narudžbe ostaju netaknute.
      </p>
      {msg ? <div className="adm-note adm-note-ok">{msg}</div> : null}
    </div>
  );
}
