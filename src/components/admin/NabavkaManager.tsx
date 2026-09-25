"use client";

import { useState } from "react";
import { datum, sarajevoDateOnly } from "@/lib/cms/datum";
import { NumberField, SelectField, TextField } from "./fields";
import type { StockPurchase } from "@/lib/ads/types";

export default function NabavkaManager({
  initial,
  products,
}: {
  initial: StockPurchase[];
  products: string[];
}) {
  const [items, setItems] = useState(initial);
  const [date, setDate] = useState(sarajevoDateOnly());
  const [product, setProduct] = useState(products[0] ?? "");
  const [quantity, setQuantity] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !quantity || quantity <= 0 || total === null || total < 0) {
      setMsg("Izaberi proizvod, upiši količinu i koliko si ukupno platio.");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/nabavke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        productName: product,
        quantity,
        totalCost: total,
        note,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.item) {
      setItems((s) => [data.item, ...s]);
      setQuantity(null);
      setTotal(null);
      setNote("");
      setMsg("Dodano. Osvježi stranicu da se ažurira stanje zaliha.");
    } else {
      setMsg(data?.error || "Greška.");
    }
  }

  async function remove(id: string) {
    setItems((s) => s.filter((i) => i.id !== id));
    await fetch(`/api/admin/nabavke/${id}`, { method: "DELETE" });
  }

  return (
    <>
      <div className="adm-card">
        <div className="adm-card-title">Dodaj nabavku</div>
        <form onSubmit={submit}>
          <div className="adm-row-3 adm-row">
            <TextField label="Datum" value={date} onChange={setDate} placeholder="GGGG-MM-DD" />
            <SelectField
              label="Proizvod"
              value={product}
              onChange={setProduct}
              options={products.map((p) => ({ value: p, label: p }))}
            />
            <NumberField
              label="Koliko komada"
              value={quantity}
              onChange={setQuantity}
              placeholder="npr. 100"
            />
          </div>
          <NumberField
            label="Ukupno plaćeno (KM)"
            value={total}
            onChange={setTotal}
            placeholder="npr. 230"
            hint={
              quantity && total !== null
                ? `= ${(total / quantity).toFixed(2)} KM po komadu`
                : "Ukupan iznos za sve komade (sa prevozom/carinom ako želiš da uđe u cijenu)."
            }
          />
          <TextField label="Napomena (opciono)" value={note} onChange={setNote} />
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
        <div className="adm-card-title">Unesene nabavke</div>
        {items.length === 0 ? (
          <p className="adm-hint">Još nema unesenih nabavki.</p>
        ) : (
          <div className="adm-table-wrap" style={{ border: "none" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Proizvod</th>
                  <th style={{ textAlign: "right" }}>Komada</th>
                  <th style={{ textAlign: "right" }}>Plaćeno</th>
                  <th style={{ textAlign: "right" }}>Po komadu</th>
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
                    <td style={{ textAlign: "right" }}>{i.quantity}</td>
                    <td style={{ textAlign: "right" }}>
                      <b>{i.totalCost} KM</b>
                    </td>
                    <td style={{ textAlign: "right" }} className="adm-hint">
                      {(i.totalCost / i.quantity).toFixed(2)} KM
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
