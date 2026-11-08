"use client";

import { useRef, useState } from "react";
import { datum } from "@/lib/cms/datum";
import NabavkeStatusControl from "./NabavkeStatusControl";
import {
  DOCUMENT_TYPE_LABEL,
  STATUS_CLASS,
  STATUS_LABEL,
  batchUnitCost,
  type NabavkaPartija,
  type NabavkaStatus,
} from "@/lib/nabavke/types";

export default function NabavkePartijeTable({
  items,
  onChange,
}: {
  items: NabavkaPartija[];
  onChange: (items: NabavkaPartija[]) => void;
}) {
  const [error, setError] = useState<Record<string, string>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  function patch(id: string, p: Partial<NabavkaPartija>) {
    onChange(items.map((b) => (b.id === id ? { ...b, ...p } : b)));
  }

  async function remove(id: string) {
    setError((e) => ({ ...e, [id]: "" }));
    const res = await fetch(`/api/admin/nabavke-partije/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      onChange(items.filter((b) => b.id !== id));
    } else {
      setError((e) => ({ ...e, [id]: data?.error || "Greška." }));
    }
  }

  async function uploadDocument(id: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/admin/nabavke-partije/${id}/dokument`, {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (data?.url) {
      patch(id, { dokumentUrl: data.url });
      setError((e) => ({ ...e, [id]: "" }));
    } else {
      setError((e) => ({ ...e, [id]: data?.error || "Greška pri uploadu." }));
    }
  }

  if (items.length === 0) {
    return <p className="adm-hint">Još nema unesenih nabavki.</p>;
  }

  return (
    <div className="adm-table-wrap" style={{ border: "none" }}>
      <table className="adm-table">
        <thead>
          <tr>
            <th>Proizvod</th>
            <th>Dobavljač</th>
            <th>Datum</th>
            <th style={{ textAlign: "right" }}>Kol.</th>
            <th style={{ textAlign: "right" }}>Preostalo</th>
            <th style={{ textAlign: "right" }}>Cijena/kom</th>
            <th>Dokument</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>{b.productName}</td>
              <td className="adm-hint">{b.dobavljac || "—"}</td>
              <td className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                {b.datumNabavke}
              </td>
              <td style={{ textAlign: "right" }}>{b.nabavljenoKolicina}</td>
              <td style={{ textAlign: "right" }}>
                <b style={{ color: b.preostalo === 0 ? "var(--muted)" : undefined }}>
                  {b.preostalo}
                </b>
              </td>
              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                {batchUnitCost(b).toFixed(2)} KM
              </td>
              <td style={{ whiteSpace: "nowrap" }}>
                <div className="adm-hint" style={{ marginBottom: 4 }}>
                  {DOCUMENT_TYPE_LABEL[b.tipDokumenta]}
                  {b.brojDokumenta ? ` · ${b.brojDokumenta}` : ""}
                </div>
                {b.dokumentUrl ? (
                  <a href={b.dokumentUrl} target="_blank" rel="noreferrer" className="adm-btn adm-btn-sm">
                    OTVORI
                  </a>
                ) : (
                  <button
                    type="button"
                    className="adm-btn adm-btn-sm"
                    onClick={() => fileInputs.current[b.id]?.click()}
                  >
                    PRILOŽI
                  </button>
                )}
                <input
                  ref={(el) => {
                    fileInputs.current[b.id] = el;
                  }}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadDocument(b.id, file);
                    e.target.value = "";
                  }}
                />
              </td>
              <td>
                <span className={`adm-st ${STATUS_CLASS[b.status]}`} style={{ marginBottom: 4, display: "block" }}>
                  {STATUS_LABEL[b.status]}
                </span>
                <NabavkeStatusControl
                  batchId={b.id}
                  current={b.status}
                  onChanged={(ns: NabavkaStatus) => patch(b.id, { status: ns })}
                />
              </td>
              <td style={{ textAlign: "right" }}>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm adm-btn-danger"
                  onClick={() => remove(b.id)}
                >
                  OBRIŠI
                </button>
                {error[b.id] ? (
                  <div className="adm-hint" style={{ color: "var(--red)", marginTop: 4 }}>
                    {error[b.id]}
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
