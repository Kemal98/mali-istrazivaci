"use client";

import { useState } from "react";
import Link from "next/link";
import { datum } from "@/lib/cms/datum";
import { channelOf } from "@/lib/orders/attribution";
import {
  ORDER_STATUSES,
  STATUS_CLASS,
  STATUS_COLOR,
  STATUS_ICON,
  STATUS_LABEL,
  type Order,
  type OrderEvent,
  type OrderStatus,
} from "@/lib/orders/types";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </>
  );
}

/** Ljudski opis jednog zapisa iz audit loga. */
function eventText(e: OrderEvent): string {
  if (e.kind === "created") return "Narudžba primljena";
  if (e.kind === "status") {
    const from = STATUS_LABEL[e.oldValue as OrderStatus] ?? e.oldValue;
    const to = STATUS_LABEL[e.newValue as OrderStatus] ?? e.newValue;
    return `Status: ${from} → ${to}`;
  }
  if (e.kind === "sheet") {
    return e.newValue === "synced"
      ? "Upisano u Google Sheet"
      : `Google Sheet nije uspio${e.note ? `: ${e.note}` : ""}`;
  }
  if (e.kind === "field") {
    const labels: Record<string, string> = {
      tracking_number: "Tracking broj",
      courier: "Kurir",
      customer_name: "Ime",
      phone: "Telefon",
      address: "Adresa",
      city: "Grad",
    };
    const name = labels[e.field] ?? e.field;
    return e.oldValue
      ? `${name}: ${e.oldValue} → ${e.newValue || "(prazno)"}`
      : `${name} dodat: ${e.newValue}`;
  }
  if (e.kind === "merged") return `Spojene narudžbe u ovu: ${e.note}`;
  if (e.kind === "merged_into") return `Spojeno u drugu narudžbu: ${e.note}`;
  if (e.kind === "deleted") return "Narudžba obrisana";
  return e.kind;
}

