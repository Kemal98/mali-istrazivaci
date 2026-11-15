"use client";

import { NumberField, SelectField, TextField, Toggle } from "./fields";
import type { ProductUpsell } from "@/lib/cms/types";

/**
 * Cross-sell/upsell checkbox u checkoutu — "Dodaj i X za +Y KM". Cilj je
 * DRUGI proizvod iz padajuće liste (samo CMS proizvodi — legacy stranice
 * kao SAT MIRA imaju svoj zaseban checkout, nisu podržane ni kao izvor ni
 * kao cilj ove ponude). Kad kupac čekira, pravi se DRUGA, povezana
 * narudžba za ciljni proizvod (vidi orders/service.ts) — A2B izvoz te
 * dvije spaja u jednu pošiljku/otkupninu (vidi a2bExport.ts).
 */
export default function UpsellEditor({
  upsell,
  products,
  onChange,
}: {
  upsell: ProductUpsell;
  products: { id: string; naziv: string }[];
  onChange: (v: ProductUpsell) => void;
}) {
  return (
    <div className="adm-card">
      <div className="adm-card-title">Cross-sell ponuda u checkoutu</div>
      <Toggle
        label="Uključi cross-sell checkbox za ovaj proizvod"
        value={upsell.aktivan}
        onChange={(v) => onChange({ ...upsell, aktivan: v })}
      />

      <p className="adm-hint" style={{ margin: "10px 0" }}>
        Kupac u checkoutu vidi checkbox "{upsell.tekst || "(upiši tekst ispod)"}
        " — ako ga čekira, uz ovu narudžbu ide i izabrani proizvod po cijeni
        koju upišeš ispod (ne mora pratiti njegovu redovnu cijenu).
      </p>

      {products.length === 0 ? (
        <div className="adm-note adm-note-warn">
          Nema drugih proizvoda u sistemu — dodaj bar još jedan proizvod da
          bi mogao ponuditi cross-sell.
        </div>
      ) : (
        <>
          <SelectField
            label="Proizvod koji se nudi"
            value={upsell.targetId ?? ""}
            onChange={(v) => onChange({ ...upsell, targetId: v || null })}
            options={[
              { value: "", label: "— izaberi proizvod —" },
              ...products.map((p) => ({ value: p.id, label: p.naziv })),
            ]}
          />
          <div className="adm-row-3 adm-row" style={{ marginTop: 10 }}>
            <NumberField
              label="Cijena dodatka (KM)"
              value={upsell.cijena}
              onChange={(v) => onChange({ ...upsell, cijena: Math.max(0, v ?? 0) })}
            />
            <TextField
              label="Tekst uz checkbox"
              value={upsell.tekst}
              onChange={(v) => onChange({ ...upsell, tekst: v })}
              placeholder="npr. Dodaj i Sat mira – samo +15 KM"
            />
          </div>
          {upsell.aktivan && !upsell.targetId ? (
            <div className="adm-note adm-note-warn" style={{ marginTop: 10 }}>
              Cross-sell je uključen, ali nije izabran proizvod — dok ga ne
              izabereš, checkbox se neće prikazati na stranici.
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
