"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { uploadOne, type UploadRow } from "./uploader";
import type { Media } from "@/lib/cms/types";

function isVideo(m: Media) {
  return m.mime.startsWith("video/");
}

function kb(size: number) {
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

/**
 * Media biblioteka. Isti komponent služi i kao stranica /admin/media
 * i kao "picker" u editoru (onSelect je tada zadan).
 */
export default function MediaBrowser({
  initial = [],
  onSelect,
  accept = "all",
}: {
  initial?: Media[];
  onSelect?: (m: Media) => void;
  accept?: "all" | "image" | "video";
}) {
  const [media, setMedia] = useState<Media[]>(initial);
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [over, setOver] = useState(false);
  const [q, setQ] = useState("");
  const [toDelete, setToDelete] = useState<Media | null>(null);
  const [copied, setCopied] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fetched = useRef(false);

  // Kad se komponent koristi kao picker (bez `initial`), biblioteka se
  // dovuče jednom sa servera. setState je unutar async callback-a, ne u
  // tijelu efekta, da se ne izazove kaskada rendera.
  useEffect(() => {
    if (fetched.current || initial.length > 0) return;
    fetched.current = true;
    let alive = true;
    (async () => {
      const res = await fetch("/api/admin/media");
      const data = await res.json().catch(() => ({}));
      if (alive && data?.media) setMedia(data.media);
    })();
    return () => {
      alive = false;
    };
  }, [initial.length]);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      const start: UploadRow[] = files.map((f, i) => ({
        key: `${Date.now()}-${i}-${f.name}`,
        name: f.name,
        pct: 0,
        status: "uploading",
      }));
      setRows((r) => [...start, ...r]);

      // Sekvencijalno: jedan fajl po zahtjevu, greška jednog ne prekida ostale
      for (let i = 0; i < files.length; i++) {
        const key = start[i].key;
        const res = await uploadOne(files[i], (pct) =>
          setRows((r) => r.map((x) => (x.key === key ? { ...x, pct } : x)))
        );
        setRows((r) =>
          r.map((x) =>
            x.key === key
              ? res.media
                ? { ...x, pct: 100, status: "ok" }
                : { ...x, pct: 100, status: "err", error: res.error }
              : x
          )
        );
        if (res.media) setMedia((m) => [res.media as Media, ...m]);
      }
    },
    []
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }

  async function saveAlt(m: Media, alt: string) {
    setMedia((list) => list.map((x) => (x.id === m.id ? { ...x, alt } : x)));
    await fetch(`/api/admin/media/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt }),
    });
  }

  async function doDelete(m: Media) {
    await fetch(`/api/admin/media/${m.id}`, { method: "DELETE" });
    setMedia((list) => list.filter((x) => x.id !== m.id));
    setToDelete(null);
  }

  async function copyUrl(m: Media) {
    // Supabase Storage vraća apsolutni URL; stari /img/... su relativni
    const full = m.url.startsWith("http")
      ? m.url
      : `${window.location.origin}${m.url}`;
    try {
      await navigator.clipboard.writeText(full);
      setCopied(m.id);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      window.prompt("Kopirajte URL:", full);
    }
  }

  const visible = media.filter((m) => {
    if (accept === "image" && !m.mime.startsWith("image/")) return false;
    if (accept === "video" && !m.mime.startsWith("video/")) return false;
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      m.filename.toLowerCase().includes(s) || m.alt.toLowerCase().includes(s)
    );
  });

  return (
    <>
      <div
        className="adm-drop"
        data-over={over}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <b>Prevucite fajlove ovdje</b>
        JPG, PNG, WEBP, AVIF, GIF, MP4, WEBM, MOV — do 4 MB po fajlu.
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="adm-btn"
            onClick={() => inputRef.current?.click()}
          >
            ILI ODABERITE SA RAČUNARA
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          hidden
          onChange={(e) => {
            handleFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {rows.length > 0 ? (
        <div className="adm-card" style={{ marginTop: 12 }}>
          <div
            className="adm-card-title"
            style={{
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Uploadi</span>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              onClick={() => setRows([])}
            >
              OČISTI LISTU
            </button>
          </div>
          {rows.map((r) => (
            <div className="adm-upload-row" key={r.key}>
              <b>{r.name}</b>
              {r.status === "uploading" ? (
                <span className="adm-progress">
                  <i style={{ width: `${r.pct}%` }} />
                </span>
              ) : null}
              {r.status === "ok" ? (
                <span className="adm-upload-ok">✓ uspješno</span>
              ) : null}
              {r.status === "err" ? (
                <span className="adm-upload-err">✕ {r.error}</span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="adm-search" style={{ marginTop: 14 }}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Traži po imenu fajla ili alt tekstu…"
          aria-label="Traži u mediji"
        />
      </div>

      {visible.length === 0 ? (
        <div className="adm-empty">
          {media.length === 0
            ? "Biblioteka je prazna — prevucite prve fajlove."
            : "Nema fajlova za tu pretragu."}
        </div>
      ) : (
        <div className="adm-media-grid">
          {visible.map((m) => (
            <div className="adm-media-item" key={m.id}>
              {isVideo(m) ? (
                <video
                  className="adm-media-thumb"
                  src={m.url}
                  muted
                  playsInline
                  preload="metadata"
                  onClick={() => onSelect?.(m)}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  className="adm-media-thumb"
                  src={m.url}
                  alt={m.alt}
                  loading="lazy"
                  onClick={() => onSelect?.(m)}
                />
              )}
              <div className="adm-media-meta">
                <span className="adm-media-name" title={m.filename}>
                  {m.filename}
                </span>
                <span>
                  {kb(m.size)} · {m.mime.split("/")[1]}
                </span>
                <input
                  type="text"
                  defaultValue={m.alt}
                  placeholder="alt tekst"
                  onBlur={(e) => {
                    if (e.target.value !== m.alt) saveAlt(m, e.target.value);
                  }}
                  aria-label={`Alt tekst za ${m.filename}`}
                />
                <div className="adm-media-tools">
                  {onSelect ? (
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm adm-btn-primary"
                      onClick={() => onSelect(m)}
                    >
                      ODABERI
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="adm-btn adm-btn-sm"
                    onClick={() => copyUrl(m)}
                  >
                    {copied === m.id ? "KOPIRANO ✓" : "COPY URL"}
                  </button>
                  <button
                    type="button"
                    className="adm-btn adm-btn-sm adm-btn-danger"
                    onClick={() => setToDelete(m)}
                  >
                    OBRIŠI
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete ? (
        <ConfirmModal
          title="Obrisati fajl iz biblioteke?"
          text={
            <>
              <b>{toDelete.filename}</b> se skriva iz biblioteke. Fajl ostaje na
              disku, pa se stranice koje ga već koriste ne kvare.
            </>
          }
          confirmLabel="OBRIŠI"
          danger
          onConfirm={() => doDelete(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      ) : null}
    </>
  );
}
