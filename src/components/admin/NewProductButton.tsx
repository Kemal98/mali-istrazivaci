"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/cms/slug";
import type { Product, Template } from "@/lib/cms/types";

type Osnova = "template" | "blank" | "copy";

// "NOVI PROIZVOD" nudi tri načina: podrazumijevani šablon, prazna
// stranica, ili kopija postojećeg proizvoda.
export default function NewProductButton({
  templates,
  products,
}: {
  templates: Template[];
  products: Product[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [naziv, setNaziv] = useState("");
  const [slug, setSlug] = useState("");
  const [slugRucno, setSlugRucno] = useState(false);
  // Šabloni po vrsti proizvoda (tpl_sablon_*) idu prvi i prvi je izabran.
  const sorted = [...templates].sort(
    (a, b) =>
      Number(b.id.startsWith("tpl_sablon_")) - Number(a.id.startsWith("tpl_sablon_"))
  );
  const defaultTpl = sorted[0] ?? null;
  const [osnova, setOsnova] = useState<Osnova>(defaultTpl ? "template" : "blank");
  const [templateId, setTemplateId] = useState(defaultTpl?.id ?? "");
  const [copyFromId, setCopyFromId] = useState(products[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function setNazivAndSlug(v: string) {
    setNaziv(v);
    if (!slugRucno) setSlug(slugify(v));
  }

  async function create() {
    if (!naziv.trim()) {
      setError("Upišite naziv proizvoda.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        naziv: naziv.trim(),
        slug: slug.trim(),
        templateId: osnova === "template" ? templateId : null,
        copyFromId: osnova === "copy" ? copyFromId : null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Greška pri kreiranju.");
      setBusy(false);
      return;
    }
    router.push(`/admin/products/${data.product.id}`);
  }

  return (
    <>
      <button
        type="button"
        className="adm-btn adm-btn-primary"
        onClick={() => setOpen(true)}
      >
        + NOVI PROIZVOD
      </button>

      {open && (
        <div
          className="adm-modal-bg"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="adm-modal" role="dialog" aria-modal="true">
            <h2>Novi proizvod</h2>
            <p className="adm-hint" style={{ marginBottom: 16 }}>
              Proizvod se pravi kao <b>nacrt</b> — javno se ne vidi dok ga ne
              objavite.
            </p>

            {error ? <div className="adm-note adm-note-err">{error}</div> : null}

            <div className="adm-field">
              <label htmlFor="np-naziv">Naziv proizvoda</label>
              <input
                id="np-naziv"
                type="text"
                value={naziv}
                onChange={(e) => setNazivAndSlug(e.target.value)}
                placeholder="npr. Sparkling Diamond aparat za kosu"
                autoFocus
              />
            </div>

            <div className="adm-field">
              <label htmlFor="np-slug">URL (slug)</label>
              <input
                id="np-slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugRucno(true);
                  setSlug(e.target.value);
                }}
                placeholder="automatski iz naziva"
              />
              <span className="adm-hint">
                Stranica će biti na <b>/{slug || "…"}</b>. Ako je zauzet, sistem
                dodaje broj na kraj.
              </span>
            </div>

            <div className="adm-field">
              <label>Na osnovu čega?</label>
              <label className="adm-check">
                <input
                  type="radio"
                  name="osnova"
                  checked={osnova === "template"}
                  disabled={!templates.length}
                  onChange={() => setOsnova("template")}
                />
                Šablon
                {!templates.length ? " (nema još ni jedan šablon)" : ""}
              </label>
              {osnova === "template" && templates.length > 0 ? (
                <div className="adm-tpl-pick">
                  {sorted.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      data-active={templateId === t.id}
                      onClick={() => setTemplateId(t.id)}
                    >
                      {t.naziv}
                    </button>
                  ))}
                </div>
              ) : null}

              <label className="adm-check">
                <input
                  type="radio"
                  name="osnova"
                  checked={osnova === "blank"}
                  onChange={() => setOsnova("blank")}
                />
                Prazna stranica
              </label>

              <label className="adm-check">
                <input
                  type="radio"
                  name="osnova"
                  checked={osnova === "copy"}
                  disabled={!products.length}
                  onChange={() => setOsnova("copy")}
                />
                Kopija postojećeg proizvoda
              </label>
              {osnova === "copy" && products.length > 0 ? (
                <select
                  value={copyFromId}
                  onChange={(e) => setCopyFromId(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.naziv}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            <div className="adm-modal-foot">
              <button
                type="button"
                className="adm-btn"
                onClick={() => setOpen(false)}
              >
                OTKAŽI
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={create}
                disabled={busy}
              >
                {busy ? "Pravim…" : "NAPRAVI I UREDI"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
