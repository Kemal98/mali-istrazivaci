"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { datum } from "@/lib/cms/datum";
import { DELIVERY_ISSUE_REASONS } from "@/lib/orders/types";

interface FoundOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  productName: string;
  createdAt: string;
}

/**
 * Brz put za "kurir je upravo zvao": ukucaš ime/telefon/broj narudžbe,
 * klikneš pravu osobu sa liste, upišeš razlog i napomenu — sve na ovoj
 * stranici, bez odlaska u Narudžbe da se prvo ručno traži.
 */
export default function QuickDeliveryIssue() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<FoundOrder[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<FoundOrder | null>(null);
  const [reason, setReason] = useState<string>(DELIVERY_ISSUE_REASONS[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prazan niz za kratak upit se ne postavlja ovdje preko setState — vidi
  // `visibleResults` ispod, koji to izvede iz `q` pri renderu umjesto da
  // efekat sinhrono mijenja stanje (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) return;
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/admin/orders/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json().catch(() => ({}));
      setSearching(false);
      setResults(data?.orders ?? []);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const trimmedQ = q.trim();
  const visibleResults = trimmedQ.length < 2 ? [] : results;

  function pick(o: FoundOrder) {
    setSelected(o);
    setResults([]);
    setQ("");
    setMsg("");
  }

  async function submit() {
    if (!selected) return;
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/orders/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add-delivery-issue", reason, note }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.ok) {
      setMsg(`Dodano za ${selected.customerName} (${selected.orderNumber}).`);
      setSelected(null);
      setNote("");
      setReason(DELIVERY_ISSUE_REASONS[0]);
      router.refresh();
    } else {
      setMsg(data?.error || "Greška.");
    }
  }

  return (
    <div className="adm-card" style={{ marginBottom: 14 }}>
      <div className="adm-card-title">➕ Novi upis — kurir upravo zvao</div>

      {!selected ? (
        <>
          <div className="adm-field">
            <label htmlFor="qdi-search">Ime kupca, telefon ili broj narudžbe</label>
            <input
              id="qdi-search"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="npr. Amina, 061 123 456, MI-000251…"
              autoComplete="off"
            />
          </div>
          {searching ? <p className="adm-hint">Tražim…</p> : null}
          {visibleResults.length > 0 ? (
            <ul className="adm-log" style={{ marginTop: 6 }}>
              {visibleResults.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    className="adm-cell-link"
                    onClick={() => pick(o)}
                    style={{ display: "block", width: "100%", textAlign: "left" }}
                  >
                    <b>{o.customerName || "—"}</b> · {o.orderNumber} · {o.phone || "—"}{" "}
                    · {o.city || "—"}
                    <div className="adm-hint">
                      {o.productName} · {datum(o.createdAt)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {!searching && trimmedQ.length >= 2 && visibleResults.length === 0 ? (
            <p className="adm-hint">Nema narudžbi za &quot;{trimmedQ}&quot;.</p>
          ) : null}
        </>
      ) : (
        <>
          <div className="adm-note adm-note-ok" style={{ marginBottom: 10 }}>
            Odabrano: <b>{selected.customerName}</b> · {selected.orderNumber} ·{" "}
            {selected.phone}
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              style={{ marginLeft: 10 }}
              onClick={() => setSelected(null)}
            >
              PROMIJENI
            </button>
          </div>
          <div className="adm-row">
            <div className="adm-field">
              <label htmlFor="qdi-reason">Razlog</label>
              <select
                id="qdi-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {DELIVERY_ISSUE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="adm-field">
            <label htmlFor="qdi-note">
              Napomena{" "}
              <span style={{ color: "var(--ink3)", fontWeight: 500 }}>
                (opcionalno)
              </span>
            </label>
            <textarea
              id="qdi-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="npr. probala ispravan broj, i dalje se ne javlja"
            />
          </div>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            disabled={busy}
            onClick={submit}
          >
            DODAJ UPIS
          </button>
        </>
      )}

      {msg ? (
        <p className="adm-hint" style={{ marginTop: 8 }}>
          {msg}
        </p>
      ) : null}
    </div>
  );
}
