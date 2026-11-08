"use client";

import { useMemo, useState } from "react";
import { NumberField, SelectField, TextField } from "./fields";
import { KOREKCIJA_LABEL, KOREKCIJA_VRSTE, type KorekcijaVrsta, type NabavkaPartija } from "@/lib/nabavke/types";

export default function NabavkeKorekcijaForm({
  products,
  batches,
  onApplied,
}: {
  products: { id: string; naziv: string }[];
  batches: NabavkaPartija[];
  onApplied: () => void;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [vrsta, setVrsta] = useState<KorekcijaVrsta>("manjak");
  const [batchId, setBatchId] = useState("");
  const [kolicina, setKolicina] = useState<number | null>(null);
  const [cijenaProcjena, setCijenaProcjena] = useState<number | null>(null);
  const [razlog, setRazlog] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const productBatches = useMemo(
    () => batches.filter((b) => b.productId === productId),
    [batches, productId]
  );

  const needsBatch = vrsta !== "visak";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return setMsg("Izaberi proizvod.");
    if (needsBatch && !batchId) return setMsg("Izaberi partiju.");
    if (!kolicina || kolicina <= 0) return setMsg("Upiši količinu.");
    if (!razlog.trim()) return setMsg("Razlog je obavezan.");

    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/nabavke-partije/korekcije", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        vrsta,
        batchId: needsBatch ? batchId : undefined,
        kolicina,
        razlog,
        cijenaPoKomaduProcjena: vrsta === "visak" ? cijenaProcjena ?? 0 : undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.korekcija) {
      setKolicina(null);
      setRazlog("");
      setCijenaProcjena(null);
      setMsg(
        vrsta === "visak"
          ? "Dodano — nova partija je upisana sa statusom 'čeka dokumentaciju'."
          : "Korekcija upisana."
      );
      onApplied();
    } else {
      setMsg(data?.error || "Greška.");
    }
  }

  return (
    <div className="adm-card">
      <div className="adm-card-title">Ručna korekcija (popis, manjak, oštećeno…)</div>
      <form onSubmit={submit}>
        <div className="adm-row-3 adm-row">
          <SelectField
            label="Proizvod"
            value={productId}
            onChange={(v) => {
              setProductId(v);
              setBatchId("");
            }}
            options={products.map((p) => ({ value: p.id, label: p.naziv }))}
          />
          <SelectField
            label="Vrsta korekcije"
            value={vrsta}
            onChange={(v) => setVrsta(v as KorekcijaVrsta)}
            options={KOREKCIJA_VRSTE.map((v) => ({ value: v, label: KOREKCIJA_LABEL[v] }))}
          />
          <NumberField label="Količina" value={kolicina} onChange={setKolicina} />
        </div>

        {needsBatch ? (
          <SelectField
            label="Partija"
            value={batchId}
            onChange={setBatchId}
            options={[
              { value: "", label: "— izaberi partiju —" },
              ...productBatches.map((b) => ({
                value: b.id,
                label: `${b.datumNabavke} — preostalo ${b.preostalo}/${b.nabavljenoKolicina}`,
              })),
            ]}
          />
        ) : (
          <NumberField
            label="Procijenjena cijena po komadu (KM, opciono)"
            value={cijenaProcjena}
            onChange={setCijenaProcjena}
            hint="Nova partija ide sa statusom 'čeka dokumentaciju' — ovo je samo privremena procjena."
          />
        )}

        <TextField label="Razlog (obavezno)" value={razlog} onChange={setRazlog} />
        {msg ? <p className="adm-hint" style={{ marginTop: 6 }}>{msg}</p> : null}
        <button type="submit" className="adm-btn adm-btn-primary" disabled={busy} style={{ marginTop: 10 }}>
          UPIŠI KOREKCIJU
        </button>
      </form>
    </div>
  );
}
