"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/orders/types";

/**
 * Filteri idu kroz URL (?status=NEW&from=…), ne kroz lokalni state.
 * Tako filtriranje i paginacija ostaju na serveru (SQL), link se može
 * podijeliti/bookmarkovati, a dugme "nazad" u browseru radi kako treba.
 */

/** Pretvori preset u ISO raspon (Europe/Sarajevo dan). */
function presetRange(preset: string): { from?: string; to?: string } {
  const now = new Date();
  const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const iso = (d: Date) => d.toISOString();

  switch (preset) {
    case "today":
      return { from: iso(startOfDay(now)) };
    case "yesterday": {
      const y = startOfDay(new Date(now.getTime() - 86400000));
      const end = new Date(y.getTime() + 86400000 - 1);
      return { from: iso(y), to: iso(end) };
    }
    case "7d":
      return { from: iso(startOfDay(new Date(now.getTime() - 6 * 86400000))) };
    case "30d":
      return { from: iso(startOfDay(new Date(now.getTime() - 29 * 86400000))) };
    case "month":
      return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)) };
    case "lastmonth": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, -1);
      return { from: iso(start), to: iso(end) };
    }
    default:
      return {};
  }
}

const DATE_PRESETS = [
  { key: "", label: "Sve vrijeme" },
  { key: "today", label: "Danas" },
  { key: "yesterday", label: "Juče" },
  { key: "7d", label: "7 dana" },
  { key: "30d", label: "30 dana" },
  { key: "month", label: "Ovaj mjesec" },
  { key: "lastmonth", label: "Prošli mjesec" },
];

export default function OrderFilters({
  products,
  cities,
  unsynced,
}: {
  products: string[];
  cities: string[];
  unsynced: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [custom, setCustom] = useState(false);

  /** Promijeni jedan ili više parametara i vrati se na prvu stranicu. */
  function set(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    router.push(`/admin/orders?${next.toString()}`);
  }

  const status = params.get("status") ?? "ALL";
  const preset = params.get("preset") ?? "";

  return (
    <>
      <form
        className="adm-search"
        onSubmit={(e) => {
          e.preventDefault();
          set({ q: q.trim() || undefined });
        }}
      >
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Traži: broj narudžbe, ime, telefon, grad, adresa…"
          aria-label="Traži narudžbu"
        />
        <button type="submit" className="adm-btn adm-btn-primary">
          TRAŽI
        </button>
        {params.toString() ? (
          <button
            type="button"
            className="adm-btn"
            onClick={() => {
              setQ("");
              router.push("/admin/orders");
            }}
          >
            OČISTI SVE
          </button>
        ) : null}
      </form>

      {unsynced > 0 ? (
        <div className="adm-note adm-note-err">
          <b>
            {unsynced}{" "}
            {unsynced === 1
              ? "narudžba nije sinhronizovana"
              : "narudžbi nije sinhronizovano"}{" "}
            sa Google Sheets.
          </b>{" "}
          Narudžbe su sigurne u bazi — samo nisu upisane u tabelu.{" "}
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            style={{ marginLeft: 8 }}
            onClick={() => set({ unsynced: "1", status: undefined })}
          >
            PRIKAŽI IH
          </button>
        </div>
      ) : null}

      {/* status */}
      <div className="adm-chips" style={{ marginBottom: 10 }}>
        <button
          type="button"
          className="adm-chip"
          data-active={status === "ALL" && params.get("unsynced") !== "1"}
          onClick={() => set({ status: undefined, unsynced: undefined })}
        >
          Sve
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className="adm-chip"
            data-active={status === s}
            onClick={() => set({ status: s, unsynced: undefined })}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* period */}
      <div className="adm-chips" style={{ marginBottom: 10 }}>
        {DATE_PRESETS.map((p) => (
          <button
            key={p.key || "all"}
            type="button"
            className="adm-chip"
            data-active={preset === p.key && !custom}
            onClick={() => {
              setCustom(false);
              const r = presetRange(p.key);
              set({ preset: p.key || undefined, from: r.from, to: r.to });
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
        <div className="adm-filters">
          <div className="adm-filter-group">
            <label htmlFor="f-from">Od</label>
            <input
              id="f-from"
              type="date"
              onChange={(e) =>
                set({
                  preset: undefined,
                  from: e.target.value
                    ? new Date(e.target.value + "T00:00:00").toISOString()
                    : undefined,
                })
              }
            />
          </div>
          <div className="adm-filter-group">
            <label htmlFor="f-to">Do</label>
            <input
              id="f-to"
              type="date"
              onChange={(e) =>
                set({
                  preset: undefined,
                  to: e.target.value
                    ? new Date(e.target.value + "T23:59:59").toISOString()
                    : undefined,
                })
              }
            />
          </div>
        </div>
      ) : null}

      {/* proizvod / grad / sortiranje / broj po stranici */}
      <div className="adm-filters">
        <div className="adm-filter-group">
          <label htmlFor="f-prod">Proizvod</label>
          <select
            id="f-prod"
            value={params.get("product") ?? ""}
            onChange={(e) => set({ product: e.target.value || undefined })}
          >
            <option value="">Svi proizvodi</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="adm-filter-group">
          <label htmlFor="f-city">Grad</label>
          <select
            id="f-city"
            value={params.get("city") ?? ""}
            onChange={(e) => set({ city: e.target.value || undefined })}
          >
            <option value="">Svi gradovi</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="adm-filter-group">
          <label htmlFor="f-sort">Sortiraj</label>
          <select
            id="f-sort"
            value={params.get("sort") ?? "newest"}
            onChange={(e) => set({ sort: e.target.value })}
          >
            <option value="newest">Najnovije</option>
            <option value="oldest">Najstarije</option>
            <option value="highest">Najveća vrijednost</option>
            <option value="lowest">Najmanja vrijednost</option>
          </select>
        </div>

        <div className="adm-filter-group">
          <label htmlFor="f-per">Po stranici</label>
          <select
            id="f-per"
            value={params.get("perPage") ?? "25"}
            onChange={(e) => set({ perPage: e.target.value })}
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <a
          className="adm-btn"
          href={`/api/admin/orders/export?${params.toString()}`}
        >
          ⤓ EXPORT CSV
        </a>
      </div>
    </>
  );
}
