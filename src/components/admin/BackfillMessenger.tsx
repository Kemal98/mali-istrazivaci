"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BackfillMessenger() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/messenger/backfill", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error || "Nije uspjelo.");
        return;
      }
      setMsg(`Pronađeno ${data.found}, upisano/ažurirano ${data.processed}.`);
      router.refresh();
    } catch {
      // Nema veze sa internetom i sl. — ovo je jedino mjesto koje je
      // ranije tiho puklo bez poruke (vidi "ništa ne piše" problem).
      setMsg("Nema veze sa internetom. Pokušajte ponovo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <button type="button" className="adm-btn" disabled={busy} onClick={run}>
        {busy ? "Povlačim…" : "⟳ POVUCI STARIJE PORUKE"}
      </button>
      {msg ? <span className="adm-hint">{msg}</span> : null}
    </div>
  );
}
