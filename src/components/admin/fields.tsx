"use client";

import { useId, useRef, useState } from "react";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "email";
}) {
  const id = useId();
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="adm-hint">{hint}</span> : null}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        step="0.01"
        value={value === null ? "" : String(value)}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
      />
      {hint ? <span className="adm-hint">{hint}</span> : null}
    </div>
  );
}

/**
 * TextArea sa trakom za formatiranje SELEKTOVANOG teksta — selektuješ
 * riječi pa klikneš dugme, isto ponašanje kao Word/Google Docs, samo
 * što se ispod haube i dalje piše naša mini-markdown sintaksa
 * (**bold**, *italic*, ++veće++, --manje--) koju RichText.tsx čita.
 * Time ne treba novi format podataka niti drugačiji renderer — samo
 * lakši način da se ta sintaksa upiše, bez ručnog kucanja zvjezdica.
 */
type MarkKind = "b" | "i" | "big" | "small";

const MARKERS: { label: string; title: string; kind: MarkKind }[] = [
  { label: "B", title: "Podebljano", kind: "b" },
  { label: "I", title: "Kurziv", kind: "i" },
  { label: "A+", title: "Uvećaj selektovano", kind: "big" },
  { label: "A−", title: "Umanji selektovano", kind: "small" },
];

/**
 * Skine SVE markere sa ivica teksta (bilo koliko slojeva, bilo kojim
 * redom su nagomilani) i vrati čist tekst + koji su formati bili
 * aktivni. Ovo je ono što sprečava "zapetljavanje" — bez obzira koliko
 * puta i kojim redom admin klikne dugmad, uvijek se prvo vratimo na
 * čist tekst pa PONOVO složimo markere uvijek istim redoslijedom.
 */
function stripAllMarkers(s: string): { text: string; marks: Set<MarkKind> } {
  const marks = new Set<MarkKind>();
  let changed = true;
  while (changed) {
    changed = false;
    if (s.length > 4 && s.startsWith("**") && s.endsWith("**")) {
      s = s.slice(2, -2);
      marks.add("b");
      changed = true;
    } else if (s.length > 4 && s.startsWith("__") && s.endsWith("__")) {
      s = s.slice(2, -2);
      marks.add("i");
      changed = true;
    } else if (s.length > 4 && s.startsWith("++") && s.endsWith("++")) {
      s = s.slice(2, -2);
      marks.add("big");
      changed = true;
    } else if (s.length > 4 && s.startsWith("--") && s.endsWith("--")) {
      s = s.slice(2, -2);
      marks.add("small");
      changed = true;
    } else if (s.length > 2 && s.startsWith("*") && s.endsWith("*")) {
      // Legacy jednostruka zvjezdica (stariji sadržaj) — čita se, ali
      // applyMarkers() dole uvijek piše NAZAD __italic__ (v. komentar u
      // RichText.tsx zašto: sudara se sa **bold** kad se oboje traži).
      s = s.slice(1, -1);
      marks.add("i");
      changed = true;
    }
  }
  return { text: s, marks };
}

/** Uvijek isti redoslijed slojeva, bez obzira kojim redom su dodani. */
function applyMarkers(text: string, marks: Set<MarkKind>): string {
  let out = text;
  if (marks.has("i")) out = `__${out}__`;
  if (marks.has("b")) out = `**${out}**`;
  if (marks.has("big")) out = `++${out}++`;
  if (marks.has("small")) out = `--${out}--`;
  return out;
}

export function RichTextArea({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [msg, setMsg] = useState("");

  function toggleMark(kind: MarkKind) {
    const el = ref.current;
    if (!el) return;
    const rawStart = el.selectionStart;
    const rawEnd = el.selectionEnd;
    if (rawStart === rawEnd) {
      setMsg("Prvo selektuj riječi koje želiš da promijeniš, pa klikni dugme.");
      setTimeout(() => setMsg(""), 2500);
      return;
    }

    // Trostruki klik (cio red) zna selektovati i razmak/novi red na
    // kraju reda. Marker mora ostati UNUTAR jednog reda — RichText.tsx
    // čita tekst red-po-red, pa marker koji pređe granicu reda (zatvarač
    // završi na početku SLJEDEĆEG reda) se nikad ne prepozna kao bold/
    // italic, samo ostane vidljiv kao tekst.
    const raw = value.slice(rawStart, rawEnd);
    const start = rawStart + (raw.match(/^\s*/)?.[0].length ?? 0);
    const end = rawEnd - (raw.match(/\s*$/)?.[0].length ?? 0);
    if (start >= end) {
      setMsg("Prvo selektuj riječi koje želiš da promijeniš, pa klikni dugme.");
      setTimeout(() => setMsg(""), 2500);
      return;
    }

    // Prvo skini SVE postojeće markere (koliko god ih ima, kojim god
    // redom su dodani), uključi/isključi traženi format, pa ih SLOŽI
    // NAZAD uvijek istim redoslijedom (applyMarkers) — bez obzira koliko
    // puta i kojim redom admin klikne dugmad, rezultat je uvijek najviše
    // jedan sloj po formatu, ispravno ugnježđen. Ovo je jedini pouzdan
    // način da se spriječi "++**++**++tekst++**++**++" zapetljavanje.
    const { text: clean, marks } = stripAllMarkers(value.slice(start, end));
    if (marks.has(kind)) {
      marks.delete(kind);
    } else {
      if (kind === "big") marks.delete("small");
      if (kind === "small") marks.delete("big");
      marks.add(kind);
    }
    const rebuilt = applyMarkers(clean, marks);

    const next = value.slice(0, start) + rebuilt + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, start + rebuilt.length);
    });
  }

  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <div className="adm-richbar">
        {MARKERS.map((m) => (
          <button
            key={m.kind}
            type="button"
            title={m.title}
            onClick={() => toggleMark(m.kind)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <textarea
        id={id}
        ref={ref}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {msg ? <span className="adm-hint" style={{ color: "var(--red)" }}>{msg}</span> : null}
      {hint ? <span className="adm-hint">{hint}</span> : null}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="adm-hint">{hint}</span> : null}
    </div>
  );
}

/** Boja pozadine za isticanje (bedž stil) — prazno = bez pozadine. */
export function ColorField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          id={id}
          type="color"
          value={value || "#e0632a"}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 40, height: 32, padding: 2, flex: "none" }}
        />
        <input
          type="text"
          value={value}
          placeholder="bez pozadine"
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
        {value ? (
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            onClick={() => onChange("")}
          >
            UKLONI
          </button>
        ) : null}
      </div>
      {hint ? <span className="adm-hint">{hint}</span> : null}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="adm-check">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

/** Uređivanje liste stringova (benefiti, koraci, sadržaj kutije…). */
export function StringList({
  label,
  items,
  onChange,
  addLabel = "+ DODAJ RED",
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
  placeholder?: string;
}) {
  function set(i: number, v: string) {
    onChange(items.map((x, idx) => (idx === i ? v : x)));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  return (
    <div className="adm-field">
      <label>{label}</label>
      {items.map((it, i) => (
        <div className="adm-list-item" key={i}>
          <input
            type="text"
            value={it}
            placeholder={placeholder}
            onChange={(e) => set(i, e.target.value)}
          />
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
            disabled={i === items.length - 1}
          >
            ↓
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-icon adm-btn-danger"
            title="Obriši red"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="adm-btn adm-btn-sm"
        style={{ alignSelf: "flex-start" }}
        onClick={() => onChange([...items, ""])}
      >
        {addLabel}
      </button>
    </div>
  );
}
