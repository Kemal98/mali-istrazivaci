"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Scraped {
  title?: string;
  description?: string;
  image?: string;
}

/**
 * "Uvezi sa linka" — pokuša sâm izvući naslov/opis sa dobavljačevog
 * linka (besplatno, best-effort — vidi lib/cms/scrape.ts). Ne pravi
 * cijelu stranicu automatski: samo vrati čist tekst koji admin kopira i
 * zalijepi u chat, isto kao za sve dosadašnje proizvode na sajtu.
 */
export default function ImportProductButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Scraped | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setUrl("");
    setError("");
    setResult(null);
    setCopied(false);
  }

  async function extract() {
    if (!url.trim()) return;
    setBusy(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/admin/products/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data?.error || "Nije uspjelo čitanje sa linka.");
      return;
    }
    setResult(data);
  }

  async function copyText() {
    if (!result) return;
    const text = [result.title, result.description].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // tiho — dugme ostaje, admin može ručno selektovati tekst
    }
  }

  async function createDraft() {
    setCreating(true);
    setError("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naziv: result?.title || "Novi proizvod" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Greška pri kreiranju.");
      setCreating(false);
      return;
    }
    router.push(`/admin/products/${data.product.id}`);
  }

  return (
    <>
      <button
        type="button"
        className="adm-btn"
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        ↓ UVEZI SA LINKA
      </button>

      {open && (
        <div
          className="adm-modal-bg"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="adm-modal" role="dialog" aria-modal="true">
            <h2>Uvezi sa linka</h2>
            <p className="adm-hint" style={{ marginBottom: 16 }}>
              Zalijepi link dobavljača — pokušaću sam izvući naslov i opis.
              Ne uspije li (neki sajtovi blokiraju to), kopiraj tekst ručno
              sa stranice i zalijepi ga meni u chat — isti krajnji rezultat.
            </p>

            {error ? <div className="adm-note adm-note-err">{error}</div> : null}

            <div className="adm-field">
              <label htmlFor="ip-url">Link proizvoda</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="ip-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  autoFocus
                  style={{ flex: 1 }}
                  onKeyDown={(e) => e.key === "Enter" && extract()}
                />
                <button
                  type="button"
                  className="adm-btn"
                  onClick={extract}
                  disabled={busy || !url.trim()}
                >
                  {busy ? "Čitam…" : "IZVUCI"}
                </button>
              </div>
            </div>

            {result ? (
              <div className="adm-card" style={{ marginTop: 4 }}>
                {result.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.image}
                    alt=""
                    style={{
                      maxWidth: 140,
                      maxHeight: 140,
                      borderRadius: 8,
                      marginBottom: 10,
                      objectFit: "contain",
                    }}
                  />
                ) : null}
                <div className="adm-field">
                  <label>Naslov (izvučeno)</label>
                  <input type="text" readOnly value={result.title || "—"} />
                </div>
                <div className="adm-field">
                  <label>Opis (izvučeno)</label>
                  <textarea readOnly rows={5} value={result.description || "—"} />
                </div>
                {result.image ? (
                  <p className="adm-hint">
                    Slika sa izvora — otvori je u novom tabu i sačuvaj ručno
                    ako je želiš koristiti (ovo je samo prikaz, ne skida se
                    automatski).
                  </p>
                ) : null}
                <div className="adm-row" style={{ marginTop: 4 }}>
                  <button type="button" className="adm-btn adm-btn-sm" onClick={copyText}>
                    {copied ? "✓ KOPIRANO" : "📋 KOPIRAJ TEKST"}
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    onClick={createDraft}
                    disabled={creating}
                  >
                    {creating ? "Pravim…" : "NAPRAVI NACRT S OVIM NASLOVOM"}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="adm-modal-foot">
              <button type="button" className="adm-btn" onClick={() => setOpen(false)}>
                ZATVORI
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
