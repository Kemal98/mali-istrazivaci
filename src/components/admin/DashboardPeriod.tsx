"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/** Prekidač perioda za grafikon i analitiku. Stanje ide u URL. */
const PRESETS = [
  { key: "7d", label: "7 dana" },
  { key: "30d", label: "30 dana" },
  { key: "90d", label: "90 dana" },
  { key: "month", label: "Ovaj mjesec" },
  { key: "lastmonth", label: "Prošli mjesec" },
];

export default function DashboardPeriod({ cutoffDate }: { cutoffDate?: string | null }) {
  const router = useRouter();
  const params = useSearchParams();
  // Zadano (bez ?period u URL-u) je "od presjeka" ako presjek postoji,
  // inače "30 dana" — isto pravilo kao resolvePeriod u dashboard/page.tsx.
  const active = params.get("period") ?? (cutoffDate ? "cutoff" : "30d");
  const [custom, setCustom] = useState(
    Boolean(params.get("from") && !params.get("period"))
  );

  function set(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    router.push(`/admin/dashboard?${next.toString()}`);
  }

  return (
    <>
      <div className="adm-chips">
        {cutoffDate ? (
          <button
            type="button"
            className="adm-chip"
            data-active={!custom && active === "cutoff"}
            onClick={() => {
              setCustom(false);
              set({ period: "cutoff", from: undefined, to: undefined });
            }}
            title={`Od zadnjeg presjeka (${cutoffDate.split("-").reverse().join(".")}.)`}
          >
            📐 Od presjeka
          </button>
        ) : null}
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className="adm-chip"
            data-active={!custom && active === p.key}
            onClick={() => {
              setCustom(false);
              set({ period: p.key, from: undefined, to: undefined });
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          className="adm-chip"
          data-active={custom}
          onClick={() => setCustom((v) => !v)}
        >
          Datum od–do
        </button>
      </div>

      {custom ? (
        <div className="adm-filters" style={{ marginTop: 10 }}>
          <div className="adm-filter-group">
            <label htmlFor="dp-from">Od</label>
            <input
              id="dp-from"
              type="date"
              defaultValue={(params.get("from") ?? "").slice(0, 10)}
              onChange={(e) =>
                set({
                  period: undefined,
                  from: e.target.value
                    ? new Date(e.target.value + "T00:00:00").toISOString()
                    : undefined,
                })
              }
            />
          </div>
          <div className="adm-filter-group">
            <label htmlFor="dp-to">Do</label>
            <input
              id="dp-to"
              type="date"
              defaultValue={(params.get("to") ?? "").slice(0, 10)}
              onChange={(e) =>
                set({
                  period: undefined,
                  to: e.target.value
                    ? new Date(e.target.value + "T23:59:59").toISOString()
                    : undefined,
                })
              }
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
