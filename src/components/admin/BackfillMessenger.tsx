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
    const res = await fetch("/api/admin/messenger/backfill", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data?.error || "Nije uspjelo.");
      return;
    }
    setMsg(`Pronađeno ${data.found}, upisano/ažurirano ${data.processed}.`);
    router.refresh();
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
