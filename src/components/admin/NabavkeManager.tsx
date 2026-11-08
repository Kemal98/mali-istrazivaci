"use client";

import { useState } from "react";
import NabavkePartijaForm from "./NabavkePartijaForm";
import NabavkePartijeTable from "./NabavkePartijeTable";
import NabavkeKorekcijaForm from "./NabavkeKorekcijaForm";
import type { NabavkaPartija } from "@/lib/nabavke/types";

export default function NabavkeManager({
  initialBatches,
  products,
}: {
  initialBatches: NabavkaPartija[];
  products: { id: string; naziv: string }[];
}) {
  const [items, setItems] = useState(initialBatches);

  async function refresh() {
    const res = await fetch("/api/admin/nabavke-partije");
    const data = await res.json().catch(() => ({}));
    if (data?.items) setItems(data.items);
  }

  return (
    <>
      <NabavkePartijaForm products={products} onCreated={(item) => setItems((s) => [item, ...s])} />

      <div className="adm-card">
        <div className="adm-card-title">Sve partije</div>
        <NabavkePartijeTable items={items} onChange={setItems} />
      </div>

      <NabavkeKorekcijaForm products={products} batches={items} onApplied={refresh} />
    </>
  );
}
