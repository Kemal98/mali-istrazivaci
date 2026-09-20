"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "./ConfirmModal";
import MediaField from "./MediaField";
import PageBuilder from "./PageBuilder";
import ReviewsPanel from "./ReviewsPanel";
import { NumberField, TextArea, TextField, Toggle } from "./fields";
import { slugify } from "@/lib/cms/slug";
import type { Block, GlobalSettings, Hero, Product, Review, Seo } from "@/lib/cms/types";

type Tab = "osnovno" | "hero" | "sadrzaj" | "recenzije" | "seo";

const TABS: { id: Tab; label: string }[] = [
  { id: "osnovno", label: "Osnovno" },
  { id: "hero", label: "Hero" },
  { id: "sadrzaj", label: "Sadržaj stranice" },
  { id: "recenzije", label: "Recenzije" },
  { id: "seo", label: "SEO" },
];

interface Draft {
  naziv: string;
  slug: string;
  sku: string;
  kategorija: string;
  cijena: number | null;
  staraCijena: number | null;
  nabavnaCijena: number | null;
  badge: string;
  hero: Hero;
  seo: Seo;
  sections: Block[];
}

function toDraft(p: Product): Draft {
  return {
    naziv: p.naziv,
    slug: p.slug,
    sku: p.sku,
    kategorija: p.kategorija,
    cijena: p.cijena,
    staraCijena: p.staraCijena,
    nabavnaCijena: p.nabavnaCijena,
    badge: p.badge,
    hero: p.hero,
    seo: p.seo,
    sections: p.sections,
  };
}

