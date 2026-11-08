"use client";

import { useState } from "react";
import { sarajevoDateOnly } from "@/lib/cms/datum";
import { DateField, NumberField, SelectField, TextField } from "./fields";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABEL, type NabavkaPartija } from "@/lib/nabavke/types";

export default function NabavkePartijaForm({
  products,
  onCreated,
}: {
  products: { id: string; naziv: string }[];
  onCreated: (item: NabavkaPartija) => void;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [dobavljac, setDobavljac] = useState("");
  const [datumNabavke, setDatumNabavke] = useState(sarajevoDateOnly());
  const [kolicina, setKolicina] = useState<number | null>(null);
  const [cijena, setCijena] = useState<number | null>(null);
  const [dodatniTroskovi, setDodatniTroskovi] = useState<number | null>(null);
  const [tipDokumenta, setTipDokumenta] = useState<string>("nedostaje");
  const [brojDokumenta, setBrojDokumenta] = useState("");
  const [datumDokumenta, setDatumDokumenta] = useState("");
  const [napomena, setNapomena] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return setMsg("Izaberi proizvod.");
    if (!kolicina || kolicina <= 0) return setMsg("Upiši količinu.");
    if (cijena === null || cijena < 0) return setMsg("Upiši cijenu po komadu.");

    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/nabavke-partije", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        dobavljac,
        datumNabavke,
        nabavljenoKolicina: kolicina,
        cijenaPoKomadu: cijena,
        dodatniTroskovi: dodatniTroskovi ?? 0,
        tipDokumenta,
        brojDokumenta,
        datumDokumenta,
        napomena,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.item) {
      onCreated(data.item);
      setKolicina(null);
      setCijena(null);
      setDodatniTroskovi(null);
      setBrojDokumenta("");
      setDatumDokumenta("");
      setNapomena("");
      setMsg("Dodano — partija čeka dokumentaciju.");
    } else {
      setMsg(data?.error || "Greška.");
    }
  }

  return (
    <div className="adm-card">
      <div className="adm-card-title">Dodaj novu nabavku</div>
      <form onSubmit={submit}>
        <div className="adm-row-3 adm-row">
          <SelectField
            label="Proizvod"
            value={productId}
            onChange={setProductId}
            options={products.map((p) => ({ value: p.id, label: p.naziv }))}
          />
          <TextField label="Dobavljač" value={dobavljac} onChange={setDobavljac} />
          <DateField label="Datum nabavke" value={datumNabavke} onChange={setDatumNabavke} />
        </div>
        <div className="adm-row-3 adm-row">
          <NumberField label="Količina" value={kolicina} onChange={setKolicina} placeholder="npr. 50" />
          <NumberField
            label="Cijena po komadu (KM)"
            value={cijena}
            onChange={setCijena}
            placeholder="npr. 8"
          />
          <NumberField
            label="Dodatni troškovi (KM, ukupno)"
            value={dodatniTroskovi}
            onChange={setDodatniTroskovi}
            placeholder="carina/prevoz i sl."
            hint="Razvodni se po komadu automatski."
          />
        </div>
        <div className="adm-row-3 adm-row">
          <SelectField
            label="Vrsta dokumenta"
            value={tipDokumenta}
            onChange={setTipDokumenta}
            options={DOCUMENT_TYPES.map((t) => ({ value: t, label: DOCUMENT_TYPE_LABEL[t] }))}
          />
          <TextField label="Broj dokumenta" value={brojDokumenta} onChange={setBrojDokumenta} />
          <DateField label="Datum dokumenta" value={datumDokumenta} onChange={setDatumDokumenta} />
        </div>
        <TextField label="Napomena (opciono)" value={napomena} onChange={setNapomena} />
        {msg ? <p className="adm-hint" style={{ marginTop: 6 }}>{msg}</p> : null}
        <button type="submit" className="adm-btn adm-btn-primary" disabled={busy} style={{ marginTop: 10 }}>
          DODAJ NABAVKU
        </button>
      </form>
    </div>
  );
}
