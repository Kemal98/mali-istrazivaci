"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SelectField, TextField, NumberField } from "./fields";

const CHANNELS = [
  { value: "messenger", label: "Messenger" },
  { value: "viber", label: "Viber" },
  { value: "telefon", label: "Telefon" },
  { value: "ostalo", label: "Ostalo" },
];

const DELIVERY = 10;

/**
 * Narudžba primljena van sajta (Messenger, Viber, telefon) — admin je
 * ručno upiše ovdje. Ide u istu bazu i isti Google Sheet kao narudžbe sa
 * sajta, pa se pojavljuje svuda (dashboard, zarada, lista za pakovanje,
 * kurirska tabela) bez ikakvog posebnog tretmana.
 */
export default function AddOrderButton({
  products,
}: {
  products: { id: string; naziv: string; cijena: number | null }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState<number | null>(1);
  const [unitPrice, setUnitPrice] = useState<number | null>(products[0]?.cijena ?? 0);
  const [shippingPrice, setShippingPrice] = useState<number | null>(DELIVERY);
  const [channel, setChannel] = useState("messenger");
  const [note, setNote] = useState("");

  function pickProduct(id: string) {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (p) setUnitPrice(p.cijena ?? 0);
  }

  function reset() {
    setCustomerName("");
    setPhone("");
    setAddress("");
    setCity("");
    setQuantity(1);
    setNote("");
  }

  async function create() {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      setError("Izaberite proizvod.");
      return;
    }
    if (customerName.trim().length < 2) {
      setError("Upišite ime i prezime.");
      return;
    }
    if (!phone.trim()) {
      setError("Upišite broj telefona.");
      return;
    }
    if (!address.trim() || !city.trim()) {
      setError("Upišite adresu i grad.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        productId: product.id,
        productName: product.naziv,
        quantity: quantity ?? 1,
        unitPrice: unitPrice ?? 0,
        shippingPrice: shippingPrice ?? 0,
        channel,
        note: note.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data?.error || "Greška pri dodavanju.");
      return;
    }
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <>
      <button type="button" className="adm-btn" onClick={() => setOpen(true)}>
        + NARUDŽBA VAN SAJTA
      </button>

      {open && (
        <div
          className="adm-modal-bg"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="adm-modal" role="dialog" aria-modal="true">
            <h2>Narudžba van sajta</h2>
            <p className="adm-hint" style={{ marginBottom: 16 }}>
              Za narudžbe primljene preko Messengera, Vibera ili telefona.
              Upisuje se u istu bazu kao narudžbe sa sajta — ide u Google
              Sheet za kurira i u sve statistike.
            </p>

            {error ? <div className="adm-note adm-note-err">{error}</div> : null}

            <SelectField
              label="Kanal"
              value={channel}
              onChange={setChannel}
              options={CHANNELS}
            />

            <SelectField
              label="Proizvod"
              value={productId}
              onChange={pickProduct}
              options={
                products.length
                  ? products.map((p) => ({ value: p.id, label: p.naziv }))
                  : [{ value: "", label: "Nema proizvoda" }]
              }
            />

            <div className="adm-row-3 adm-row">
              <NumberField label="Količina" value={quantity} onChange={setQuantity} />
              <NumberField
                label="Cijena po komadu (KM)"
                value={unitPrice}
                onChange={setUnitPrice}
              />
              <NumberField
                label="Dostava (KM)"
                value={shippingPrice}
                onChange={setShippingPrice}
              />
            </div>

            <div className="adm-field">
              <label htmlFor="ao-naziv">Ime i prezime</label>
              <input
                id="ao-naziv"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Amina Hodžić"
                autoFocus
              />
            </div>

            <TextField label="Telefon" value={phone} onChange={setPhone} placeholder="061 123 456" />
            <TextField label="Adresa" value={address} onChange={setAddress} placeholder="Titova 15" />
            <TextField label="Grad" value={city} onChange={setCity} placeholder="Sarajevo" />
            <TextField
              label="Napomena (opcionalno)"
              value={note}
              onChange={setNote}
            />

            <div className="adm-modal-foot">
              <button type="button" className="adm-btn" onClick={() => setOpen(false)}>
                OTKAŽI
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={create}
                disabled={busy}
              >
                {busy ? "Dodajem…" : "DODAJ NARUDŽBU"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
