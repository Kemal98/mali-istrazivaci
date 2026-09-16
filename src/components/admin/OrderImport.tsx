"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders/types";

interface Report {
  found: number;
  wouldImport: number;
  imported: number;
  duplicates: number;
  errors: number;
  shiftedRows: number;
  noDate: number;
  missingHeaders: string[];
  problems: { row: number; reason: string }[];
  preview: {
    row: number;
    datum: string;
    ime: string;
    telefon: string;
    grad: string;
    proizvod: string;
    ukupno: number | null;
    status: OrderStatus;
    stanje: string;
  }[];
}

export default function OrderImport() {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [committed, setCommitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const [fallbackDate, setFallbackDate] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function send(commit: boolean) {
    if (!file) return;
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    if (commit) fd.append("commit", "1");
    if (fallbackDate) fd.append("fallbackDate", fallbackDate);

    const res = await fetch("/api/admin/orders/import", {
      method: "POST",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setError(data?.error || "Import nije uspio.");
      return;
    }
    setReport(data.report);
    setCommitted(commit);
  }

  function pick(f: File | null) {
    setFile(f);
    setReport(null);
    setCommitted(false);
    setError("");
  }

  return (
    <>
      <div className="adm-note adm-note-info">
        <b>Kako ovo radi:</b>
        <ol style={{ paddingLeft: 18, marginTop: 6 }}>
          <li>
            U Google Sheetu: <b>File → Download → Comma-separated values (.csv)</b>
          </li>
          <li>Prevuci taj fajl ovdje i klikni <b>PROVJERI</b> (ništa se ne upisuje)</li>
          <li>
            Ako izvještaj izgleda dobro, klikni <b>UVEZI</b>
          </li>
        </ol>
        Google Sheet se <b>ne mijenja niti briše</b> — ovo samo čita fajl.
        Import se može pokrenuti više puta, duplikati se preskaču.
      </div>

      <div
        className="adm-drop"
        data-over={over}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          pick(e.dataTransfer.files[0] ?? null);
        }}
      >
        <b>{file ? file.name : "Prevuci CSV fajl ovdje"}</b>
        {file
          ? `${(file.size / 1024).toFixed(0)} KB`
          : "izvezen iz Google Sheeta (File → Download → CSV)"}
        <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            type="button"
            className="adm-btn"
            onClick={() => inputRef.current?.click()}
          >
            {file ? "IZABERI DRUGI FAJL" : "ILI ODABERI SA RAČUNARA"}
          </button>
          {file ? (
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              disabled={busy}
              onClick={() => send(false)}
            >
              {busy ? "Provjeravam…" : "PROVJERI (bez upisa)"}
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => {
            pick(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </div>

      {error ? <div className="adm-note adm-note-err">{error}</div> : null}

      {report ? (
        <>
          {report.missingHeaders.length ? (
            <div className="adm-note adm-note-err">
              <b>Ne mogu pročitati fajl.</b> Nedostaju kolone:{" "}
              {report.missingHeaders.join(", ")}. Provjeri da je izvezen prvi
              tab tabele (onaj sa narudžbama) i da prvi red sadrži naslove
              kolona.
            </div>
          ) : null}

          <div className="adm-card" style={{ marginTop: 14 }}>
            <div className="adm-card-title">
              {committed ? "Rezultat uvoza" : "Provjera (ništa nije upisano)"}
            </div>
            <div className="adm-kpi-grid">
              <div className="adm-kpi">
                <span>Redova u fajlu</span>
                <b>{report.found}</b>
              </div>
              <div className="adm-kpi adm-kpi-accent">
                <span>{committed ? "Uvezeno" : "Uvezlo bi se"}</span>
                <b>{committed ? report.imported : report.wouldImport}</b>
              </div>
              <div className="adm-kpi adm-kpi-warn">
                <span>Duplikati (preskočeni)</span>
                <b>{report.duplicates}</b>
              </div>
              <div className={report.errors ? "adm-kpi adm-kpi-bad" : "adm-kpi"}>
                <span>Greške</span>
                <b>{report.errors}</b>
              </div>
            </div>

            {report.shiftedRows > 0 ? (
              <div className="adm-note adm-note-info" style={{ marginTop: 14 }}>
                <b>{report.shiftedRows} redova ima pomjerene kolone</b> — to su
                narudžbe upisane nakon što je kolona „Datum&rdquo; obrisana iz
                tabele. Prepoznati su i pročitani ispravno (datum, ime i
                telefon su vraćeni na svoja mjesta).
              </div>
            ) : null}

            {report.noDate > 0 ? (
              <div className="adm-note adm-note-err" style={{ marginTop: 14 }}>
                <b>{report.noDate} redova nema datum — preskočeni su.</b>
                <p style={{ marginTop: 6 }}>
                  To su stare narudžbe iz vremena kad je kolona{" "}
                  <b>Datum</b> obrisana iz tabele, pa im je vrijeme
                  izgubljeno. Namjerno im <b>ne</b> upisujem današnji datum —
                  izgledalo bi kao da je {report.noDate} narudžbi stiglo danas
                  i pokvarilo bi svu statistiku po periodima.
                </p>
                <p style={{ marginTop: 8 }}>
                  <b>Najbolje rješenje:</b> u Google Sheetu otvori{" "}
                  <b>File → Version history</b>, nađi verziju od prije brisanja
                  kolone (tada su datumi još bili tu), izvezi taj CSV i uvezi
                  njega.
                </p>
                <p style={{ marginTop: 8 }}>
                  Ako ti datumi nisu važni, možeš im dodijeliti jedan
                  zajednički datum i uvesti ih tako:
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-end",
                    marginTop: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div className="adm-filter-group">
                    <label htmlFor="fb-date">Datum za te redove</label>
                    <input
                      id="fb-date"
                      type="date"
                      value={fallbackDate}
                      onChange={(e) => setFallbackDate(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="adm-btn"
                    disabled={busy || !fallbackDate}
                    onClick={() => send(false)}
                  >
                    PROVJERI PONOVO SA TIM DATUMOM
                  </button>
                </div>
              </div>
            ) : null}

            {report.problems.length ? (
              <div className="adm-note adm-note-err" style={{ marginTop: 14 }}>
                <b>Redovi koji se ne mogu uvezti:</b>
                <ul>
                  {report.problems.slice(0, 15).map((p) => (
                    <li key={p.row}>
                      red {p.row}: {p.reason}
                    </li>
                  ))}
                  {report.problems.length > 15 ? (
                    <li>…i još {report.problems.length - 15}</li>
                  ) : null}
                </ul>
              </div>
            ) : null}

            {!committed && report.wouldImport > 0 && !report.missingHeaders.length ? (
              <button
                type="button"
                className="adm-btn adm-btn-green"
                style={{ marginTop: 14 }}
                disabled={busy}
                onClick={() => send(true)}
              >
                {busy
                  ? "Uvozim…"
                  : `UVEZI ${report.wouldImport} NARUDŽBI U BAZU`}
              </button>
            ) : null}

            {committed ? (
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link className="adm-btn adm-btn-primary" href="/admin/orders">
                  VIDI NARUDŽBE →
                </Link>
                <Link className="adm-btn" href="/admin/dashboard">
                  DASHBOARD →
                </Link>
              </div>
            ) : null}
          </div>

          {report.preview.length ? (
            <div className="adm-card">
              <div className="adm-card-title">
                Prvih {report.preview.length} redova — kako su pročitani
              </div>
              <div className="adm-table-wrap" style={{ border: "none" }}>
                <table className="adm-table" style={{ minWidth: 820 }}>
                  <thead>
                    <tr>
                      <th>Red</th>
                      <th>Datum</th>
                      <th>Kupac</th>
                      <th>Telefon</th>
                      <th>Grad</th>
                      <th>Proizvod</th>
                      <th style={{ textAlign: "right" }}>Ukupno</th>
                      <th>Status</th>
                      <th>Stanje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.preview.map((r) => (
                      <tr key={r.row}>
                        <td className="adm-hint">{r.row}</td>
                        <td className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                          {r.datum}
                        </td>
                        <td>{r.ime || "—"}</td>
                        <td>{r.telefon || "—"}</td>
                        <td>{r.grad || "—"}</td>
                        <td>{r.proizvod || "—"}</td>
                        <td style={{ textAlign: "right" }}>
                          {r.ukupno === null ? "—" : `${r.ukupno} KM`}
                        </td>
                        <td>{STATUS_LABEL[r.status] ?? r.status}</td>
                        <td>
                          <span
                            className={
                              r.stanje === "greška"
                                ? "adm-sync-bad"
                                : r.stanje === "duplikat"
                                  ? "adm-hint"
                                  : "adm-sync-ok"
                            }
                          >
                            {r.stanje}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}
