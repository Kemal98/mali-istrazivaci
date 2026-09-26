"use client";

import MediaField from "./MediaField";
import {
  ColorField,
  RichTextArea,
  SelectField,
  StringList,
  TextArea,
  TextField,
  Toggle,
} from "./fields";
import type { Block, BlockData } from "@/lib/cms/types";

const ALIGN = [
  { value: "left", label: "Lijevo" },
  { value: "center", label: "Centrirano" },
  { value: "right", label: "Desno" },
];

const RICH_HINT =
  "Selektuj riječi pa klikni B / I / A+ / A− iznad polja. Novi red (Enter) " +
  "i lista (red počinje sa „- ”) rade kao u Wordu.";

/** Polja za uređivanje jednog bloka — po tipu. */
export default function BlockFields({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: BlockData) => void;
}) {
  const d = block.data;
  const set = (patch: BlockData) => onChange({ ...d, ...patch });

  const s = (k: string, fallback = "") =>
    d[k] === undefined || d[k] === null ? fallback : String(d[k]);
  const b = (k: string, fallback = false) =>
    d[k] === undefined ? fallback : Boolean(d[k]);
  const arr = (k: string): string[] =>
    Array.isArray(d[k]) ? (d[k] as string[]) : [];

  switch (block.type) {
    case "naslov":
      return (
        <>
          <RichTextArea
            label="Tekst naslova"
            value={s("tekst")}
            onChange={(v) => set({ tekst: v })}
            rows={2}
            hint={RICH_HINT}
          />
          <div className="adm-row">
            <SelectField
              label="Veličina"
              value={s("velicina", "L")}
              onChange={(v) => set({ velicina: v })}
              options={[
                { value: "S", label: "S — malo" },
                { value: "M", label: "M — srednje" },
                { value: "L", label: "L — veliko" },
                { value: "XL", label: "XL — najveće" },
              ]}
            />
            <SelectField
              label="Poravnanje"
              value={s("align", "center")}
              onChange={(v) => set({ align: v })}
              options={ALIGN}
            />
          </div>
          <Toggle
            label="Podebljano (bold)"
            value={b("bold", true)}
            onChange={(v) => set({ bold: v })}
          />
          <ColorField
            label="Pozadina (isticanje, bedž)"
            value={s("istaknutoBoja")}
            onChange={(v) => set({ istaknutoBoja: v })}
            hint="Za kratak istaknuti tekst kao značka — boja pozadine + bijela/tamna slova automatski, zaobljeni rubovi. Najbolje za kratke fraze, ne cijele pasuse."
          />
        </>
      );

    case "tekst":
      return (
        <>
          <RichTextArea
            label="Tekst"
            value={s("tekst")}
            onChange={(v) => set({ tekst: v })}
            rows={6}
            hint={RICH_HINT}
          />
          <div className="adm-row">
            <SelectField
              label="Veličina"
              value={s("velicina", "")}
              onChange={(v) => set({ velicina: v })}
              options={[
                { value: "", label: "Podrazumijevano" },
                { value: "S", label: "S — malo" },
                { value: "M", label: "M — srednje" },
                { value: "L", label: "L — veliko" },
                { value: "XL", label: "XL — najveće" },
              ]}
            />
            <SelectField
              label="Poravnanje"
              value={s("align", "center")}
              onChange={(v) => set({ align: v })}
              options={ALIGN}
            />
          </div>
          <Toggle
            label="Cijeli tekst podebljano"
            value={b("bold")}
            onChange={(v) => set({ bold: v })}
          />
          <ColorField
            label="Pozadina (isticanje, bedž)"
            value={s("istaknutoBoja")}
            onChange={(v) => set({ istaknutoBoja: v })}
            hint="Za kratak istaknuti tekst kao značka — boja pozadine + bijela/tamna slova automatski, zaobljeni rubovi. Najbolje za kratke fraze, ne cijele pasuse."
          />
        </>
      );

    case "naslov_tekst":
      return (
        <>
          <RichTextArea
            label="Naslov"
            value={s("naslov")}
            onChange={(v) => set({ naslov: v })}
            rows={2}
            hint={RICH_HINT}
          />
          <RichTextArea
            label="Tekst ispod naslova"
            value={s("tekst")}
            onChange={(v) => set({ tekst: v })}
            rows={5}
            hint={RICH_HINT}
          />
          <div className="adm-row">
            <SelectField
              label="Poravnanje"
              value={s("align", "center")}
              onChange={(v) => set({ align: v })}
              options={ALIGN}
            />
          </div>
          <Toggle
            label="Tekst podebljano"
            value={b("bold", true)}
            onChange={(v) => set({ bold: v })}
          />
          <ColorField
            label="Pozadina naslova (isticanje, bedž)"
            value={s("istaknutoBoja")}
            onChange={(v) => set({ istaknutoBoja: v })}
            hint="Primjenjuje se samo na naslov (gornji red), ne na tekst ispod."
          />
        </>
      );

    case "slika":
    case "gif":
      return (
        <>
          <MediaField
            label={block.type === "gif" ? "GIF" : "Slika"}
            value={s("url")}
            accept="image"
            onChange={(url, alt) =>
              set({ url, alt: alt && !s("alt") ? alt : s("alt") })
            }
          />
          <TextField
            label="Alt tekst (za pristupačnost i SEO)"
            value={s("alt")}
            onChange={(v) => set({ alt: v })}
          />
          <TextField
            label="Potpis ispod slike (opcionalno)"
            value={s("caption")}
            onChange={(v) => set({ caption: v })}
          />
          <Toggle
            label="Zaobljeni uglovi"
            value={b("radius", true)}
            onChange={(v) => set({ radius: v })}
          />
          <Toggle
            label="Preko cijele širine"
            value={b("fullWidth")}
            onChange={(v) => set({ fullWidth: v })}
          />
        </>
      );

    case "video":
      return (
        <>
          <MediaField
            label="Video fajl"
            value={s("url")}
            accept="video"
            onChange={(url) => set({ url })}
            hint="MP4 ili WEBM. Za mobilni je najbolje do ~10 MB."
          />
          <Toggle
            label="Pusti automatski"
            value={b("autoplay")}
            onChange={(v) => set({ autoplay: v })}
          />
          <Toggle
            label="Bez zvuka (mutiran)"
            value={b("muted", true)}
            onChange={(v) => set({ muted: v })}
          />
          <Toggle
            label="Ponavljaj (loop)"
            value={b("loop")}
            onChange={(v) => set({ loop: v })}
          />
          <Toggle
            label="Prikaži kontrole"
            value={b("controls", true)}
            onChange={(v) => set({ controls: v })}
          />
        </>
      );

    case "slika_tekst":
      return (
        <>
          <MediaField
            label="Slika"
            value={s("url")}
            accept="image"
            onChange={(url, alt) =>
              set({ url, alt: alt && !s("alt") ? alt : s("alt") })
            }
          />
          <TextField
            label="Alt tekst"
            value={s("alt")}
            onChange={(v) => set({ alt: v })}
          />
          <TextArea
            label="Naslov"
            value={s("naslov")}
            onChange={(v) => set({ naslov: v })}
            rows={2}
            hint={RICH_HINT}
          />
          <TextArea
            label="Tekst"
            value={s("tekst")}
            onChange={(v) => set({ tekst: v })}
            rows={5}
            hint={RICH_HINT}
          />
          <SelectField
            label="Raspored"
            value={s("layout", "img-top")}
            onChange={(v) => set({ layout: v })}
            options={[
              { value: "img-top", label: "Slika iznad teksta" },
              { value: "text-top", label: "Tekst iznad slike" },
              { value: "img-left", label: "Slika lijevo (na desktopu)" },
              { value: "img-right", label: "Slika desno (na desktopu)" },
            ]}
          />
          <Toggle
            label="Zaobljeni uglovi"
            value={b("radius", true)}
            onChange={(v) => set({ radius: v })}
          />
        </>
      );

    case "social_proof":
      return (
        <>
          <TextField
            label="Prva linija"
            value={s("linija1")}
            onChange={(v) => set({ linija1: v })}
            placeholder="Preko 500+ zadovoljnih roditelja"
          />
          <TextField
            label="Zvjezdice"
            value={s("zvjezdice")}
            onChange={(v) => set({ zvjezdice: v })}
            placeholder="⭐️⭐️⭐️⭐️⭐️"
          />
          <TextField
            label="Tekst u zagradi"
            value={s("linija2")}
            onChange={(v) => set({ linija2: v })}
            placeholder="prosječna ocjena 4.8/5"
            hint="Pišite samo brojeve koje stvarno imate."
          />
        </>
      );

    case "benefiti":
      return (
        <>
          <TextField
            label="Naslov sekcije (opcionalno)"
            value={s("naslov")}
            onChange={(v) => set({ naslov: v })}
          />
          <StringList
            label="Prednosti (svaka u svom redu)"
            items={arr("items")}
            onChange={(items) => set({ items })}
            placeholder="npr. Bez zapetljavanja i vučenja kose"
          />
        </>
      );

    case "koraci":
      return (
        <>
          <TextField
            label="Naslov sekcije (opcionalno)"
            value={s("naslov")}
            onChange={(v) => set({ naslov: v })}
          />
          <StringList
            label="Koraci — može ih biti koliko treba"
            items={arr("items")}
            onChange={(items) => set({ items })}
            addLabel="+ DODAJ KORAK"
            placeholder="npr. Ubaci pramen kose"
          />
        </>
      );

    case "u_kutiji":
      return (
        <>
          <TextField
            label="Naslov"
            value={s("naslov")}
            onChange={(v) => set({ naslov: v })}
          />
          <StringList
            label="Šta stiže u kutiji"
            items={arr("items")}
            onChange={(items) => set({ items })}
            placeholder="npr. 1x aparat za kosu"
          />
          <TextField
            label="Napomena ispod liste (opcionalno)"
            value={s("napomena")}
            onChange={(v) => set({ napomena: v })}
          />
        </>
      );

    case "trust":
      return (
        <>
          <TextField
            label="Naslov"
            value={s("naslov")}
            onChange={(v) => set({ naslov: v })}
          />
          <StringList
            label="Stavke"
            items={arr("items")}
            onChange={(items) => set({ items })}
            placeholder="npr. Plaćanje pouzećem"
          />
          <TextField
            label="Badge / garancija (opcionalno)"
            value={s("badge")}
            onChange={(v) => set({ badge: v })}
          />
        </>
      );

    case "cta":
      return (
        <>
          <TextField
            label="Naslov"
            value={s("naslov")}
            onChange={(v) => set({ naslov: v })}
          />
          <TextField
            label="Podtekst (opcionalno)"
            value={s("opis")}
            onChange={(v) => set({ opis: v })}
          />
          <TextField
            label="Tekst na dugmetu"
            value={s("ctaTekst", "PORUČI SADA")}
            onChange={(v) => set({ ctaTekst: v })}
            hint="Dugme otvara istu formu za narudžbu kao i hero — ništa se ne mijenja u toku naručivanja."
          />
        </>
      );

    case "spacer":
      return (
        <SelectField
          label="Visina razmaka"
          value={s("size", "M")}
          onChange={(v) => set({ size: v })}
          options={[
            { value: "S", label: "S — 14px" },
            { value: "M", label: "M — 32px" },
            { value: "L", label: "L — 64px" },
          ]}
        />
      );

    case "galerija": {
      const items = (Array.isArray(d.items) ? d.items : []) as {
        url: string;
        alt?: string;
      }[];
      return (
        <>
          {items.map((g, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #e3e5e9",
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <MediaField
                label={`Slika ${i + 1}`}
                value={g.url}
                accept="image"
                onChange={(url, alt) =>
                  set({
                    items: items.map((x, idx) =>
                      idx === i ? { url, alt: alt ?? x.alt ?? "" } : x
                    ),
                  })
                }
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  disabled={i === 0}
                  onClick={() => {
                    const next = [...items];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    set({ items: next });
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  disabled={i === items.length - 1}
                  onClick={() => {
                    const next = [...items];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    set({ items: next });
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm adm-btn-danger"
                  onClick={() =>
                    set({ items: items.filter((_, idx) => idx !== i) })
                  }
                >
                  UKLONI
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            onClick={() => set({ items: [...items, { url: "", alt: "" }] })}
          >
            + DODAJ SLIKU U GALERIJU
          </button>
        </>
      );
    }

    case "recenzije":
      return (
        <>
          <TextField
            label="Naslov sekcije"
            value={s("naslov")}
            onChange={(v) => set({ naslov: v })}
          />
          <Toggle
            label="Prikaži prosječnu ocjenu iznad recenzija"
            value={b("prikaziOcjenu", true)}
            onChange={(v) => set({ prikaziOcjenu: v })}
          />
          {b("prikaziOcjenu", true) ? (
            <div className="adm-row">
              <TextField
                label="Ocjena"
                value={s("ratingVrijednost", "4.8")}
                onChange={(v) => set({ ratingVrijednost: v })}
              />
              <TextField
                label="Broj ocjena"
                value={s("ratingBrojOcjena")}
                onChange={(v) => set({ ratingBrojOcjena: v })}
                hint="Ostavite prazno da se koristi stvaran broj recenzija."
              />
            </div>
          ) : null}
          <div className="adm-note adm-note-info">
            Same recenzije se uređuju u tabu <b>RECENZIJE</b> ovog proizvoda —
            ovaj blok samo određuje <b>gdje</b> se pojavljuju na stranici.
          </div>
        </>
      );

    case "divider":
      return (
        <p className="adm-hint">
          Tanka linija — nema dodatnih postavki.
        </p>
      );

    case "koristi": {
      type K = { url: string; alt: string; naslov: string; tekst: string };
      const items = (Array.isArray(d.items) ? d.items : []) as K[];
      const setItem = (i: number, patch: Partial<K>) =>
        set({ items: items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
      const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= items.length) return;
        const next = [...items];
        [next[i], next[j]] = [next[j], next[i]];
        set({ items: next });
      };
      return (
        <>
          <TextField
            label="Naslov sekcije (opcionalno)"
            value={s("naslov")}
            onChange={(v) => set({ naslov: v })}
            placeholder="npr. Zašto roditelji biraju ovo"
          />
          {items.map((it, i) => (
            <div key={i} className="adm-subcard">
              <div className="adm-subcard-head">
                <b>Korist {i + 1}</b>
                <span>
                  <button type="button" className="adm-btn adm-btn-icon" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" className="adm-btn adm-btn-icon" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-icon adm-btn-danger"
                    onClick={() => set({ items: items.filter((_, j) => j !== i) })}
                  >
                    ✕
                  </button>
                </span>
              </div>
              <MediaField
                label="Slika ili GIF (opcionalno)"
                value={it.url}
                accept="image"
                onChange={(url, alt) => setItem(i, { url, alt: alt ?? it.alt })}
              />
              <TextField
                label="Kratak naslov (ishod)"
                value={it.naslov}
                onChange={(v) => setItem(i, { naslov: v })}
                placeholder="npr. Ne treba baterije"
              />
              <TextArea
                label="Detalj (mjera, materijal, broj)"
                value={it.tekst}
                onChange={(v) => setItem(i, { tekst: v })}
                rows={2}
                placeholder="npr. Radi na magnetu, nema punjenja ni zamjene."
              />
            </div>
          ))}
          {items.length < 5 ? (
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              style={{ alignSelf: "flex-start" }}
              onClick={() => set({ items: [...items, { url: "", alt: "", naslov: "", tekst: "" }] })}
            >
              + DODAJ KORIST
            </button>
          ) : null}
          <p className="adm-hint">Najbolje 3–5. Svaka neka ima konkretan detalj, ne samo pridjev.</p>
        </>
      );
    }

    case "faq": {
      type Q = { pitanje: string; odgovor: string };
      const items = (Array.isArray(d.items) ? d.items : []) as Q[];
      const setItem = (i: number, patch: Partial<Q>) =>
        set({ items: items.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
      return (
        <>
          <TextField label="Naslov sekcije" value={s("naslov")} onChange={(v) => set({ naslov: v })} />
          {items.map((it, i) => (
            <div key={i} className="adm-subcard">
              <div className="adm-subcard-head">
                <b>Pitanje {i + 1}</b>
                <button
                  type="button"
                  className="adm-btn adm-btn-icon adm-btn-danger"
                  onClick={() => set({ items: items.filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              </div>
              <TextField
                label="Pitanje"
                value={it.pitanje}
                onChange={(v) => setItem(i, { pitanje: v })}
                placeholder="npr. Za koji uzrast je?"
              />
              <TextArea
                label="Odgovor"
                value={it.odgovor}
                onChange={(v) => setItem(i, { odgovor: v })}
                rows={3}
              />
            </div>
          ))}
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            style={{ alignSelf: "flex-start" }}
            onClick={() => set({ items: [...items, { pitanje: "", odgovor: "" }] })}
          >
            + DODAJ PITANJE
          </button>
          <p className="adm-hint">Prvo pitanje je na stranici otvoreno, ostala se otvaraju klikom.</p>
        </>
      );
    }

    default:
      return null;
  }
}

/** Kratki opis bloka u zatvorenom stanju (da se lista lako čita). */
export function blockPreview(block: Block): string {
  const d = block.data;
  const first = (...keys: string[]) => {
    for (const k of keys) {
      const v = d[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "";
  };
  switch (block.type) {
    case "naslov":
    case "tekst":
      return first("tekst");
    case "naslov_tekst":
    case "slika_tekst":
    case "cta":
      return first("naslov", "tekst", "opis");
    case "slika":
    case "gif":
    case "video":
      return first("url") || "(fajl nije odabran)";
    case "social_proof":
      return first("linija1");
    case "benefiti":
    case "koraci":
    case "u_kutiji":
    case "trust": {
      const items = Array.isArray(d.items) ? (d.items as string[]) : [];
      const naslov = first("naslov");
      return naslov || `${items.length} stavki`;
    }
    case "spacer":
      return `visina ${first("size") || "M"}`;
    case "galerija":
      return `${(Array.isArray(d.items) ? d.items : []).length} slika`;
    case "recenzije":
      return first("naslov");
    case "koristi":
    case "faq": {
      const n = (Array.isArray(d.items) ? d.items : []).length;
      return first("naslov") || `${n} stavki`;
    }
    default:
      return "";
  }
}
