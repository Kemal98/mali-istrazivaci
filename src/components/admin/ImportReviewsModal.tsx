"use client";

import { useState } from "react";
import MediaField from "./MediaField";
import { parsePastedReviews, type ParsedReview } from "@/lib/cms/parseReviews";

interface Editable extends ParsedReview {
  slika: string;
  skip: boolean;
}

/**
 * "Uvezi recenzije" — admin zalijepi tekst selektovan/kopiran sa tuđe
 * stranice (npr. Amazon — ne može se čitati automatski, JS učitava
 * recenzije, vidi parseReviews.ts), ovdje ih pregleda/ispravi PRIJE
 * nego što se upišu u bazu. Slike se dodaju ručno po recenziji (isti
 * razlog kao kod uvoza proizvoda — tuđe slike se ne skidaju same).
 */
export default function ImportReviewsModal({
  productId,
  onClose,
  onImported,
}: {
  productId: string | null;
  onClose: () => void;
  onImported: () => void;
}) {
  const [nacin, setNacin] = useState<"link" | "tekst">("link");
  const [link, setLink] = useState("");
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState<Editable[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [info, setInfo] = useState("");
  // Povučene sa linka (tuđi kupci) se uvoze SKRIVENE — admin ih dorađuje
  // i sam uključi; zalijepljene ručno ostaju kao i prije (odmah objavljene).
  const [izLinka, setIzLinka] = useState(false);

  async function povuci() {
    if (!link.trim()) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/reviews/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || "Greška pri povlačenju recenzija.");
        return;
      }
      const list = (data.reviews ?? []) as ParsedReview[];
      setItems(list.map((p) => ({ ...p, slika: "", skip: false })));
      setIzLinka(true);
      setInfo(
        `Povučeno ${list.length} recenzija (${data.izvor}). ` +
          (data.prevedeno
            ? "Prevedeno na bosanski."
            : `Prevod nije uspio (${data.prevodGreska}) — tekst je original.`)
      );
    } catch {
      setMsg("Nema veze sa internetom. Pokušajte ponovo.");
    } finally {
      setBusy(false);
    }
  }

  function parse() {
    const parsed = parsePastedReviews(raw);
    if (!parsed.length) {
      setMsg(
        "Nisam prepoznao nijednu recenziju. Ili zalijepi tekst tačno kako je " +
          "kopiran sa Amazona (mora sadržati npr. „5.0 out of 5 stars\"), ili " +
          "koristi predložak: Ime: ... / Ocjena: 5 / Tekst: ... (recenzije " +
          "razdvoji sa ---)."
      );
      return;
    }
    setItems(parsed.map((p) => ({ ...p, slika: "", skip: false })));
    setIzLinka(false);
    setInfo("");
    setMsg("");
  }

  function update(i: number, patch: Partial<Editable>) {
    setItems((cur) => cur?.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) ?? null);
  }

  async function importAll() {
    if (!items) return;
    const toImport = items.filter((it) => !it.skip && it.tekst.trim());
    if (!toImport.length) return;
    setBusy(true);
    let ok = 0;
    for (const it of toImport) {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          ime: it.ime,
          rating: it.rating,
          tekst: it.tekst,
          slika: it.slika,
          verified: false, // uvezena, nije provjerena kroz našu kupovinu — admin ručno uključi ako želi
          ...(izLinka ? { status: "hidden" } : {}),
        }),
      });
      if (res.ok) ok++;
    }
    setBusy(false);
    onImported();
    setMsg(
      `Uvezeno ${ok} od ${toImport.length}.` +
        (izLinka ? " Skrivene su — doradi ih i uključi koje želiš." : "")
    );
    if (ok === toImport.length) {
      setTimeout(onClose, 900);
    }
  }

  return (
    <div className="adm-modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal" role="dialog" aria-modal="true" style={{ maxWidth: 640 }}>
        <h2>Uvezi recenzije</h2>

        {!items ? (
          <div className="adm-row" style={{ marginBottom: 14, gap: 8 }}>
            <button
              type="button"
              className={`adm-btn${nacin === "link" ? " adm-btn-primary" : ""}`}
              onClick={() => {
                setNacin("link");
                setMsg("");
              }}
              disabled={busy}
            >
              SA LINKA
            </button>
            <button
              type="button"
              className={`adm-btn${nacin === "tekst" ? " adm-btn-primary" : ""}`}
              onClick={() => {
                setNacin("tekst");
                setMsg("");
              }}
              disabled={busy}
            >
              ZALIJEPI TEKST
            </button>
          </div>
        ) : null}

        {!items && nacin === "link" ? (
          <>
            <p className="adm-hint" style={{ marginBottom: 16 }}>
              Zalijepi link proizvoda sa druge prodavnice — povučem SVE njegove
              recenzije i prevedem ih na bosanski. Pregledaš ih prije uvoza, a
              uvezu se kao SKRIVENE (ništa ne izlazi na stranicu dok ih ne uključiš).
              Za sad: Shopify prodavnice sa Rivyo ili Ali Reviews recenzijama.
            </p>
            <div className="adm-field">
              <label htmlFor="rev-link">Link proizvoda</label>
              <input
                id="rev-link"
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://.../products/..."
                autoFocus
                disabled={busy}
              />
            </div>
            {msg ? <div className="adm-note adm-note-err">{msg}</div> : null}
            <div className="adm-modal-foot">
              <button type="button" className="adm-btn" onClick={onClose} disabled={busy}>
                OTKAŽI
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={povuci}
                disabled={busy || !link.trim()}
              >
                {busy ? "Povlačim i prevodim… (do 30-ak sekundi)" : "POVUCI I PREVEDI"}
              </button>
            </div>
          </>
        ) : !items ? (
          <>
            <p className="adm-hint" style={{ marginBottom: 16 }}>
              Otvori recenzije proizvoda na Amazonu (ili drugom sajtu), selektuj
              par recenzija mišem i kopiraj (Ctrl+C), pa zalijepi ovdje. Slike
              reviewera se dodaju ručno ispod, poslije parsiranja.
            </p>
            <div className="adm-field">
              <label>Zalijepi tekst recenzija</label>
              <textarea
                rows={10}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={
                  "5.0 out of 5 stars\nGreat toy!\nReviewed in the United States on March 3, 2024\nMy kids love this...\n\n4.0 out of 5 stars\n..."
                }
              />
            </div>
            {msg ? <div className="adm-note adm-note-err">{msg}</div> : null}
            <div className="adm-modal-foot">
              <button type="button" className="adm-btn" onClick={onClose}>
                OTKAŽI
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={parse}
                disabled={!raw.trim()}
              >
                PARSIRAJ
              </button>
            </div>
          </>
        ) : (
          <>
            {info ? (
              <div className="adm-note adm-note-ok" style={{ marginBottom: 10 }}>
                {info}
              </div>
            ) : null}
            <p className="adm-hint" style={{ marginBottom: 12 }}>
              Pronađeno {items.length} — pregledaj/ispravi, otkači one koje ne
              želiš, pa uvezi.
            </p>
            <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((it, i) => (
                <div
                  key={i}
                  className="adm-card"
                  style={{ opacity: it.skip ? 0.45 : 1, marginBottom: 0 }}
                >
                  <div className="adm-row">
                    <label className="adm-check" style={{ marginBottom: 0 }}>
                      <input
                        type="checkbox"
                        checked={!it.skip}
                        onChange={(e) => update(i, { skip: !e.target.checked })}
                      />
                      Uvezi
                    </label>
                  </div>
                  <div className="adm-row">
                    <div className="adm-field" style={{ flex: 2 }}>
                      <label>Ime</label>
                      <input
                        type="text"
                        value={it.ime}
                        onChange={(e) => update(i, { ime: e.target.value })}
                      />
                    </div>
                    <div className="adm-field" style={{ flex: 1 }}>
                      <label>Ocjena</label>
                      <select
                        value={it.rating}
                        onChange={(e) => update(i, { rating: Number(e.target.value) })}
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} ★
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="adm-field">
                    <label>Tekst</label>
                    <textarea
                      rows={2}
                      value={it.tekst}
                      onChange={(e) => update(i, { tekst: e.target.value })}
                    />
                  </div>
                  <MediaField
                    label="Slika (opciono)"
                    value={it.slika}
                    onChange={(url) => update(i, { slika: url })}
                    accept="image"
                  />
                </div>
              ))}
            </div>
            {msg ? (
              <div className="adm-note adm-note-ok" style={{ marginTop: 10 }}>
                {msg}
              </div>
            ) : null}
            <div className="adm-modal-foot">
              <button type="button" className="adm-btn" onClick={() => setItems(null)}>
                ← NAZAD
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={importAll}
                disabled={busy}
              >
                {busy ? "Uvozim…" : `UVEZI (${items.filter((i) => !i.skip).length})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
