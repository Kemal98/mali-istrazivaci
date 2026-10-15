"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { datum } from "@/lib/cms/datum";
import type { Customer } from "@/lib/orders/types";

const km = (v: number) => `${v.toLocaleString("bs-BA")} KM`;

const SORT_LABEL: Record<string, string> = {
  spent: "Najviše potrošili",
  recent: "Zadnja narudžba",
  orders: "Najviše narudžbi",
};

export default function CustomersTable({
  initial,
  total,
  page,
  perPage,
  pages,
}: {
  initial: Customer[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const sort = params.get("sort") ?? "spent";

  function set(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    router.push(`/admin/kupci?${next.toString()}`);
  }

  function go(p: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.push(`/admin/kupci?${next.toString()}`);
  }

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

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
          placeholder="Traži: ime, telefon, grad…"
          aria-label="Traži kupca"
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
              router.push("/admin/kupci");
            }}
          >
            OČISTI
          </button>
        ) : null}
      </form>

      <div className="adm-chips" style={{ marginBottom: 10 }}>
        {Object.entries(SORT_LABEL).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className="adm-chip"
            data-active={sort === key}
            onClick={() => set({ sort: key === "spent" ? undefined : key })}
          >
            {label}
          </button>
        ))}
      </div>

      {initial.length === 0 ? (
        <div className="adm-empty" style={{ background: "#fff", borderRadius: 10 }}>
          Nema kupaca po ovoj pretrazi.
        </div>
      ) : (
        <div className="adm-table-wrap adm-order-table-wrap">
          <table className="adm-table adm-table-grid" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th>Kupac</th>
                <th>Grad</th>
                <th style={{ textAlign: "right" }}>Narudžbi</th>
                <th style={{ textAlign: "right" }}>Dostavljeno</th>
                <th style={{ textAlign: "right" }}>Potrošeno</th>
                <th>Zadnja narudžba</th>
              </tr>
            </thead>
            <tbody>
              {initial.map((c) => (
                <tr key={c.phoneNormalized}>
                  <td>
                    <Link href={`/admin/orders?q=${encodeURIComponent(c.phone)}`}>
                      <b>{c.customerName || "—"}</b>
                    </Link>
                    <div className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                      <a className="adm-tel" href={`tel:${c.phone.replace(/\s/g, "")}`}>
                        {c.phone || "—"}
                      </a>
                    </div>
                  </td>
                  <td>{c.city || "—"}</td>
                  <td style={{ textAlign: "right" }}>{c.ordersCount}</td>
                  <td style={{ textAlign: "right" }}>{c.deliveredCount}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <b>{km(c.totalSpent)}</b>
                  </td>
                  <td className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                    {datum(c.lastOrderAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="adm-pager">
        <span>
          Prikazano {from}–{to} od {total}
        </span>
        <div className="adm-pager-btns">
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            disabled={page <= 1}
            onClick={() => go(page - 1)}
          >
            ← PRETHODNA
          </button>
          <span style={{ padding: "0 6px" }}>
            {page} / {pages}
          </span>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            disabled={page >= pages}
            onClick={() => go(page + 1)}
          >
            SLJEDEĆA →
          </button>
        </div>
      </div>
    </>
  );
}
