"use client";

import { useCallback, useEffect, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import MediaField from "./MediaField";
import { SelectField, TextArea, TextField, Toggle } from "./fields";
import {
  CATEGORY_LABELS,
  HOME_SECTION_LABELS,
  type HomeContent,
  type FaqItem,
  type HomeSection,
} from "@/lib/home/types";

type Tab = "hero" | "kategorije" | "hit" | "faq" | "sekcije";

const TABS: { id: Tab; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "kategorije", label: "Kategorije" },
  { id: "hit", label: "Hit proizvodi" },
  { id: "faq", label: "FAQ" },
  { id: "sekcije", label: "Redoslijed sekcija" },
];

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function MoveButtons({
  i,
  len,
  onMove,
}: {
  i: number;
  len: number;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <>
      <button
        type="button"
        className="adm-btn adm-btn-icon"
        title="Pomjeri gore"
        disabled={i === 0}
        onClick={() => onMove(-1)}
      >
        ↑
      </button>
      <button
        type="button"
        className="adm-btn adm-btn-icon"
        title="Pomjeri dolje"
        disabled={i === len - 1}
        onClick={() => onMove(1)}
      >
        ↓
      </button>
    </>
  );
}

export default function HomeEditor({
  initial,
  products,
}: {
  initial: HomeContent;
  products: { link: string; naziv: string }[];
}) {
  const [tab, setTab] = useState<Tab>("hero");
  const [draft, setDraft] = useState<HomeContent>(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [ranking, setRanking] = useState<
    { link: string; naziv: string; bestseller: boolean }[] | null
  >(null);

  const patch = useCallback((p: Partial<HomeContent>) => {
    setDraft((d) => ({ ...d, ...p }));
    setDirty(true);
    setMsg("");
  }, []);

  useEffect(() => {
    if (tab !== "hit") return;
    fetch("/api/admin/home/ranking")
      .then((r) => r.json())
      .then((d) => setRanking(d.items ?? []))
      .catch(() => setRanking([]));
  }, [tab]);

  async function saveDraft(body: HomeContent, silent = false) {
    setSaving(true);
    const res = await fetch("/api/admin/home", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok || !data?.content) {
      setMsg("Greška pri snimanju.");
      return false;
    }
    setDraft(data.content);
    setDirty(false);
    if (!silent) {
      setLastSavedAt(new Date().toLocaleTimeString("bs-BA"));
      setMsg("Nacrt snimljen.");
    }
    return true;
  }

  async function publish() {
    setErrors([]);
    const ok = await saveDraft(draft, true);
    if (!ok) return;
    setSaving(true);
    const res = await fetch("/api/admin/home/publish", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    setConfirmPublish(false);
    if (!res.ok) {
      setErrors(data?.errors ?? ["Objava nije uspjela."]);
      return;
    }
    setMsg("Objavljeno — živo je na www.maliistrazivaci.ba.");
  }

  return (
    <>
      <div className="adm-bar">
        <span className="adm-bar-title">Početna stranica</span>
        <span className="adm-save-state" data-dirty={dirty}>
          {saving
            ? "Snimam…"
            : dirty
              ? "Nesnimljene izmjene"
              : lastSavedAt
                ? `Nacrt snimljen u ${lastSavedAt}`
                : "Sve snimljeno"}
        </span>
        <span className="adm-bar-spacer" />
        <button type="button" className="adm-btn" onClick={() => saveDraft(draft)} disabled={saving}>
          SNIMI NACRT
        </button>
        <a
          href="/admin/preview/home"
          target="_blank"
          rel="noreferrer"
          className="adm-btn"
          onClick={() => {
            if (dirty) saveDraft(draft, true);
          }}
        >
          PREGLED
        </a>
        <button
          type="button"
          className="adm-btn adm-btn-green"
          onClick={() => setConfirmPublish(true)}
          disabled={saving}
        >
          OBJAVI
        </button>
      </div>

      {errors.length > 0 ? (
        <div className="adm-note adm-note-err">
          <b>Objava nije moguća:</b>
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {msg ? <div className="adm-note adm-note-ok">{msg}</div> : null}

      <div className="adm-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="adm-tab"
            data-active={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" ? (
        <div className="adm-card">
          <div className="adm-card-title">Hero — generička/atmosferska sekcija</div>
          <p className="adm-hint">
            Nije vezana za jedan konkretan proizvod — stvarne fotografije
            kao ugođaj, dugme skroluje do proizvoda ispod.
          </p>
          <TextField
            label="Naslov"
            value={draft.heroNaslov}
            onChange={(v) => patch({ heroNaslov: v })}
          />
          <TextArea
            label="Podnaslov"
            value={draft.heroPodnaslov}
            onChange={(v) => patch({ heroPodnaslov: v })}
            rows={2}
          />
          <TextField
            label="Tekst dugmeta"
            value={draft.heroCtaTekst}
            onChange={(v) => patch({ heroCtaTekst: v })}
          />

          <div className="adm-field">
            <label>Fotografije (atmosfera — prva se koristi kao glavna)</label>
            {draft.heroGalerija.map((g, i) => (
              <div key={i} className="adm-subcard" style={{ marginBottom: 8 }}>
                <MediaField
                  label={`Slika ${i + 1}`}
                  value={g.url}
                  accept="image"
                  onChange={(url, alt) =>
                    patch({
                      heroGalerija: draft.heroGalerija.map((x, idx) =>
                        idx === i ? { url, alt: alt ?? x.alt } : x
                      ),
                    })
                  }
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <MoveButtons
                    i={i}
                    len={draft.heroGalerija.length}
                    onMove={(dir) => patch({ heroGalerija: move(draft.heroGalerija, i, dir) })}
                  />
                  <button
                    type="button"
                    className="adm-btn adm-btn-sm adm-btn-danger"
                    onClick={() =>
                      patch({ heroGalerija: draft.heroGalerija.filter((_, idx) => idx !== i) })
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
              onClick={() => patch({ heroGalerija: [...draft.heroGalerija, { url: "", alt: "" }] })}
            >
              + DODAJ SLIKU
            </button>
          </div>
        </div>
      ) : null}

      {tab === "kategorije" ? (
        <div className="adm-card">
          <div className="adm-card-title">Kupuj po kategoriji</div>
          <p className="adm-hint">
            Tačno 5 kategorija (fiksno). Kategorija bez fotografije se ne
            prikazuje na početnoj, bez obzira na prekidač.
          </p>
          {draft.kategorijeTiles.map((t, i) => (
            <div key={t.kategorija} className="adm-subcard" style={{ marginBottom: 8 }}>
              <div className="adm-subcard-head">
                <b>{CATEGORY_LABELS[t.kategorija]}</b>
                <div style={{ display: "flex", gap: 6 }}>
                  <MoveButtons
                    i={i}
                    len={draft.kategorijeTiles.length}
                    onMove={(dir) =>
                      patch({ kategorijeTiles: move(draft.kategorijeTiles, i, dir) })
                    }
                  />
                </div>
              </div>
              <MediaField
                label="Fotografija kategorije"
                value={t.slika}
                accept="image"
                onChange={(url) =>
                  patch({
                    kategorijeTiles: draft.kategorijeTiles.map((x, idx) =>
                      idx === i ? { ...x, slika: url } : x
                    ),
                  })
                }
              />
              <TextField
                label="Tekst na pločici"
                value={t.alt}
                onChange={(v) =>
                  patch({
                    kategorijeTiles: draft.kategorijeTiles.map((x, idx) =>
                      idx === i ? { ...x, alt: v } : x
                    ),
                  })
                }
              />
              <Toggle
                label="Prikaži na početnoj"
                value={t.prikazi}
                onChange={(v) =>
                  patch({
                    kategorijeTiles: draft.kategorijeTiles.map((x, idx) =>
                      idx === i ? { ...x, prikazi: v } : x
                    ),
                  })
                }
              />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "hit" ? (
        <div className="adm-card">
          <div className="adm-card-title">Hit proizvodi</div>
          <p className="adm-hint">
            Automatski rang po stvarnoj prodaji (zadnjih 30 dana). Dodaj
            proizvode ispod da RUČNO zakucaš redoslijed — čim lista nije
            prazna, potpuno zamjenjuje automatski rang.
          </p>

          <div className="adm-subcard" style={{ marginBottom: 14 }}>
            <div className="adm-subcard-head">
              <b>Automatski rang baš sad</b>
            </div>
            {ranking === null ? (
              <p className="adm-hint">Učitavam…</p>
            ) : ranking.length === 0 ? (
              <p className="adm-hint">Nema dovoljno podataka.</p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {ranking.slice(0, 12).map((r) => (
                  <li key={r.link} className="adm-hint" style={{ color: "var(--ink)" }}>
                    {r.naziv} {r.bestseller ? <b style={{ color: "#f2791e" }}>🔥</b> : null}
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="adm-field">
            <label>Ručno zakucan redoslijed ({draft.hitProizvodiPinned.length} proizvoda)</label>
            {draft.hitProizvodiPinned.map((link, i) => {
              const p = products.find((x) => x.link === link);
              return (
                <div key={link} className="adm-list-item">
                  <span style={{ flex: 1 }}>{p?.naziv ?? link}</span>
                  <MoveButtons
                    i={i}
                    len={draft.hitProizvodiPinned.length}
                    onMove={(dir) =>
                      patch({ hitProizvodiPinned: move(draft.hitProizvodiPinned, i, dir) })
                    }
                  />
                  <button
                    type="button"
                    className="adm-btn adm-btn-icon adm-btn-danger"
                    onClick={() =>
                      patch({
                        hitProizvodiPinned: draft.hitProizvodiPinned.filter((x) => x !== link),
                      })
                    }
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            <SelectField
              label="+ Dodaj proizvod"
              value=""
              onChange={(v) => {
                if (v && !draft.hitProizvodiPinned.includes(v)) {
                  patch({ hitProizvodiPinned: [...draft.hitProizvodiPinned, v] });
                }
              }}
              options={[
                { value: "", label: "— izaberi proizvod —" },
                ...products
                  .filter((p) => !draft.hitProizvodiPinned.includes(p.link))
                  .map((p) => ({ value: p.link, label: p.naziv })),
              ]}
            />
            {draft.hitProizvodiPinned.length > 0 ? (
              <button
                type="button"
                className="adm-btn adm-btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => patch({ hitProizvodiPinned: [] })}
              >
                VRATI NA AUTOMATSKI RANG
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "faq" ? (
        <div className="adm-card">
          <div className="adm-card-title">Česta pitanja</div>
          {draft.faq.map((f, i) => (
            <div key={f.id} className="adm-subcard" style={{ marginBottom: 8 }}>
              <div className="adm-subcard-head">
                <div style={{ display: "flex", gap: 6 }}>
                  <MoveButtons
                    i={i}
                    len={draft.faq.length}
                    onMove={(dir) => patch({ faq: move(draft.faq, i, dir) })}
                  />
                  <button
                    type="button"
                    className="adm-btn adm-btn-icon adm-btn-danger"
                    onClick={() => patch({ faq: draft.faq.filter((_, idx) => idx !== i) })}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <TextField
                label="Pitanje"
                value={f.pitanje}
                onChange={(v) =>
                  patch({
                    faq: draft.faq.map((x, idx) => (idx === i ? { ...x, pitanje: v } : x)),
                  })
                }
              />
              <TextArea
                label="Odgovor"
                value={f.odgovor}
                onChange={(v) =>
                  patch({
                    faq: draft.faq.map((x, idx) => (idx === i ? { ...x, odgovor: v } : x)),
                  })
                }
                rows={3}
              />
            </div>
          ))}
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            onClick={() => {
              const item: FaqItem = {
                id: `faq_${Math.random().toString(36).slice(2, 10)}`,
                pitanje: "",
                odgovor: "",
              };
              patch({ faq: [...draft.faq, item] });
            }}
          >
            + DODAJ PITANJE
          </button>
        </div>
      ) : null}

      {tab === "sekcije" ? (
        <div className="adm-card">
          <div className="adm-card-title">Redoslijed sekcija</div>
          <p className="adm-hint">
            Header, hero i footer su uvijek uključeni — ovo je samo za
            opcionalne sekcije ispod hero-a.
          </p>
          {draft.sections.map((s, i) => (
            <div key={s.key} className="adm-list-item">
              <span style={{ flex: 1 }}>{HOME_SECTION_LABELS[s.key]}</span>
              <Toggle
                label=""
                value={s.prikazi}
                onChange={(v) =>
                  patch({
                    sections: draft.sections.map((x, idx) =>
                      idx === i ? { ...x, prikazi: v } : x
                    ) as HomeSection[],
                  })
                }
              />
              <MoveButtons
                i={i}
                len={draft.sections.length}
                onMove={(dir) => patch({ sections: move(draft.sections, i, dir) })}
              />
            </div>
          ))}
        </div>
      ) : null}

      {confirmPublish ? (
        <ConfirmModal
          title="Objaviti izmjene na početnoj?"
          text="Ovo odmah mijenja javnu stranicu www.maliistrazivaci.ba — svi posjetitelji odmah vide novu verziju."
          confirmLabel="OBJAVI"
          busy={saving}
          onConfirm={publish}
          onCancel={() => setConfirmPublish(false)}
        />
      ) : null}
    </>
  );
}
