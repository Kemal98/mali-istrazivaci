"use client";

import { NumberField, TextField, Toggle } from "./fields";
import { noviPaket, type ProductBundle } from "@/lib/cms/types";

/**
 * "PAKETNE PONUDE" — admin uključi/isključi po proizvodu, doda/obriše/
 * preuredi pakete. Isti vizuelni obrazac kao FAQ/isticanja u
 * BlockFields.tsx (.adm-subcard + ↑↓✕), samo nad `product.paketi`
 * direktno (nije CMS blok). "Istaknut" je RADIO ponašanje (klikom na
 * jedan se ugase svi ostali) — tačno jedan unaprijed označen paket,
 * nikad nijedan ili više njih (sanitizeBundles na serveru ovo i provjeri).
 */
export default function PaketiEditor({
  aktivni,
  paketi,
  onChangeAktivni,
  onChangePaketi,
}: {
  aktivni: boolean;
  paketi: ProductBundle[];
  onChangeAktivni: (v: boolean) => void;
  onChangePaketi: (items: ProductBundle[]) => void;
}) {
  function setItem(i: number, patch: Partial<ProductBundle>) {
    onChangePaketi(paketi.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  }
  function setIstaknut(i: number) {
    onChangePaketi(paketi.map((p, j) => ({ ...p, istaknut: j === i })));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= paketi.length) return;
    const next = [...paketi];
    [next[i], next[j]] = [next[j], next[i]];
    onChangePaketi(next);
  }
  function remove(i: number) {
    const bio = paketi[i];
    const next = paketi.filter((_, j) => j !== i);
    // Ako je obrisan BAŠ istaknuti paket, prvi preostali postaje
    // istaknut — stranica uvijek mora imati tačno jedan unaprijed
    // označen paket čim ih ima bar jedan.
    if (bio?.istaknut && next.length) next[0] = { ...next[0], istaknut: true };
    onChangePaketi(next);
  }

  return (
    <div className="adm-card">
      <div className="adm-card-title">Paketne ponude</div>
      <Toggle label="Uključi paketne ponude za ovaj proizvod" value={aktivni} onChange={onChangeAktivni} />

      {aktivni ? (
        <>
          <p className="adm-hint" style={{ margin: "10px 0" }}>
            Kupac na stranici bira TAČNO JEDAN paket — on zamjenjuje običnu
            cijenu. Npr. „1 set (3 zvečke) – 19 KM“, „2 seta (6 zvečki) – 34
            KM“. Količina mora biti u istoj jedinici kao obična prodaja
            ovog proizvoda (ono što inače ide u nabavku/zalihe) — ako
            prodaješ „set“, paket od 2 seta ima količinu 2, ne broj
            komada u setu.
          </p>

          {paketi.map((p, i) => (
            <div key={p.id} className="adm-subcard">
              <div className="adm-subcard-head">
                <b>Paket {i + 1}{p.istaknut ? " · unaprijed označen" : ""}</b>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    className="adm-btn adm-btn-icon"
                    title="Pomjeri gore"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-icon"
                    title="Pomjeri dolje"
                    onClick={() => move(i, 1)}
                    disabled={i === paketi.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-icon adm-btn-danger"
                    title="Obriši paket"
                    onClick={() => remove(i)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="adm-row-3 adm-row">
                <TextField
                  label="Naziv paketa"
                  value={p.naziv}
                  onChange={(v) => setItem(i, { naziv: v })}
                  placeholder="npr. 2 seta (6 zvečki)"
                />
                <NumberField
                  label="Količina"
                  value={p.kolicina}
                  onChange={(v) => setItem(i, { kolicina: Math.max(1, Math.round(v ?? 1)) })}
                  hint="U jedinici obične prodaje (vidi napomenu gore)."
                />
                <TextField
                  label="Oznaka (opciono)"
                  value={p.oznaka}
                  onChange={(v) => setItem(i, { oznaka: v })}
                  placeholder="npr. NAJBOLJA PONUDA"
                />
              </div>
              <div className="adm-row-3 adm-row" style={{ marginTop: 10 }}>
                <NumberField
                  label="Cijena paketa (KM)"
                  value={p.cijena}
                  onChange={(v) => setItem(i, { cijena: Math.max(0, v ?? 0) })}
                />
                <NumberField
                  label="Stara cijena (precrtana)"
                  value={p.staraCijena}
                  onChange={(v) => setItem(i, { staraCijena: v })}
                  hint="Ostavite prazno ako nema akcije."
                />
                <label className="adm-check" style={{ alignSelf: "center", marginTop: 20 }}>
                  <input
                    type="radio"
                    name="paket-istaknut"
                    checked={p.istaknut}
                    onChange={() => setIstaknut(i)}
                  />
                  Unaprijed označen
                </label>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="adm-btn adm-btn-sm"
            style={{ marginTop: paketi.length ? 10 : 0 }}
            onClick={() => {
              const n = noviPaket();
              onChangePaketi([...paketi, { ...n, istaknut: paketi.length === 0 }]);
            }}
          >
            + DODAJ PAKET
          </button>

          {paketi.length === 0 ? (
            <div className="adm-note adm-note-warn" style={{ marginTop: 10 }}>
              Paketne ponude su uključene, ali nema nijednog paketa — dok ne
              dodaš bar jedan, stranica se prikazuje potpuno kao bez ove
              funkcije.
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
