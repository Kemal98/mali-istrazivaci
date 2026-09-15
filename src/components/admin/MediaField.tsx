"use client";

import { useState } from "react";
import MediaBrowser from "./MediaBrowser";

/**
 * Polje za sliku/video: prikaz trenutnog fajla, "IZ BIBLIOTEKE" otvara
 * media picker (sa uploadom unutra), plus ručni unos URL-a za fajlove
 * koji su već u /public (stare slike proizvoda npr.).
 */
export default function MediaField({
  label,
  value,
  onChange,
  accept = "all",
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string, alt?: string) => void;
  accept?: "all" | "image" | "video";
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const isVideo = /\.(mp4|webm|mov)$/i.test(value);

  return (
    <div className="adm-field">
      <label>{label}</label>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {value ? (
          isVideo ? (
            <video
              src={value}
              muted
              playsInline
              preload="metadata"
              style={{
                width: 74,
                height: 74,
                objectFit: "cover",
                borderRadius: 8,
                background: "#eef0f3",
                flex: "0 0 auto",
              }}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={value}
              alt=""
              style={{
                width: 74,
                height: 74,
                objectFit: "cover",
                borderRadius: 8,
                background: "#eef0f3",
                flex: "0 0 auto",
              }}
            />
          )
        ) : (
          <div className="adm-thumb-empty" style={{ width: 74, height: 74 }}>
            nema
          </div>
        )}

        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/… ili /img/…"
          />
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              onClick={() => setOpen(true)}
            >
              IZ BIBLIOTEKE
            </button>
            {value ? (
              <button
                type="button"
                className="adm-btn adm-btn-sm adm-btn-danger"
                onClick={() => onChange("")}
              >
                UKLONI
              </button>
            ) : null}
          </div>
          {hint ? <span className="adm-hint">{hint}</span> : null}
        </div>
      </div>

      {open ? (
        <div
          className="adm-modal-bg"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="adm-modal adm-modal-lg" role="dialog" aria-modal="true">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h2>Odaberite fajl</h2>
              <button
                type="button"
                className="adm-btn adm-btn-sm"
                onClick={() => setOpen(false)}
              >
                ZATVORI
              </button>
            </div>
            <MediaBrowser
              accept={accept}
              onSelect={(m) => {
                onChange(m.url, m.alt);
                setOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
