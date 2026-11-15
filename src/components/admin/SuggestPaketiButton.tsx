"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Jednim klikom popuni PRIJEDLOG paketa (1/2/3 kom) za SVE proizvode koji
 * imaju cijenu, a nemaju ni jedan paket — isto što `updateProduct` radi
 * automatski za NOVE proizvode, samo ovdje za sve odjednom (vidi
 * suggestPaketiForAllProducts u cms/repo.ts). Ugašeno po proizvodu —
 * admin i dalje sam pregleda i uključuje svaki prije nego ide uživo.
 */
export default function SuggestPaketiButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [poruka, setPoruka] = useState("");

  async function pokreni() {
    if (
      !window.confirm(
        "Popuniti prijedlog paketa (1 / 2 / 3 kom) za sve proizvode koji još nemaju paket? Ništa ne ide uživo — i dalje sam uključuješ paket po proizvodu kad pregledaš."
      )
    )
      return;
    setBusy(true);
    setPoruka("");
    const res = await fetch("/api/admin/products/suggest-paketi", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setPoruka("Greška, pokušaj ponovo.");
      return;
    }
    setPoruka(
      data.count > 0
        ? `✓ Popunjen prijedlog za ${data.count} proizvod(a). Otvori proizvod i uključi paket kad pregledaš.`
        : "Svi proizvodi s cijenom već imaju paket — nema šta da se popuni."
    );
    router.refresh();
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <button type="button" className="adm-btn" disabled={busy} onClick={pokreni}>
        {busy ? "Popunjavam…" : "🪄 PREDLOŽI PAKETE (1/2/3) ZA SVE"}
      </button>
      {poruka ? <span className="adm-hint">{poruka}</span> : null}
    </div>
  );
}
