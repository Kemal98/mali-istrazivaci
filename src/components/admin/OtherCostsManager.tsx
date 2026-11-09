"use client";

import { useState } from "react";
import { datum, sarajevoDateOnly } from "@/lib/cms/datum";
import { NumberField, TextField, DateField } from "./fields";
import type { OtherCost } from "@/lib/ads/types";

/**
 * Opšti troškovi (van reklama) — ambalaža, naknada za kurirski nalog i
 * sl. Nisu vezani za proizvod, oduzimaju se od UKUPNE zarade (Dashboard,
 * Presjeci zarade), ne ulaze u razradu po proizvodu (vidi profit.ts).
 */
export default function OtherCostsManager({ initial }: { initial: OtherCost[] }) {
  const [items, setItems] = useState(initial);
  const [date, setDate] = useState(sarajevoDateOnly());
  const [amount, setAmount] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (amount === null || amount < 0) {
      setMsg("Upiši iznos.");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/othercosts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, amount, note }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.item) {
      setItems((s) => [data.item, ...s]);
      setAmount(null);
      setNote("");
      setMsg("Dodano.");
    } else {
      setMsg(data?.error || "Greška.");
    }
  }

  async function remove(id: string) {
    setItems((s) => s.filter((i) => i.id !== id));
    await fetch(`/api/admin/othercosts/${id}`, { method: "DELETE" });
  }

  return (
    <>
      <div className="adm-card">
        <div className="adm-card-title">Dodaj opšti trošak</div>
        <p className="adm-hint">
          Za troškove koji NISU reklame ni nabavka robe (ambalaža,
          naknada za kurirski nalog i sl.) — oduzima se od ukupne
          zarade, ne od pojedinačnog proizvoda.
        </p>
        <form onSubmit={submit}>
          <div className="adm-row-3 adm-row">
            <DateField label="Datum" value={date} onChange={setDate} />
            <NumberField
              label="Iznos (KM)"
              value={amount}
              onChange={setAmount}
              placeholder="npr. 20"
            />
          </div>
          <TextField
            label="Napomena (opciono)"
            value={note}
            onChange={setNote}
            placeholder="npr. naknada za novi Brza pošta nalog"
          />
          {msg ? (
            <p className="adm-hint" style={{ marginTop: 6 }}>
              {msg}
            </p>
          ) : null}
          <button
            type="submit"
            className="adm-btn adm-btn-primary"
            disabled={busy}
            style={{ marginTop: 10 }}
          >
            DODAJ
          </button>
        </form>
      </div>

      <div className="adm-card">
        <div className="adm-card-title">Zadnji unosi</div>
        {items.length === 0 ? (
          <p className="adm-hint">Još nema unesenih troškova.</p>
        ) : (
          <div className="adm-table-wrap" style={{ border: "none" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th style={{ textAlign: "right" }}>Iznos</th>
                  <th>Napomena</th>
                  <th>Dodano</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.date}</td>
                    <td style={{ textAlign: "right" }}>
                      <b>{i.amount} KM</b>
                    </td>
                    <td className="adm-hint">{i.note || "—"}</td>
                    <td className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                      {datum(i.createdAt)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm adm-btn-danger"
                        onClick={() => remove(i.id)}
                      >
                        OBRIŠI
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
