"use client";

import { useState } from "react";
import { TextField } from "./fields";
import type { GlobalSettings } from "@/lib/cms/types";

export default function SettingsForm({
  initial,
}: {
  initial: GlobalSettings;
}) {
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function set(k: keyof GlobalSettings, v: string) {
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
    </>
  );
}