export default function ProductEditor({
  product,
  reviews,
  products,
  settings,
}: {
  product: Product;
  reviews: Review[];
  products: { id: string; naziv: string }[];
  settings: GlobalSettings;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("osnovno");
  const [saved, setSaved] = useState<Product>(product);
  const [draft, setDraft] = useState<Draft>(() => toDraft(product));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [msg, setMsg] = useState<React.ReactNode>("");
  const [slugRucno, setSlugRucno] = useState(true);
  const [preview, setPreview] = useState<null | "mobile" | "desktop">(null);
  const [confirmAction, setConfirmAction] = useState<null | "unpublish" | "delete">(
    null
  );
  const [previewNonce, setPreviewNonce] = useState(0);

  // Nakon "Uvezi sa linka" (vidi ImportProductButton) slike se skidaju u
  // pozadini (after()), pa odmah poslije preusmjeravanja još nisu tu —
  // pročita se iz URL-a (?uvozSlika=N), ne iz propsa, jer se productId
  // ne mijenja ali sadržaj hoće kad admin osvježi.
  const [uvozNajava, setUvozNajava] = useState(0);
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("uvozSlika"));
    if (n > 0) setUvozNajava(n);
  }, []);

  const patch = useCallback((p: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...p }));
    setDirty(true);
    setMsg("");
  }, []);

  const patchHero = useCallback(
    (p: Partial<Hero>) => {
      setDraft((d) => ({ ...d, hero: { ...d.hero, ...p } }));
      setDirty(true);
      setMsg("");
    },
    []
  );

  const patchSeo = useCallback((p: Partial<Seo>) => {
    setDraft((d) => ({ ...d, seo: { ...d.seo, ...p } }));
    setDirty(true);
    setMsg("");
  }, []);

  /** Sprema SAMO nacrt. Nikad ne objavljuje. */
  const saveDraft = useCallback(
    async (body: Draft, silent = false) => {
      setSaving(true);
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      setSaving(false);

      if (!res.ok || !data?.product) {
        if (!silent) setMsg("Snimanje nije uspjelo. Pokušajte ponovo.");
        return false;
      }

      const p = data.product as Product;
      setSaved(p);
      setDirty(false);
      setLastSavedAt(
        new Date().toLocaleTimeString("bs-BA", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      // Server vrati stari slug ako je novi bio zauzet — reci to jasno
      if (body.slug && slugify(body.slug) !== p.slug) {
        setDraft((d) => ({ ...d, slug: p.slug }));
        setMsg(
          `URL „${slugify(body.slug)}" već koristi drugi proizvod, vraćen je /${p.slug}.`
        );
      }
      setPreviewNonce((n) => n + 1);
      return true;
    },
    [product.id]
  );

  // AUTOSAVE — samo nacrt, nikad objava. 2.5 s nakon zadnje promjene.
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      saveDraft(draft, true);
    }, 2500);
    return () => clearTimeout(t);
  }, [dirty, draft, saveDraft]);

  // Upozorenje na nesnimljene izmjene (registruje se samo dok ih ima)
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function publish() {
    setErrors([]);
    setMsg("");
    const ok = await saveDraft(draft, true);
    if (!ok) return;
    setSaving(true);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setErrors(data?.errors ?? [data?.error || "Objava nije uspjela."]);
      return;
    }
    setSaved(data.product);
    setMsg(
      <>
        Objavljeno. Stranica je živa na{" "}
        <a
          href={`/${data.product.slug}`}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "underline" }}
        >
          /{data.product.slug}
        </a>
        .
      </>
    );
    router.refresh();
  }

  async function unpublish() {
    setConfirmAction(null);
    setSaving(true);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unpublish" }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setSaved(data.product);
      setMsg("Proizvod je skinut sa objave. Nacrt je netaknut.");
      router.refresh();
    }
  }

  async function duplicate() {
    setSaving(true);
    await saveDraft(draft, true);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) router.push(`/admin/products/${data.product.id}`);
  }

  async function remove() {
    setConfirmAction(null);
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/products");
  }

  async function saveAsTemplate() {
    await saveDraft(draft, true);
    const naziv = window.prompt(
      "Naziv šablona:",
      `Šablon — ${draft.naziv || "proizvod"}`
    );
    if (!naziv) return;
    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naziv, fromProductId: product.id }),
    });
    if (res.ok) setMsg(`Šablon „${naziv}" je snimljen.`);
  }

  // Lokalna provjera prije objave — ista pravila kao na serveru,
  // samo da korisnik odmah vidi šta fali (server je i dalje autoritet).
  const localErrors = useMemo(() => {
    const e: string[] = [];
    if (!draft.naziv.trim()) e.push("Dodajte naziv proizvoda prije objave.");
    if (!draft.slug.trim()) e.push("Dodajte URL (slug) prije objave.");
    if (draft.cijena === null) e.push("Dodajte cijenu prije objave.");
    if (!draft.hero.slika) e.push("Dodajte glavnu fotografiju prije objave.");
    return e;
  }, [draft]);

  const previewUrl = `/admin/preview/${product.id}?bare=1&v=${previewNonce}`;

  return (
    <>
      <div className="adm-bar">
        <span className="adm-bar-title">{draft.naziv || "(bez naziva)"}</span>
        <span
          className={`adm-badge ${
            saved.status === "published" ? "adm-badge-pub" : "adm-badge-draft"
          }`}
        >
          {saved.status === "published" ? "Objavljeno" : "Nacrt"}
        </span>
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

        <button
          type="button"
          className="adm-btn"
          onClick={() => saveDraft(draft)}
          disabled={saving}
        >
          SNIMI NACRT
        </button>
        <button
          type="button"
          className="adm-btn"
          onClick={async () => {
            if (dirty) await saveDraft(draft, true);
            setPreviewNonce((n) => n + 1);
            setPreview("mobile");
          }}
        >
          PREVIEW
        </button>
        <button
          type="button"
          className="adm-btn adm-btn-green"
          onClick={publish}
          disabled={saving}
        >
          {saved.status === "published" ? "AŽURIRAJ OBJAVU" : "OBJAVI"}
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

      {uvozNajava > 0 ? (
        <div className="adm-note adm-note-info">
          Uvoz u toku — {uvozNajava}{" "}
          {uvozNajava === 1 ? "slika se" : "slika/e se"} skida u pozadini.
          Osvježi stranicu za par sekundi da ih vidiš u sadržaju.
        </div>
      ) : null}

      {msg ? <div className="adm-note adm-note-ok">{msg}</div> : null}

      {localErrors.length > 0 ? (
        <div className="adm-note adm-note-info">
          <b>Prije objave još treba:</b>
          <ul>
            {localErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

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
            {t.id === "sadrzaj" ? ` (${draft.sections.length})` : ""}
            {t.id === "recenzije" ? ` (${reviews.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "osnovno" ? (
        <>
          <div className="adm-card">
            <div className="adm-card-title">Osnovni podaci</div>
            <TextField
              label="Naziv proizvoda"
              value={draft.naziv}
              onChange={(v) => {
                patch({ naziv: v });
                if (!slugRucno) patch({ slug: slugify(v) });
              }}
            />
            <TextField
              label="URL (slug)"
              value={draft.slug}
              onChange={(v) => {
                setSlugRucno(true);
                patch({ slug: v });
              }}
              hint={`Stranica: /${draft.slug || "…"} — mora biti jedinstven. Mijenjanje URL-a objavljenog proizvoda pokvari stare linkove i reklame.`}
            />
            <label className="adm-check">
              <input
                type="checkbox"
                checked={!slugRucno}
                onChange={(e) => {
                  setSlugRucno(!e.target.checked);
                  if (e.target.checked) patch({ slug: slugify(draft.naziv) });
                }}
              />
              Automatski pravi URL iz naziva
            </label>
            <div className="adm-row">
              <TextField
                label="SKU (interna šifra)"
                value={draft.sku}
                onChange={(v) => patch({ sku: v })}
              />
              <TextField
                label="Kategorija"
                value={draft.kategorija}
                onChange={(v) => patch({ kategorija: v })}
              />
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card-title">Cijena</div>
            <div className="adm-row-3 adm-row">
              <NumberField
                label="Cijena (KM)"
                value={draft.cijena}
                onChange={(v) => patch({ cijena: v })}
              />
              <NumberField
                label="Stara cijena (precrtana)"
                value={draft.staraCijena}
                onChange={(v) => patch({ staraCijena: v })}
                hint="Ostavite prazno ako nema akcije."
              />
              <TextField
                label="Badge pored cijene"
                value={draft.badge}
                onChange={(v) => patch({ badge: v })}
                placeholder="npr. AKCIJA"
              />
            </div>
            <div className="adm-row-3 adm-row" style={{ marginTop: 10 }}>
              <NumberField
                label="Nabavna cijena (KM)"
                value={draft.nabavnaCijena}
                onChange={(v) => patch({ nabavnaCijena: v })}
                hint="Koliko VI platite dobavljaču po komadu — kupac ovo nikad ne vidi."
              />
            </div>
            <div className="adm-note adm-note-info">
              Nabavna cijena se koristi samo za profit u dashboardu — svaka
              nova narudžba je "fotografiše" u trenutku prodaje, pa kasnija
              promjena ne mijenja stare izvještaje.
            </div>
            <div className="adm-note adm-note-info">
              Dostava se dodaje u formi ({10} KM) isto kao i na ostalim
              stranicama — narudžbe idu u istu Google tabelu.
            </div>
          </div>

          <div className="adm-card">
            <div className="adm-card-title">Ostale akcije</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="adm-btn" onClick={duplicate}>
                DUPLICIRAJ PROIZVOD
              </button>
              <button type="button" className="adm-btn" onClick={saveAsTemplate}>
                SNIMI KAO ŠABLON
              </button>
              {saved.status === "published" ? (
                <>
                  <a
                    className="adm-btn"
                    href={`/${saved.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ↗ OTVORI ŽIVU STRANICU
                  </a>
                  <button
                    type="button"
                    className="adm-btn"
                    onClick={() => setConfirmAction("unpublish")}
                  >
                    SKINI SA OBJAVE
                  </button>
                </>
              ) : null}
              <button
                type="button"
                className="adm-btn adm-btn-danger"
                onClick={() => setConfirmAction("delete")}
              >
                OBRIŠI PROIZVOD
              </button>
            </div>
          </div>
        </>
      ) : null}

      {tab === "hero" ? (
        <div className="adm-card">
          <div className="adm-card-title">Hero sekcija (prvi ekran)</div>

          <MediaField
            label="Glavna fotografija"
            value={draft.hero.slika}
            accept="image"
            onChange={(url, alt) =>
              patchHero({ slika: url, alt: draft.hero.alt || alt || "" })
            }
            hint="Obavezno prije objave."
          />
          <TextField
            label="Alt tekst glavne slike"
            value={draft.hero.alt ?? ""}
            onChange={(v) => patchHero({ alt: v })}
          />

          <div className="adm-field">
            <label>Dodatne slike (male, ispod glavne)</label>
            <p className="adm-hint" style={{ marginTop: -3, marginBottom: 8 }}>
              Kupac ih vidi kao red malih slika ispod glavne fotografije —
              klikne na jednu i ona postane glavna. Isto se automatski
              popuni kad koristiš "Uvezi sa linka".
            </p>
            {(draft.hero.galerija ?? []).map((g, i) => {
              const gal = draft.hero.galerija ?? [];
              return (
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
                      patchHero({
                        galerija: gal.map((x, idx) =>
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
                        const next = [...gal];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        patchHero({ galerija: next });
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm"
                      disabled={i === gal.length - 1}
                      onClick={() => {
                        const next = [...gal];
                        [next[i + 1], next[i]] = [next[i], next[i + 1]];
                        patchHero({ galerija: next });
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm adm-btn-danger"
                      onClick={() =>
                        patchHero({ galerija: gal.filter((_, idx) => idx !== i) })
                      }
                    >
                      UKLONI
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              onClick={() =>
                patchHero({
                  galerija: [...(draft.hero.galerija ?? []), { url: "", alt: "" }],
                })
              }
            >
              + DODAJ SLIKU
            </button>
          </div>

          <TextField
            label="Naslov — prva linija"
            value={draft.hero.naslovLinija1}
            onChange={(v) => patchHero({ naslovLinija1: v })}
          />
          <TextField
            label="Naslov — druga linija (opcionalno)"
            value={draft.hero.naslovLinija2 ?? ""}
            onChange={(v) => patchHero({ naslovLinija2: v })}
          />

          <hr style={{ border: "none", borderTop: "1px solid #e3e5e9", margin: "14px 0" }} />

          <Toggle
            label="Prikaži cijenu u hero sekciji"
            value={draft.hero.prikaziCijenu}
            onChange={(v) => patchHero({ prikaziCijenu: v })}
          />
          <Toggle
            label="Prikaži badge pored cijene"
            value={draft.hero.prikaziBadge}
            onChange={(v) => patchHero({ prikaziBadge: v })}
          />
          <Toggle
            label="Prikaži ocjenu / social proof iznad cijene"
            value={draft.hero.prikaziRating}
            onChange={(v) => patchHero({ prikaziRating: v })}
          />
          {draft.hero.prikaziRating ? (
            <>
              <TextField
                label="Tekst iznad zvjezdica"
                value={draft.hero.ratingTekst ?? ""}
                onChange={(v) => patchHero({ ratingTekst: v })}
                placeholder="npr. Pogledaj šta kažu roditelji"
              />
              <div className="adm-row">
                <TextField
                  label="Ocjena"
                  value={draft.hero.ratingVrijednost ?? ""}
                  onChange={(v) => patchHero({ ratingVrijednost: v })}
                />
                <TextField
                  label="Broj ocjena"
                  value={draft.hero.ratingBrojOcjena ?? ""}
                  onChange={(v) => patchHero({ ratingBrojOcjena: v })}
                  hint="Upišite samo stvaran broj recenzija."
                />
              </div>
            </>
          ) : null}

          <hr style={{ border: "none", borderTop: "1px solid #e3e5e9", margin: "14px 0" }} />

          <TextField
            label="Tekst na dugmetu"
            value={draft.hero.ctaTekst}
            onChange={(v) => patchHero({ ctaTekst: v })}
            hint={`Globalno podrazumijevano: „${settings.defaultCtaTekst}".`}
          />
          <Toggle
            label="Prikaži tekst ispod dugmeta"
            value={draft.hero.prikaziCtaPodtekst}
            onChange={(v) => patchHero({ prikaziCtaPodtekst: v })}
          />
          {draft.hero.prikaziCtaPodtekst ? (
            <TextField
              label="Tekst ispod dugmeta"
              value={draft.hero.ctaPodtekst ?? ""}
              onChange={(v) => patchHero({ ctaPodtekst: v })}
              hint={`Globalno: „${settings.placanjeTekst}, ${settings.dostavaTekst}".`}
            />
          ) : null}
        </div>
      ) : null}

      {tab === "sadrzaj" ? (
        <>
          <div className="adm-note adm-note-info">
            Blokovi se prevlače hvataljkom <b>⠿</b> ili pomjeraju strelicama.
            Redoslijed ovdje je tačan redoslijed na stranici. Hero i forma za
            narudžbu su fiksni — oni nisu blokovi.
          </div>
          <PageBuilder
            sections={draft.sections}
            onChange={(sections) => patch({ sections })}
          />
        </>
      ) : null}

      {tab === "recenzije" ? (
        <div className="adm-card">
          <div className="adm-card-title">
            Recenzije za ovaj proizvod
          </div>
          <ReviewsPanel
            productId={product.id}
            products={products}
            initial={reviews}
            compact
          />
        </div>
      ) : null}

      {tab === "seo" ? (
        <div className="adm-card">
          <div className="adm-card-title">SEO i dijeljenje</div>
          <TextField
            label="SEO naslov (title)"
            value={draft.seo.title ?? ""}
            onChange={(v) => patchSeo({ title: v })}
            hint={`Ako je prazno, koristi se: „${draft.naziv} | Mali Istraživači".`}
          />
          <TextArea
            label="Meta opis"
            value={draft.seo.description ?? ""}
            onChange={(v) => patchSeo({ description: v })}
            rows={3}
            hint="Najbolje 120–160 znakova."
          />
          <TextField
            label="OG naslov (Facebook/Instagram)"
            value={draft.seo.ogTitle ?? ""}
            onChange={(v) => patchSeo({ ogTitle: v })}
          />
          <TextArea
            label="OG opis"
            value={draft.seo.ogDescription ?? ""}
            onChange={(v) => patchSeo({ ogDescription: v })}
            rows={2}
          />
          <MediaField
            label="OG slika (za dijeljenje)"
            value={draft.seo.ogImage ?? ""}
            accept="image"
            onChange={(url) => patchSeo({ ogImage: url })}
            hint="Ako je prazno, koristi se glavna fotografija."
          />
          <TextField
            label="Canonical URL (opcionalno)"
            value={draft.seo.canonical ?? ""}
            onChange={(v) => patchSeo({ canonical: v })}
          />
        </div>
      ) : null}

      {preview ? (
        <div
          className="adm-modal-bg"
          onClick={(e) => e.target === e.currentTarget && setPreview(null)}
        >
          <div className="adm-modal adm-modal-lg" role="dialog" aria-modal="true">
            <div className="adm-preview-toolbar">
              <h2 style={{ flex: "1 1 auto" }}>Pregled nacrta</h2>
              <button
                type="button"
                className={`adm-btn adm-btn-sm ${
                  preview === "mobile" ? "adm-btn-primary" : ""
                }`}
                onClick={() => setPreview("mobile")}
              >
                MOBILNI
              </button>
              <button
                type="button"
                className={`adm-btn adm-btn-sm ${
                  preview === "desktop" ? "adm-btn-primary" : ""
                }`}
                onClick={() => setPreview("desktop")}
              >
                DESKTOP
              </button>
              <a
                className="adm-btn adm-btn-sm"
                href={`/admin/preview/${product.id}`}
                target="_blank"
                rel="noreferrer"
              >
                ↗ NOVI TAB
              </a>
              <button
                type="button"
                className="adm-btn adm-btn-sm"
                onClick={() => setPreview(null)}
              >
                ZATVORI
              </button>
            </div>
            <div className="adm-preview-stage">
              <iframe
                key={`${preview}-${previewNonce}`}
                className="adm-preview-frame"
                data-device={preview}
                src={previewUrl}
                title="Pregled nacrta"
              />
            </div>
            <p className="adm-hint" style={{ marginTop: 8 }}>
              Ovo je <b>nacrt</b>. Javna stranica se ne mijenja dok ne kliknete{" "}
              <b>{saved.status === "published" ? "AŽURIRAJ OBJAVU" : "OBJAVI"}</b>.
            </p>
          </div>
        </div>
      ) : null}

      {confirmAction === "unpublish" ? (
        <ConfirmModal
          title="Skinuti proizvod sa objave?"
          text={
            <>
              <b>/{saved.slug}</b> će vraćati 404 dok ga ponovo ne objavite.
            </>
          }
          confirmLabel="SKINI SA OBJAVE"
          onConfirm={unpublish}
          onCancel={() => setConfirmAction(null)}
        />
      ) : null}

      {confirmAction === "delete" ? (
        <ConfirmModal
          title="Obrisati proizvod?"
          text={
            <>
              Proizvod se arhivira i stranica <b>/{saved.slug}</b> prestaje
              raditi. Podaci ostaju u bazi.
            </>
          }
          confirmLabel="OBRIŠI"
          danger
          onConfirm={remove}
          onCancel={() => setConfirmAction(null)}
        />
      ) : null}
    </>
  );
}
