"use client";

import { useState } from "react";
import { sarajevoDateOnly } from "@/lib/cms/datum";
import { SelectField, TextField, NumberField, DateField } from "./fields";
import type { ManualSale } from "@/lib/orders/repo";

/**
 * Brz ručni brojač prodaje (Messenger i sl.) — SAMO proizvod i količina,
 * bez imena/telefona/adrese. Nikad ne postaje prava narudžba: ne ulazi u
 * listu narudžbi, packing listu ni A2B izvoz — samo dopunjuje "prodano" u
 * Zaradi/Dashboardu. Kad se sazna pravi kupac, unosi se posebno kao prava
 * narudžba ("Narudžba van sajta").
 */
export default function QuickSaleManager({
  initial,
  products,
}: {
  initial: ManualSale[];
  products: string[];
}) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(sarajevoDateOnly());
  const [product, setProduct] = useState(products[0] ?? "");
  const [quantity, setQuantity] = useState<number | null>(1);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !quantity || quantity <= 0) {
      setMsg("Izaberi proizvod i upiši broj komada.");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/manual-sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, productName: product, quantity, note }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.item) {
      setItems((s) => [data.item, ...s]);
      setQuantity(1);
      setNote("");
      setMsg("Dodano.");
    } else {
      setMsg(data?.error || "Greška.");
    }
  }

  async function remove(id: string) {
    setItems((s) => s.filter((i) => i.id !== id));
    await fetch(`/api/admin/manual-sales/${id}`, { method: "DELETE" });
  }

  return (
    <div className="adm-card">
      <div
        className="adm-card-title"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <span>
          🔢 Brz brojač prodaje (Messenger i sl., bez narudžbe)
          {items.length ? <span className="adm-hint"> — {items.length} unosa</span> : null}
        </span>
        <button type="button" className="adm-btn adm-btn-sm">
          {open ? "SAKRIJ" : "OTVORI"}
        </button>
      </div>

      {open ? (
        <>
          <p className="adm-hint" style={{ marginBottom: 10 }}>
            Samo proizvod i broj komada — bez imena, telefona i adrese. Ne
            postaje prava narudžba, ne ide kuriru ni u A2B izvoz. Kad znaš
            pravog kupca, unesi ga posebno kao{" "}
            <b>Narudžba van sajta</b>.
          </p>

          <form onSubmit={submit}>
            <div className="adm-row-3 adm-row">
              <DateField label="Datum" value={date} onChange={setDate} />
              <SelectField
                label="Proizvod"
                value={product}
                onChange={setProduct}
                options={
                  products.length
                    ? products.map((p) => ({ value: p, label: p }))
                    : [{ value: "", label: "Nema proizvoda" }]
                }
              />
              <NumberField label="Broj komada" value={quantity} onChange={setQuantity} placeholder="npr. 17" />
            </div>
            <TextField
              label="Napomena (opcionalno)"
              value={note}
              onChange={setNote}
              placeholder="npr. Messenger, dogovor za preuzimanje"
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

          {items.length > 0 ? (
            <div className="adm-table-wrap" style={{ border: "none", marginTop: 16 }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Proizvod</th>
                    <th style={{ textAlign: "right" }}>Komada</th>
                    <th>Napomena</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td>{i.date}</td>
                      <td>{i.productName}</td>
                      <td style={{ textAlign: "right" }}>
                        <b>{i.quantity}</b>
                      </td>
                      <td className="adm-hint">{i.note || "—"}</td>
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
          ) : null}
        </>
      ) : null}
    </div>
  );
}
