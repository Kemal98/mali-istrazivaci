"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "./ConfirmModal";
import type { Product } from "@/lib/cms/types";
import { datum } from "@/lib/cms/datum";

/** Prag ispod kojeg se "Na stanju" prikazuje crveno — nisko, treba dopuniti. */
const LOW_STOCK = 5;

export default function ProductsTable({
  initial,
  stockEntries,
}: {
  initial: Product[];
  /** [normalizovano ime, na_stanju] — iz profitAsIfSold, nema nabavke = null. */
  stockEntries: [string, number | null][];
}) {
  const router = useRouter();
  const stockByName = new Map(stockEntries);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(initial);
  const [busyId, setBusyId] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: React.ReactNode } | null>(
    null
  );
  const [confirm, setConfirm] = useState<
    | { kind: "delete" | "unpublish"; product: Product }
    | null
  >(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState<"delete" | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const filtered = rows.filter((p) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      p.naziv.toLowerCase().includes(s) ||
      p.slug.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s)
    );
  });

  async function refresh() {
    const res = await fetch("/api/admin/products");
    const data = await res.json().catch(() => ({}));
    if (data?.products) setRows(data.products);
    router.refresh();
  }

  async function action(p: Product, act: "publish" | "unpublish" | "duplicate") {
    setBusyId(p.id);
    setMsg(null);
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId("");

    if (!res.ok) {
      setMsg({
        kind: "err",
        text: data?.errors ? (
          <>
            <b>Objava nije moguća:</b>
            <ul>
              {(data.errors as string[]).map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </>
        ) : (
          data?.error || "Greška."
        ),
      });
      return;
    }

    if (act === "duplicate") {
      setMsg({
        kind: "ok",
        text: `Kopija napravljena kao nacrt: „${data.product.naziv}" (/${data.product.slug}).`,
      });
    } else if (act === "publish") {
      setMsg({ kind: "ok", text: `„${p.naziv}" je objavljen na /${p.slug}.` });
    } else {
      setMsg({ kind: "ok", text: `„${p.naziv}" je skinut sa objave.` });
    }
    await refresh();
  }

  async function doDelete(p: Product) {
    setBusyId(p.id);
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    setBusyId("");
    setConfirm(null);
    setMsg({ kind: "ok", text: `„${p.naziv}" je obrisan.` });
    await refresh();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id))
    );
  }

  /** Masovna akcija nad izabranim proizvodima — šalje isti poziv kao za
   *  jedan proizvod, samo redom za svaki izabrani (do 21 proizvoda u
   *  shopu, sekvencijalno je dovoljno brzo i ne opterećuje bazu). */
  async function bulkAction(act: "publish" | "unpublish" | "delete") {
    const ids = [...selected];
    if (!ids.length) return;
    setBulkBusy(true);
    setMsg(null);
    let failed = 0;
    for (const id of ids) {
      const res =
        act === "delete"
          ? await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
          : await fetch(`/api/admin/products/${id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: act }),
            });
      if (!res.ok) failed++;
    }
    setBulkBusy(false);
    setBulkConfirm(null);
    setSelected(new Set());
    const verb =
      act === "delete" ? "obrisano" : act === "publish" ? "objavljeno" : "skinuto sa objave";
    setMsg({
      kind: failed ? "err" : "ok",
      text: failed
        ? `${ids.length - failed}/${ids.length} ${verb}, ${failed} nije uspjelo (vjerovatno fali obavezno polje).`
        : `${ids.length} proizvoda ${verb}.`,
    });
    await refresh();
  }

  return (
    <>
      <div className="adm-search">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Traži po nazivu, URL-u ili SKU…"
          aria-label="Traži proizvod"
        />
        {q ? (
          <button type="button" className="adm-btn" onClick={() => setQ("")}>
            OČISTI
          </button>
        ) : null}
      </div>

      {msg ? (
        <div
          className={`adm-note ${msg.kind === "ok" ? "adm-note-ok" : "adm-note-err"}`}
        >
          {msg.text}
        </div>
      ) : null}

      {selected.size > 0 ? (
        <div className="adm-note adm-note-info" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <b>{selected.size} izabrano</b>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-green"
            disabled={bulkBusy}
            onClick={() => bulkAction("publish")}
          >
            OBJAVI SVE
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            disabled={bulkBusy}
            onClick={() => bulkAction("unpublish")}
          >
            SKINI SA OBJAVE
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-danger"
            disabled={bulkBusy}
            onClick={() => setBulkConfirm("delete")}
          >
            OBRIŠI
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            disabled={bulkBusy}
            onClick={() => setSelected(new Set())}
          >
            OTKAŽI IZBOR
          </button>
        </div>
      ) : null}

      <div className="adm-table-wrap">
        {filtered.length === 0 ? (
          <div className="adm-empty">
            {rows.length === 0
              ? "Još nema proizvoda."
              : "Nema proizvoda za tu pretragu."}
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleSelectAll}
                    aria-label="Izaberi sve"
                  />
                </th>
                <th style={{ width: 68 }}>Slika</th>
                <th>Naziv</th>
                <th>Cijena</th>
                <th>Na stanju</th>
                <th>Status</th>
                <th>URL</th>
                <th>Zadnja izmjena</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      aria-label={`Izaberi ${p.naziv || "proizvod"}`}
                    />
                  </td>
                  <td>
                    {p.hero?.slika ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img className="adm-thumb" src={p.hero.slika} alt="" />
                    ) : (
                      <div className="adm-thumb-empty">nema</div>
                    )}
                  </td>
                  <td>
                    <b>{p.naziv || "(bez naziva)"}</b>
                    {p.badge ? (
                      <div className="adm-hint">badge: {p.badge}</div>
                    ) : null}
                  </td>
                  <td>
                    {p.cijena === null ? (
                      <span className="adm-hint">—</span>
                    ) : (
                      <>
                        <b>{p.cijena} KM</b>
                        {p.staraCijena ? (
                          <div className="adm-hint">
                            <s>{p.staraCijena} KM</s>
                          </div>
                        ) : null}
                      </>
                    )}
                  </td>
                  <td>
                    {(() => {
                      const stock = stockByName.get(p.naziv.trim().toLowerCase());
                      if (stock === undefined || stock === null)
                        return <span className="adm-hint">—</span>;
                      if (stock <= 0)
                        return (
                          <b style={{ color: "#b3261e" }}>Rasprodano</b>
                        );
                      if (stock < LOW_STOCK)
                        return <b style={{ color: "#b3261e" }}>{stock} kom</b>;
                      return <span>{stock} kom</span>;
                    })()}
                  </td>
                  <td>
                    <span
                      className={`adm-badge ${
                        p.status === "published"
                          ? "adm-badge-pub"
                          : "adm-badge-draft"
                      }`}
                    >
                      {p.status === "published" ? "Objavljeno" : "Nacrt"}
                    </span>
                  </td>
                  <td>
                    {p.status === "published" ? (
                      <a
                        href={`/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "underline" }}
                      >
                        /{p.slug}
                      </a>
                    ) : (
                      <span className="adm-hint">/{p.slug}</span>
                    )}
                  </td>
                  <td className="adm-hint">{datum(p.updatedAt)}</td>
                  <td>
                    <div className="adm-cell-actions">
                      <Link
                        className="adm-btn adm-btn-sm"
                        href={`/admin/products/${p.id}`}
                      >
                        UREDI
                      </Link>
                      <a
                        className="adm-btn adm-btn-sm"
                        href={`/admin/preview/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PREVIEW
                      </a>
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm"
                        disabled={busyId === p.id}
                        onClick={() => action(p, "duplicate")}
                      >
                        DUPLICIRAJ
                      </button>
                      {p.status === "published" ? (
                        <button
                          type="button"
                          className="adm-btn adm-btn-sm"
                          disabled={busyId === p.id}
                          onClick={() => setConfirm({ kind: "unpublish", product: p })}
                        >
                          SKINI SA OBJAVE
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="adm-btn adm-btn-sm adm-btn-green"
                          disabled={busyId === p.id}
                          onClick={() => action(p, "publish")}
                        >
                          OBJAVI
                        </button>
                      )}
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm adm-btn-danger"
                        disabled={busyId === p.id}
                        onClick={() => setConfirm({ kind: "delete", product: p })}
                      >
                        OBRIŠI
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirm?.kind === "delete" ? (
        <ConfirmModal
          title={`Obrisati „${confirm.product.naziv}"?`}
          text={
            <>
              Stranica <b>/{confirm.product.slug}</b> više neće biti dostupna.
              Proizvod se arhivira (soft delete) — podaci ostaju u bazi, ali se
              nigdje ne prikazuju.
            </>
          }
          confirmLabel="OBRIŠI"
          danger
          busy={busyId === confirm.product.id}
          onConfirm={() => doDelete(confirm.product)}
          onCancel={() => setConfirm(null)}
        />
      ) : null}

      {bulkConfirm === "delete" ? (
        <ConfirmModal
          title={`Obrisati ${selected.size} proizvoda?`}
          text="Svi izabrani proizvodi se arhiviraju (soft delete) — podaci ostaju u bazi, ali se nigdje ne prikazuju. Objavljene stranice više neće biti dostupne."
          confirmLabel="OBRIŠI SVE"
          danger
          busy={bulkBusy}
          onConfirm={() => bulkAction("delete")}
          onCancel={() => setBulkConfirm(null)}
        />
      ) : null}

      {confirm?.kind === "unpublish" ? (
        <ConfirmModal
          title={`Skinuti „${confirm.product.naziv}" sa objave?`}
          text={
            <>
              <b>/{confirm.product.slug}</b> će vraćati 404 dok ga ponovo ne
              objavite. Nacrt i sadržaj ostaju netaknuti.
            </>
          }
          confirmLabel="SKINI SA OBJAVE"
          busy={busyId === confirm.product.id}
          onConfirm={() => {
            const p = confirm.product;
            setConfirm(null);
            action(p, "unpublish");
          }}
          onCancel={() => setConfirm(null)}
        />
      ) : null}
    </>
  );
}
