"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateField, TextField } from "./fields";
import type { Cutoff } from "@/lib/orders/cutoffs";

/**
 * Dodavanje/brisanje presjeka — stranica (presjeci/page.tsx) nad njim
 * iscrtava "trenutni period" i "zarada zatvorena svakim presjekom", pa se
 * poslije dodavanja/brisanja samo router.refresh() da se sve prekomputira.
 */
export default function CutoffManager({ today }: { today: string }) {
  const router = useRouter();
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      setMsg("Izaberi datum.");
      return;
    }
    if (
      !window.confirm(
        `Napraviti presjek na ${date.split("-").reverse().join(".")}.? ` +
          `Od tog dana Dashboard zadano kreće računati zaradu/statistiku ispočetka. ` +
          `Narudžbe i kupci se NE brišu, stariji period ostaje dostupan preko filtera.`
      )
    )
      return;
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/presjeci", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, note }),
    });
    const data = (await res.json().catch(() => ({}))) as { item?: Cutoff; error?: string };
    setBusy(false);
    if (data?.item) {
      setNote("");
      setMsg("Presjek napravljen.");
      router.refresh();
    } else {
      setMsg(data?.error || "Greška.");
    }
  }

  return (
    <div className="adm-card">
      <div className="adm-card-title">Napravi novi presjek</div>
      <form onSubmit={submit}>
        <div className="adm-row">
          <DateField label="Datum" value={date} onChange={setDate} />
          <TextField
            label="Napomena (opciono)"
            value={note}
            onChange={setNote}
            placeholder="npr. nova firma / Brza pošta nalog"
          />
        </div>
        {msg ? (
          <p className="adm-hint" style={{ marginTop: 6 }}>
            {msg}
          </p>
        ) : null}
        <button
          type="submit"
          className="adm-btn adm-btn-danger"
          disabled={busy}
          style={{ marginTop: 10 }}
        >
          {busy ? "Pravim presjek…" : "📐 NAPRAVI PRESJEK"}
        </button>
      </form>
    </div>
  );
}