export default function OrderDetail({
  order: initialOrder,
  events: initialEvents,
}: {
  order: Order;
  events: OrderEvent[];
}) {
  const [order, setOrder] = useState(initialOrder);
  const [events, setEvents] = useState(initialEvents);
  const [courier, setCourier] = useState(initialOrder.courier);
  const [tracking, setTracking] = useState(initialOrder.trackingNumber);
  const [custName, setCustName] = useState(initialOrder.customerName);
  const [custPhone, setCustPhone] = useState(initialOrder.phone);
  const [custAddress, setCustAddress] = useState(initialOrder.address);
  const [custCity, setCustCity] = useState(initialOrder.city);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const custDirty =
    custName !== order.customerName ||
    custPhone !== order.phone ||
    custAddress !== order.address ||
    custCity !== order.city;

  // Heuristika za "spojena narudžba": mergeOrders u repo.ts piše
  // "Proizvod" kao "1x A, 2x B" — pravi nazivi proizvoda u ovom shopu
  // nemaju zarez, pa je ovo dovoljno pouzdano bez posebnog polja u bazi.
  const isMerged = order.productName.includes(", ");

  async function patch(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.order) {
      setOrder(data.order);
      setEvents(data.events ?? events);
      setMsg(okMsg);
    } else {
      setMsg(data?.error || "Greška.");
    }
  }

  async function retrySheet() {
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "retry-sheet" }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.order) setOrder(data.order);
    setMsg(
      data?.ok
        ? "Upisano u Google Sheet."
        : `Nije uspjelo: ${data?.error ?? "nepoznata greška"}`
    );
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>{order.orderNumber}</h1>
          <p>
            {datum(order.createdAt)} ·{" "}
            <span className={`adm-st ${STATUS_CLASS[order.status]}`}>
              {STATUS_ICON[order.status]} {STATUS_LABEL[order.status]}
            </span>
          </p>
        </div>
        <div className="adm-head-actions">
          <select
            className="adm-st-select"
            style={{
              maxWidth: 180,
              padding: "8px 10px",
              background: STATUS_COLOR[order.status].bg,
              color: STATUS_COLOR[order.status].fg,
              borderColor: STATUS_COLOR[order.status].bg,
            }}
            value={order.status}
            disabled={busy}
            onChange={(e) =>
              patch(
                { status: e.target.value },
                `Status promijenjen na „${
                  STATUS_LABEL[e.target.value as OrderStatus]
                }".`
              )
            }
            aria-label="Promijeni status"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_ICON[s]} {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <Link className="adm-btn" href="/admin/orders">
            ← NAZAD NA LISTU
          </Link>
        </div>
      </div>

      {msg ? <div className="adm-note adm-note-ok">{msg}</div> : null}

      <div className="adm-detail-grid">
        <div>
          <div className="adm-card">
            <div className="adm-card-title">Kupac</div>
            <p className="adm-hint" style={{ marginBottom: 10 }}>
              Ispravi ako je greška u kucanju (npr. pogrešan broj telefona).
            </p>
            <div className="adm-row">
              <div className="adm-field">
                <label htmlFor="c-ime">Ime</label>
                <input
                  id="c-ime"
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                />
              </div>
              <div className="adm-field">
                <label htmlFor="c-tel">Telefon</label>
                <input
                  id="c-tel"
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="adm-row">
              <div className="adm-field">
                <label htmlFor="c-adresa">Adresa</label>
                <input
                  id="c-adresa"
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                />
              </div>
              <div className="adm-field">
                <label htmlFor="c-grad">Grad</label>
                <input
                  id="c-grad"
                  type="text"
                  value={custCity}
                  onChange={(e) => setCustCity(e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              disabled={busy || !custDirty}
              onClick={() =>
                patch(
                  {
                    customerName: custName,
                    phone: custPhone,
                    address: custAddress,
                    city: custCity,
                  },
                  "Podaci o kupcu snimljeni."
                )
              }
            >
              SNIMI KUPCA
            </button>
            {order.email ? (
              <dl className="adm-dl" style={{ marginTop: 14 }}>
                <Row label="Email" value={order.email} />
                {order.note ? <Row label="Napomena" value={order.note} /> : null}
              </dl>
            ) : order.note ? (
              <dl className="adm-dl" style={{ marginTop: 14 }}>
                <Row label="Napomena" value={order.note} />
              </dl>
            ) : null}
          </div>

          <div className="adm-card">
            <div className="adm-card-title">Proizvod i naplata</div>
            <dl className="adm-dl" style={{ marginBottom: 14 }}>
              <Row label="Proizvod" value={order.productName} />
              {/* Spojena narudžba (vidi mergeOrders) već ima "1x A, 2x B"
                  u "Proizvod" — Količina/Cijena-po-komadu bi tu bili
                  zbunjujući (odnose se samo na prvobitni, jedan proizvod). */}
              {!isMerged && (
                <>
                  <Row label="Količina" value={order.quantity} />
                  <Row label="Cijena/kom" value={`${order.unitPrice} KM`} />
                </>
              )}
            </dl>
            <div className="adm-money-row">
              <span>Proizvod</span>
              <b>{order.subtotal} KM</b>
            </div>
            <div className="adm-money-row">
              <span>Dostava</span>
              <b>{order.shippingPrice} KM</b>
            </div>
            {order.discount ? (
              <div className="adm-money-row">
                <span>Popust</span>
                <b>−{order.discount} KM</b>
              </div>
            ) : null}
            <div className="adm-money-row adm-money-total">
              <span>KURIR NAPLATI KUPCU</span>
              <b>{order.totalPrice} KM</b>
            </div>
            {order.costTotal > 0 ? (
              <>
                <div className="adm-money-row" style={{ marginTop: 10 }}>
                  <span>Nabavna cijena</span>
                  <b>−{order.costTotal} KM</b>
                </div>
                <div className="adm-money-row adm-money-total">
                  <span>PROFIT</span>
                  <b style={{ color: "#148a4b" }}>
                    {Math.round((order.subtotal - order.costTotal) * 100) / 100} KM
                  </b>
                </div>
              </>
            ) : (
              <p className="adm-hint" style={{ marginTop: 10 }}>
                Nabavna cijena nije upisana za ovaj proizvod — profit se ne
                može izračunati. Upiši je u uređivaču proizvoda.
              </p>
            )}
            <p className="adm-hint" style={{ marginTop: 10 }}>
              Plaćanje: <b>pouzećem</b>. U statistici se kao prihod računa
              samo <b>vrijednost proizvoda ({order.subtotal} KM)</b> —
              dostava ide kuriru.
            </p>
          </div>

          <div className="adm-card">
            <div className="adm-card-title">Dostava</div>
            <div className="adm-row">
              <div className="adm-field">
                <label htmlFor="d-courier">Kurirska služba</label>
                <input
                  id="d-courier"
                  type="text"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="npr. BH Pošta, X Express…"
                />
              </div>
              <div className="adm-field">
                <label htmlFor="d-track">Tracking broj</label>
                <input
                  id="d-track"
                  type="text"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="npr. 123456789"
                />
              </div>
            </div>
            <button
              type="button"
              className="adm-btn adm-btn-primary"
              disabled={
                busy ||
                (courier === order.courier && tracking === order.trackingNumber)
              }
              onClick={() =>
                patch(
                  { courier, trackingNumber: tracking },
                  "Podaci o dostavi snimljeni."
                )
              }
            >
              SNIMI DOSTAVU
            </button>
            {order.shippedAt || order.deliveredAt ? (
              <dl className="adm-dl" style={{ marginTop: 14 }}>
                {order.shippedAt ? (
                  <Row label="Poslano" value={datum(order.shippedAt)} />
                ) : null}
                {order.deliveredAt ? (
                  <Row label="Dostavljeno" value={datum(order.deliveredAt)} />
                ) : null}
              </dl>
            ) : null}
          </div>
        </div>

        <div>
          <div className="adm-card">
            <div className="adm-card-title">Marketing — odakle je kupac</div>
            <dl className="adm-dl">
              <Row label="Kanal" value={channelOf(order)} />
              <Row label="UTM source" value={order.utmSource} />
              <Row label="UTM medium" value={order.utmMedium} />
              <Row label="UTM campaign" value={order.utmCampaign} />
              <Row label="UTM content" value={order.utmContent} />
              <Row label="UTM term" value={order.utmTerm} />
              <Row
                label="fbclid"
                value={
                  order.fbclid ? (
                    <span style={{ fontSize: ".78rem", wordBreak: "break-all" }}>
                      {order.fbclid}
                    </span>
                  ) : null
                }
              />
              <Row label="Landing page" value={order.landingPage} />
              <Row
                label="Referrer"
                value={
                  order.referrer ? (
                    <span style={{ fontSize: ".78rem", wordBreak: "break-all" }}>
                      {order.referrer}
                    </span>
                  ) : null
                }
              />
            </dl>
          </div>

          <div className="adm-card">
            <div className="adm-card-title">Sistem</div>
            <dl className="adm-dl">
              <Row
                label="Google Sheet"
                value={
                  order.sheetSynced ? (
                    <span className="adm-sync-ok">✓ Sinhronizovano</span>
                  ) : (
                    <span className="adm-sync-bad">✕ Nije sinhronizovano</span>
                  )
                }
              />
              {order.sheetSyncedAt ? (
                <Row label="Sync datum" value={datum(order.sheetSyncedAt)} />
              ) : null}
              {order.sheetError ? (
                <Row
                  label="Greška"
                  value={
                    <span style={{ fontSize: ".76rem", color: "var(--red)" }}>
                      {order.sheetError}
                    </span>
                  }
                />
              ) : null}
              <Row label="Pokušaja" value={order.sheetAttempts} />
              <Row label="Izvor zapisa" value={order.source} />
            </dl>
            {!order.sheetSynced ? (
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                style={{ marginTop: 12 }}
                disabled={busy}
                onClick={retrySheet}
              >
                ↻ POKUŠAJ PONOVO POSLATI U GOOGLE SHEETS
              </button>
            ) : null}
          </div>

          <div className="adm-card">
            <div className="adm-card-title">Historija izmjena</div>
            <ul className="adm-log">
              {events.map((e) => (
                <li key={e.id}>
                  <time>
                    {datum(e.createdAt)}
                    {e.actor ? ` · ${e.actor}` : ""}
                  </time>
                  {eventText(e)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
