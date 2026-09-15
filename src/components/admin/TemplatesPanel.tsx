"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "./ConfirmModal";
import { BLOCK_LABELS, type Product, type Template } from "@/lib/cms/types";

export default function TemplatesPanel({
  initial,
  products,
}: {
  initial: Template[];
  products: Product[];
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initial);
  const [toDelete, setToDelete] = useState<Template | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [fromId, setFromId] = useState(products[0]?.id ?? "");
  const [naziv, setNaziv] = useState("");

  async function reload() {
    const res = await fetch("/api/admin/templates");
    const data = await res.json().catch(() => ({}));
    if (data?.templates) setTemplates(data.templates);
    router.refresh();
  }

  async function createFromProduct() {
    if (!fromId) return;
    setBusy(true);
    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        naziv:
          naziv.trim() ||
          `Šablon — ${products.find((p) => p.id === fromId)?.naziv ?? "proizvod"}`,
        fromProductId: fromId,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setNaziv("");
      setMsg("Šablon je snimljen.");
      await reload();
    }
  }

  async function setDefault(t: Template) {
    setBusy(true);
    await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: t.id,
        naziv: t.naziv,
        hero: t.hero,
        sections: t.sections,
        isDefault: true,
      }),
    });
    setBusy(false);
    setMsg(`„${t.naziv}" je sada podrazumijevani šablon.`);
    await reload();
  }

  async function doDelete(t: Template) {
    setBusy(true);
    await fetch(`/api/admin/templates/${t.id}`, { method: "DELETE" });
    setBusy(false);
    setToDelete(null);
    await reload();
  }

  return (
    <>
      {msg ? <div className="adm-note adm-note-ok">{msg}</div> : null}

      <div className="adm-card">
        <div className="adm-card-title">Novi šablon iz postojećeg proizvoda</div>
        {products.length === 0 ? (
          <p className="adm-hint">
            Prvo napravite proizvod, pa ga možete snimiti kao šablon.
          </p>
        ) : (
          <div
            style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
          >
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              style={{
                font: "inherit",
                padding: "9px 11px",
                border: "1px solid #e3e5e9",
                borderRadius: 8,
              }}
              aria-label="Proizvod za šablon"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.naziv}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={naziv}
              onChange={(e) => setNaziv(e.target.value)}
              placeholder="Naziv šablona (opcionalno)"
              style={{
                font: "inherit",
                padding: "9px 11px",
                border: "1px solid #e3e5e9",
                borderRadius: 8,
                minWidth: 240,
              }}
            />
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              onClick={createFromProduct}
              disabled={busy}
            >
              SNIMI KAO ŠABLON
            </button>
          </div>
        )}
      </div>

      <div className="adm-card">
        <div className="adm-card-title">Šabloni</div>
        {templates.length === 0 ? (
          <div className="adm-empty">Nema šablona.</div>
        ) : (
          <div className="adm-builder">
            {templates.map((t) => (
              <div className="adm-block" key={t.id}>
                <div className="adm-block-head">
                  <span className="adm-block-type">
                    {t.sections.length} blokova
                  </span>
                  {t.isDefault ? (
                    <span className="adm-badge adm-badge-pub">
                      podrazumijevani
                    </span>
                  ) : null}
                  <span className="adm-block-preview">
                    <b>{t.naziv}</b>
                    {" — "}
                    {t.sections
                      .slice(0, 6)
                      .map((s) => BLOCK_LABELS[s.type])
                      .join(", ")}
                    {t.sections.length > 6 ? "…" : ""}
                  </span>
                  <div className="adm-block-tools">
                    {!t.isDefault ? (
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm"
                        onClick={() => setDefault(t)}
                        disabled={busy}
                      >
                        POSTAVI KAO PODRAZUMIJEVANI
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm adm-btn-danger"
                      onClick={() => setToDelete(t)}
                    >
                      OBRIŠI
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toDelete ? (
        <ConfirmModal
          title={`Obrisati šablon „${toDelete.naziv}"?`}
          text="Postojeći proizvodi napravljeni iz njega se ne mijenjaju."
          confirmLabel="OBRIŠI"
          danger
          busy={busy}
          onConfirm={() => doDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      ) : null}
    </>
  );
}
