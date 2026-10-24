"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SABLONI } from "@/lib/cms/sabloni";

/**
 * "AI uvoz proizvoda" — jedan klik: link + šablon ide Claude-u, vrati se
 * gotov nacrt (naslov, tekst, slike raspoređene) umjesto da admin ručno
 * kopira prompt u poseban Claude chat i lijepi odgovor nazad (to i dalje
 * postoji u editoru kao "Popuni iz Claude-a", za slučaj da ovo ne uspije
 * ili admin želi da sam prati/mijenja tekst prije primjene).
 */
export default function AiImportButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [sablon, setSablon] = useState<string>(SABLONI[0]?.kljuc ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setUrl("");
    setError("");
  }

  async function run() {
    if (!url.trim() || !sablon) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products/ai-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), sablon }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Greška pri AI uvozu.");
        setBusy(false);
        return;
      }
      const q = data.imagesQueued ? `?uvozSlika=${data.imagesQueued}` : "";
      router.push(`/admin/products/${data.productId}${q}`);
    } catch {
      setError("Nema veze sa internetom. Pokušajte ponovo.");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="adm-btn adm-btn-primary"
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        ✨ AI UVOZ PROIZVODA
      </button>

      {open && (
        <div
          className="adm-modal-bg"
          onClick={(e) => e.target === e.currentTarget && !busy && setOpen(false)}
        >
          <div className="adm-modal" role="dialog" aria-modal="true">
            <h2>AI uvoz proizvoda</h2>
            <p className="adm-hint" style={{ marginBottom: 16 }}>
              Zalijepi link dobavljača i izaberi šablon — Claude sam napravi
              naslov, tekst i rasporedi pronađene slike. Ništa se ne
              objavljuje automatski, nacrt pregledaš i doradiš u editoru.
            </p>

            {error ? <div className="adm-note adm-note-err">{error}</div> : null}

            <div className="adm-field">
              <label htmlFor="ai-url">Link proizvoda</label>
              <input
                id="ai-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                autoFocus
                disabled={busy}
              />
            </div>

            <div className="adm-field">
              <label htmlFor="ai-sablon">Šablon stranice</label>
              <select
                id="ai-sablon"
                value={sablon}
                onChange={(e) => setSablon(e.target.value)}
                disabled={busy}
              >
                {SABLONI.map((s) => (
                  <option key={s.kljuc} value={s.kljuc}>
                    {s.naziv}
                  </option>
                ))}
              </select>
            </div>

            <div className="adm-modal-foot">
              <button type="button" className="adm-btn" onClick={() => setOpen(false)} disabled={busy}>
                ZATVORI
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={run}
                disabled={busy || !url.trim()}
              >
                {busy ? "Generišem… (do 30-ak sekundi)" : "ANALIZIRAJ I GENERIŠI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
