"use client";

import { useBundle } from "@/components/BundleContext";
import type { ProductBundle } from "@/lib/cms/types";

// Prikazuje se UMJESTO obične cijene kad su paketi uključeni (vidi
// CmsHero.tsx) — svaka opcija nosi SVOJU cijenu, kupac bira tačno jednu.
// Izabrani paket ide u BundleContext, čita ga CmsCheckout (modal).
export default function PaketiPicker({ paketi }: { paketi: ProductBundle[] }) {
  const { bundle, setBundle } = useBundle();

  return (
    <div className="dawn-paketi" role="radiogroup" aria-label="Izaberi paket">
      {paketi.map((p) => {
        const active = bundle?.id === p.id;
        return (
          <label className="dawn-paket" key={p.id} data-active={active}>
            <input
              type="radio"
              name="dawn-paket"
              checked={active}
              onChange={() => setBundle(p)}
            />
            <span className="dawn-paket-radio" aria-hidden="true" />
            <span className="dawn-paket-info">
              <span className="dawn-paket-naziv">{p.naziv}</span>
              {p.oznaka ? <span className="dawn-paket-oznaka">{p.oznaka}</span> : null}
            </span>
            <span className="dawn-paket-cijena">
              {p.staraCijena !== null ? (
                <span className="dawn-paket-cijena-old">{p.staraCijena} KM</span>
              ) : null}
              <span className="dawn-paket-cijena-new">{p.cijena} KM</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
