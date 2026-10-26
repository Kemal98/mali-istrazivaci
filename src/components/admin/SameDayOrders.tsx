"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SameDayOrderGroup } from "@/lib/orders/types";

const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * "Isti kupac, više narudžbi isti dan" — na vrhu Narudžbi, sa dugmetom
 * koje ih spoji u jedan paket (ista akcija kao "🔗 SPOJI U JEDAN PAKET" u
 * tabeli, vidi mergeOrders). Iznos poslije spajanja se računa isto kao
 * mergeOrders: zbir proizvoda + dostava najranije narudžbe (jednom).
 */
export default function SameDayOrders({ groups }: { groups: SameDayOrderGroup[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  async function merge(g: SameDayOrderGroup) {
    const nums = g.orders.map((o) => o.orderNumber).join(" + ");
    if (
      !window.confirm(
        `Spojiti ${nums} u JEDAN paket? Najranija narudžba postaje glavna, ostale se brišu. Dostava se naplaćuje jednom.`
      )
    )
      return;
    setBusy(g.phoneNormalized + g.day);
    setMsg("");
    try {
      const res = await fetch("/api/admin/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "merge", ids: g.orders.map((o) => o.id) }),
      });
      const data = await res.json().catch(() => ({}));
      setMsg(res.ok ? `Spojeno u narudžbu ${data.order?.orderNumber ?? ""}.` : data?.error || "Greška.");
      if (res.ok) router.refresh();
    } catch {
      setMsg("Nema veze sa internetom. Pokušajte ponovo.");
    } finally {
      setBusy("");
    }
  }

  if (!groups.length && !msg) return null;

  return (
    <div className="adm-note" style={{ marginBottom: 14 }}>
      {msg ? <div style={{ marginBottom: groups.length ? 8 : 0 }}><b>{msg}</b></div> : null}
      {groups.length ? (
        <>
          <b>📦 Isti kupac, više narudžbi isti dan</b> — spoji ih u jedan paket
          (jedno pakovanje, jedna brza pošta, dostava se plaća jednom).
          {groups.map((g) => {
            const sada = r2(g.orders.reduce((s, o) => s + o.totalPrice, 0));
            const poslije = r2(g.orders.reduce((s, o) => s + o.subtotal, 0) + (g.orders[0]?.shippingPrice ?? 0));
            const istiProizvod = new Set(g.orders.map((o) => o.productName.trim().toLowerCase())).size === 1;
            const key = g.phoneNormalized + g.day;
            return (
              <div key={key} className="adm-card" style={{ margin: "10px 0 0", padding: 12 }}>
                <div>
                  <b>{g.customerName || "Bez imena"}</b> —{" "}
                  <a className="adm-tel" href={`tel:${g.phone.replace(/\s/g, "")}`}>
                    {g.phone}
                  </a>{" "}
                  · {g.day.split("-").reverse().join(".")}.
                </div>
                <ul style={{ margin: "6px 0", paddingLeft: 20 }}>
                  {g.orders.map((o) => (
                    <li key={o.id}>
                      <Link href={`/admin/orders/${o.id}`}>
                        <b>{o.orderNumber}</b>
                      </Link>{" "}
                      · {o.quantity}x {o.productName} · {o.totalPrice} KM
                    </li>
                  ))}
                </ul>
                {istiProizvod ? (
                  <div className="adm-hint" style={{ marginBottom: 6 }}>
                    ⚠️ Isti proizvod više puta — možda je greškom naručeno dvaput. Ako nisi
                    siguran, pozovi kupca.
                  </div>
                ) : null}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                  <button
                    type="button"
                    className="adm-btn adm-btn-primary"
                    onClick={() => merge(g)}
                    disabled={Boolean(busy)}
                  >
                    {busy === key ? "Spajam…" : "🔗 SPOJI U JEDAN PAKET"}
                  </button>
                  <span className="adm-hint">
                    Kupac plaća kuriru <b>{poslije} KM</b>
                    {poslije !== sada ? ` umjesto ${sada} KM` : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </>
      ) : null}
    </div>
  );
}
