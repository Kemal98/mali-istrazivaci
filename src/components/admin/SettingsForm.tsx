"use client";

import { useState } from "react";
import { TextArea, TextField, Toggle } from "./fields";
import type { GlobalSettings } from "@/lib/cms/types";

export default function SettingsForm({
  initial,
}: {
  initial: GlobalSettings;
}) {
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function set<K extends keyof GlobalSettings>(k: K, v: GlobalSettings[K]) {
    setS((x) => ({ ...x, [k]: v }));
    setMsg("");
  }

  async function save() {
    setBusy(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    setBusy(false);
    setMsg(res.ok ? "Snimljeno." : "Snimanje nije uspjelo.");
  }

  return (
    <>
      {msg ? <div className="adm-note adm-note-ok">{msg}</div> : null}

      <div className="adm-card">
        <div className="adm-card-title">Tekstovi koje dijele svi proizvodi</div>
        <p className="adm-hint" style={{ marginBottom: 14 }}>
          Ovo su <b>podrazumijevane</b> vrijednosti. Svaki proizvod ih može
          pregaziti svojim tekstom u editoru — globalno se koristi samo tamo gdje
          proizvod nema svoju vrijednost.
        </p>

        <TextField
          label="Traka na vrhu (announcement bar)"
          value={s.announcementBar}
          onChange={(v) => set("announcementBar", v)}
        />
        <div className="adm-row">
          <TextField
            label="Tekst o plaćanju"
            value={s.placanjeTekst}
            onChange={(v) => set("placanjeTekst", v)}
          />
          <TextField
            label="Tekst o dostavi"
            value={s.dostavaTekst}
            onChange={(v) => set("dostavaTekst", v)}
          />
        </div>
        <TextField
          label="Garancija"
          value={s.garancijaTekst}
          onChange={(v) => set("garancijaTekst", v)}
        />
        <div className="adm-row">
          <TextField
            label="Kontakt email"
            value={s.kontaktEmail}
            onChange={(v) => set("kontaktEmail", v)}
            type="email"
          />
          <TextField
            label="Podrazumijevani tekst na CTA dugmetu"
            value={s.defaultCtaTekst}
            onChange={(v) => set("defaultCtaTekst", v)}
          />
        </div>
        <TextField
          label="Tekst u footeru"
          value={s.footerTekst}
          onChange={(v) => set("footerTekst", v)}
        />

        <button
          type="button"
          className="adm-btn adm-btn-primary"
          onClick={save}
          disabled={busy}
          style={{ marginTop: 6 }}
        >
          {busy ? "Snimam…" : "SNIMI POSTAVKE"}
        </button>
      </div>

      <div className="adm-card" style={{ borderColor: "#f6d5d0" }}>
        <div className="adm-card-title" style={{ color: "#b3261e" }}>
          ⚠️ Zatvori cijeli sajt
        </div>
        <p className="adm-hint" style={{ marginBottom: 14 }}>
          Kad je uključeno, NIKO ne može otvoriti nijednu stranicu sajta
          (samo ovaj admin ostaje dostupan) — umjesto toga vide poruku
          ispod. Koristi za hitno zatvaranje, održavanje i sl.
        </p>

        <Toggle
          label="Sajt je zatvoren za posjetioce"
          value={Boolean(s.siteClosed)}
          onChange={(v) => set("siteClosed", v)}
        />

        {s.siteClosed ? (
          <TextArea
            label="Poruka koju vide posjetioci"
            value={s.siteClosedMessage ?? ""}
            onChange={(v) => set("siteClosedMessage", v)}
            rows={3}
          />
        ) : null}

        <button
          type="button"
          className={s.siteClosed ? "adm-btn adm-btn-danger" : "adm-btn adm-btn-primary"}
          onClick={save}
          disabled={busy}
          style={{ marginTop: 6 }}
        >
          {busy
            ? "Snimam…"
            : s.siteClosed
              ? "SNIMI — SAJT ĆE SE ZATVORITI"
              : "SNIMI POSTAVKE"}
        </button>
      </div>
    </>
  );
}
