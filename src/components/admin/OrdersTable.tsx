"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { datum } from "@/lib/cms/datum";
import {
  ORDER_STATUSES,
  STATUS_CLASS,
  STATUS_COLOR,
  STATUS_ICON,
  STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/lib/orders/types";

/**
 * Promjena statusa direktno iz tabele, bez ulaska u narudžbu. Pozadina i
 * ikonica prate trenutni status (iste boje kao badge u mobilnoj kartici i
 * na detalju narudžbe) — cilj je da se stanje vidi pogledom niz tabelu,
 * bez čitanja teksta u svakom redu.
 */
function StatusSelect({
  order,
  onChanged,
}: {
  order: Order;
  onChanged: (o: Order) => void;
}) {
  const [busy, setBusy] = useState(false);
  const color = STATUS_COLOR[order.status];

  async function change(status: OrderStatus) {
    if (status === order.status) return;
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.order) onChanged(data.order);
  }

  return (
    <select
      className="adm-st-select"
      style={{ background: color.bg, color: color.fg, borderColor: color.bg }}
      value={order.status}
      disabled={busy}
      onChange={(e) => change(e.target.value as OrderStatus)}
      aria-label={`Status narudžbe ${order.orderNumber}`}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_ICON[s]} {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export default function OrdersTable({
  initial,
  total,
  page,
  perPage,
  pages,
}: {
  initial: Order[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
}) {
  const router = useRouter();
  // Redovi se NE kopiraju u state. Prije je bilo useState(initial), pa je
  // komponenta zadržavala stare narudžbe kad se promijeni filter koji nije
  // bio u `key` propu (npr. filter po proizvodu) — tabela je pokazivala
  // nefiltrirane rezultate. Sada su props izvor istine, a u stateu se drže
  // SAMO narudžbe koje smo lokalno izmijenili (promjena statusa), pa se
  // svaka nova lista sa servera prikaže odmah i tačno.
  const [patched, setPatched] = useState<Record<string, Order>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const rows = initial.map((o) => patched[o.id] ?? o);

  function patchRow(o: Order) {
    setPatched((m) => ({ ...m, [o.id]: o }));
  }

  // Označeno se računa prema vidljivim redovima — ID-evi iz prethodnog
  // filtera se ignorišu sami, bez dodatnog čišćenja.
  const visibleIds = new Set(rows.map((r) => r.id));
  const selected = selectedIds.filter((id) => visibleIds.has(id));
  const setSelected = setSelectedIds;
  const allSelected = rows.length > 0 && selected.length === rows.length;

  async function bulkStatus(status: OrderStatus) {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/orders/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", ids: selected, status }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setSelected([]);
    setMsg(
      res.ok
        ? `Promijenjeno ${data.changed ?? 0} narudžbi na „${STATUS_LABEL[status]}".`
        : data?.error || "Greška."
    );
    router.refresh();
  }

  /** Klik na naziv proizvoda u tabeli = filtriraj po tom proizvodu. */
  function filterByProduct(name: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("product", name);
    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  }

  async function retrySheet(ids: string[]) {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/orders/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "retry-sheet", ids }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setSelected([]);
    setMsg(
      res.ok
        ? `Sinhronizovano: ${data.synced ?? 0}, nije uspjelo: ${data.failed ?? 0}.`
        : data?.error || "Greška."
    );
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <div className="adm-empty" style={{ background: "#fff", borderRadius: 10 }}>
        Nema narudžbi za ove filtere.
      </div>
    );
  }

  return (
    <>
      {msg ? <div className="adm-note adm-note-ok">{msg}</div> : null}

      {selected.length > 0 ? (
        <div className="adm-bulk">
          <b>{selected.length} označeno</b>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            disabled={busy}
            onClick={() => bulkStatus("CONFIRMED")}
          >
            POTVRĐENO
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            disabled={busy}
            onClick={() => bulkStatus("SHIPPED")}
          >
            POSLANO
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-green"
            disabled={busy}
            onClick={() => bulkStatus("DELIVERED")}
          >
            DOSTAVLJENO
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            disabled={busy}
            onClick={() => bulkStatus("RETURNED")}
          >
            VRAĆENO
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-danger"
            disabled={busy}
            onClick={() => bulkStatus("CANCELLED")}
          >
            OTKAZANO
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            disabled={busy}
            onClick={() => retrySheet(selected)}
          >
            ↻ SHEETS SYNC
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm"
            onClick={() => setSelected([])}
          >
            ODZNAČI
          </button>
        </div>
      ) : null}

      {/* desktop: tabela */}
      <div className="adm-table-wrap adm-order-table-wrap">
        <table className="adm-table" style={{ minWidth: 1180 }}>
          <thead>
            <tr>
              <th style={{ width: 34 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  aria-label="Označi sve"
                  onChange={(e) =>
                    setSelected(e.target.checked ? rows.map((r) => r.id) : [])
                  }
                />
              </th>
              <th>Narudžba</th>
              <th>Datum</th>
              <th>Kupac</th>
              <th>Telefon</th>
              <th>Grad</th>
              <th>Proizvod</th>
              <th style={{ textAlign: "right" }}>Kol.</th>
              <th style={{ textAlign: "right" }}>Vrijednost</th>
              <th style={{ textAlign: "right" }}>Kurir naplati</th>
              <th>Status</th>
              <th>Kurir</th>
              <th>Sheets</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const color = STATUS_COLOR[o.status];
              return (
              <tr key={o.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(o.id)}
                    aria-label={`Označi ${o.orderNumber}`}
                    onChange={(e) =>
                      setSelected((s) =>
                        e.target.checked
                          ? [...s, o.id]
                          : s.filter((x) => x !== o.id)
                      )
                    }
                  />
                </td>
                {/* obojena traka lijevo = status, vidi se i bez čitanja */}
                <td style={{ boxShadow: `inset 3px 0 0 0 ${color.fg}` }}>
                  <Link href={`/admin/orders/${o.id}`}>
                    <b>{o.orderNumber}</b>
                  </Link>
                </td>
                <td className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                  {datum(o.createdAt)}
                </td>
                <td>{o.customerName || "—"}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <a className="adm-tel" href={`tel:${o.phone.replace(/\s/g, "")}`}>
                    {o.phone || "—"}
                  </a>
                </td>
                <td>{o.city || "—"}</td>
                <td style={{ maxWidth: 190 }}>
                  {/* klik na naziv filtrira listu po tom proizvodu */}
                  <button
                    type="button"
                    className="adm-cell-link"
                    title={`Prikaži samo: ${o.productName}`}
                    onClick={() => filterByProduct(o.productName)}
                  >
                    {o.productName}
                  </button>
                </td>
                <td style={{ textAlign: "right" }}>{o.quantity}</td>
                {/* vrijednost proizvoda = prihod, pa je ovo glavni broj */}
                <td style={{ textAlign: "right" }}>
                  <b>{o.subtotal} KM</b>
                </td>
                {/* ukupno sa dostavom — operativno, šta kurir uzima */}
                <td style={{ textAlign: "right" }} className="adm-hint">
                  {o.totalPrice} KM
                </td>
                <td>
                  <StatusSelect order={o} onChanged={patchRow} />
                </td>
                <td className="adm-hint" style={{ maxWidth: 120 }}>
                  {o.courier || o.trackingNumber ? (
                    <>
                      {o.courier}
                      {o.trackingNumber ? (
                        <div>{o.trackingNumber}</div>
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {o.sheetSynced ? (
                    <span className="adm-sync-ok" title="Upisano u tabelu">
                      ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm adm-btn-danger"
                      title={o.sheetError || "Nije sinhronizovano"}
                      disabled={busy}
                      onClick={() => retrySheet([o.id])}
                    >
                      ↻ RETRY
                    </button>
                  )}
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link className="adm-btn adm-btn-sm" href={`/admin/orders/${o.id}`}>
                    DETALJI
                  </Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobilni: kartice */}
      <div className="adm-order-cards">
        {rows.map((o) => (
          <div className="adm-order-card" key={o.id}>
            <div className="adm-order-card-top">
              <Link href={`/admin/orders/${o.id}`}>{o.orderNumber}</Link>
              <span className={`adm-st ${STATUS_CLASS[o.status]}`}>
                {STATUS_ICON[o.status]} {STATUS_LABEL[o.status]}
              </span>
            </div>
            <div className="adm-order-card-row">
              <span>Kupac</span>
              <b>{o.customerName || "—"}</b>
            </div>
            <div className="adm-order-card-row">
              <span>Telefon</span>
              <a className="adm-tel" href={`tel:${o.phone.replace(/\s/g, "")}`}>
                {o.phone || "—"}
              </a>
            </div>
            <div className="adm-order-card-row">
              <span>Grad</span>
              <b>{o.city || "—"}</b>
            </div>
            <div className="adm-order-card-row">
              <span>Artikal</span>
              <b style={{ textAlign: "right" }}>
                {o.productName} × {o.quantity}
              </b>
            </div>
            <div className="adm-order-card-row">
              <span>Proizvod</span>
              <b>{o.subtotal} KM</b>
            </div>
            <div className="adm-order-card-row">
              <span>Kurir naplati</span>
              <span>{o.totalPrice} KM</span>
            </div>
            <div className="adm-order-card-row">
              <span>Datum</span>
              <span>{datum(o.createdAt)}</span>
            </div>
            <div className="adm-order-card-actions">
              <StatusSelect order={o} onChanged={patchRow} />
              {!o.sheetSynced ? (
                <button
                  type="button"
                  className="adm-btn adm-btn-sm adm-btn-danger"
                  disabled={busy}
                  onClick={() => retrySheet([o.id])}
                >
                  ↻ SHEETS
                </button>
              ) : null}
              <Link className="adm-btn adm-btn-sm" href={`/admin/orders/${o.id}`}>
                DETALJI
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Pager page={page} pages={pages} total={total} perPage={perPage} />
    </>
  );
}

function Pager({
  page,
  pages,
  total,
  perPage,
}: {
  page: number;
  pages: number;
  total: number;
  perPage: number;
}) {
  const router = useRouter();

  function go(p: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(p));
    router.push(`/admin/orders?${params.toString()}`);
  }

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
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
  );
}
