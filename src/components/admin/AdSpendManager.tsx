"use client";

import { useState } from "react";
import { datum, sarajevoDateOnly } from "@/lib/cms/datum";
import { NumberField, SelectField, TextField } from "./fields";
import type { AdSpend } from "@/lib/ads/types";

export default function AdSpendManager({
  initial,
  products,
}: {
  initial: AdSpend[];
  products: string[];
}) {
  const [items, setItems] = useState(initial);
  const [date, setDate] = useState(sarajevoDateOnly());
  const [product, setProduct] = useState(products[0] ?? "");
  const [amount, setAmount] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || amount === null || amount < 0) {
      setMsg("Izaberi proizvod i upiši iznos.");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/adspend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, productName: product, amount, note }),
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
    await fetch(`/api/admin/adspend/${id}`, { method: "DELETE" });
  }

  const productOptions = products.length
    ? products.map((p) => ({ value: p, label: p }))
    : [{ value: "", label: "Nema još narudžbi ni jednog proizvoda" }];

  return (
    <>
      <div className="adm-card">
        <div className="adm-card-title">Dodaj trošak reklame</div>
        <form onSubmit={submit}>
          <div className="adm-row-3 adm-row">
            <TextField
              label="Datum"
              type="text"
              value={date}
              onChange={setDate}
              placeholder="GGGG-MM-DD"
            />
            <SelectField
              label="Proizvod"
              value={product}
              onChange={setProduct}
              options={productOptions}
            />
            <NumberField
              label="Iznos (KM)"
              value={amount}
              onChange={setAmount}
              placeholder="npr. 15"
            />
          </div>
          <TextField
            label="Napomena (opciono)"
            value={note}
            onChange={setNote}
            placeholder="npr. FB kampanja — dan 3"
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
                  <th>Proizvod</th>
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
                    <td>{i.productName}</td>
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
