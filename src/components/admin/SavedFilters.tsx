"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SavedFilter {
  name: string;
  /** Query string (bez "?") — tačno stanje liste u trenutku snimanja. */
  search: string;
}

const STORAGE_KEY = "mi_admin_saved_order_filters";
const MAX_SAVED = 12;

/**
 * "Omiljeni filteri" — prečica za kombinacije koje admin stalno ponavlja
 * (npr. "Nove, zadnja 2 dana"). Čuva se u localStorage (per uređaj, ne
 * dijeli se) — filteri već idu kroz URL, ovo je samo imenovani snimak
 * trenutnog URL-a za brz povratak.
 */
export default function SavedFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [saved, setSaved] = useState<SavedFilter[]>([]);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      // localStorage nedostupan (privatni mod i sl.) — tiho, bez omiljenih
    }
  }, []);

  function persist(list: SavedFilter[]) {
    setSaved(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // isto — ignoriši ako ne može pisati
    }
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const search = params.toString();
    const next = [
      { name: trimmed, search },
      ...saved.filter((s) => s.name !== trimmed),
    ].slice(0, MAX_SAVED);
    persist(next);
    setName("");
    setNaming(false);
  }

  function remove(filterName: string) {
    persist(saved.filter((s) => s.name !== filterName));
  }

  const currentSearch = params.toString();

  return (
    <div className="adm-chips" style={{ marginBottom: 10, alignItems: "center" }}>
      {saved.map((s) => (
        <span key={s.name} style={{ display: "inline-flex", gap: 2 }}>
          <button
            type="button"
            className="adm-chip"
            data-active={currentSearch === s.search}
            onClick={() => router.push(`/admin/orders?${s.search}`)}
          >
            ⭐ {s.name}
          </button>
          <button
            type="button"
            className="adm-chip"
            title={`Ukloni "${s.name}"`}
            onClick={() => remove(s.name)}
            style={{ padding: "6px 9px" }}
          >
            ✕
          </button>
        </span>
      ))}

      {naming ? (
        <span style={{ display: "inline-flex", gap: 4 }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setNaming(false);
            }}
            placeholder="Naziv filtera…"
            autoFocus
            style={{ width: 160 }}
          />
          <button type="button" className="adm-chip" onClick={save} disabled={!name.trim()}>
            SAČUVAJ
          </button>
          <button type="button" className="adm-chip" onClick={() => setNaming(false)}>
            OTKAŽI
          </button>
        </span>
      ) : (
        <button type="button" className="adm-chip" onClick={() => setNaming(true)}>
          + SAČUVAJ TRENUTNI FILTER
        </button>
      )}
    </div>
  );
}
