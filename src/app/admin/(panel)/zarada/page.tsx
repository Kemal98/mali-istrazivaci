import Link from "next/link";
import { profitByProductDay } from "@/lib/orders/profit";

/**
 * Brz pregled: za SVAKI proizvod, dan-po-dan, koliko je potrošeno na
 * reklame i koliko je zarađeno — direktno vidljivo (bez klikanja), da
 * admin odmah vidi je li npr. jučer/prekjučer bilo 0, 1, 2 prodaje.
 * Odvojeno od Dashboarda (gdje je ista stvar sakrivena iza klika na
 * proizvod) — ovo je namjerno "pri ruci", svoja stavka u meniju.
 */
export const dynamic = "force-dynamic";

const km = (v: number) => `${v.toLocaleString("bs-BA")} KM`;

type PresetKey = "today" | "yesterday" | "daybefore" | "3d" | "7d" | "30d" | "month";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Danas" },
  { key: "yesterday", label: "Juče" },
  { key: "daybefore", label: "Prekjučer" },
  { key: "3d", label: "Zadnja 3 dana" },
  { key: "7d", label: "Zadnjih 7 dana" },
  { key: "30d", label: "Zadnjih 30 dana" },
  { key: "month", label: "Ovaj mjesec" },
];

/** Sarajevo YYYY-MM-DD za "danas - n dana". */
function dayStr(offsetDays: number): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sarajevo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const d = new Date(Date.now() + offsetDays * 86400000);
  return fmt.format(d); // en-CA daje YYYY-MM-DD
}

function rangeFor(key: PresetKey): { from: string; to: string } {
  const today = dayStr(0);
  switch (key) {
    case "yesterday":
      return { from: dayStr(-1), to: dayStr(-1) };
    case "daybefore":
      return { from: dayStr(-2), to: dayStr(-2) };
    case "3d":
      return { from: dayStr(-2), to: today };
    case "7d":
      return { from: dayStr(-6), to: today };
    case "30d":
      return { from: dayStr(-29), to: today };
    case "month": {
      const now = new Date();
      const first = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Sarajevo",
        year: "numeric",
        month: "2-digit",
      }).format(now);
      return { from: `${first}-01`, to: today };
    }
    case "today":
    default:
      return { from: today, to: today };
  }
}

export default async function ZaradaPoProizvoduPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const activeKey = (PRESETS.find((p) => p.key === sp.period)?.key ?? "today") as PresetKey;
  const { from, to } = rangeFor(activeKey);

  const byProduct = await profitByProductDay(from, to);
  // Samo proizvodi sa stvarnom aktivnošću u periodu, sortirano po zaradi.
  const entries = [...byProduct.entries()]
    .map(([name, days]) => {
      const totals = days.reduce(
        (a, d) => ({
          orders: a.orders + d.orders,
          revenue: a.revenue + d.revenue,
          adSpend: a.adSpend + d.adSpend,
          profit: a.profit + d.profit,
        }),
        { orders: 0, revenue: 0, adSpend: 0, profit: 0 }
      );
      return { name, days, totals };
    })
    .sort((a, b) => b.totals.revenue + b.totals.adSpend - (a.totals.revenue + a.totals.adSpend));

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Zarada po proizvodu, po danu</h1>
          <p>Reklame i prodaja za svaki proizvod, dan-po-dan — {from === to ? from : `${from} – ${to}`}.</p>
        </div>
      </div>

      <div className="adm-chips">
        {PRESETS.map((p) => (
          <Link
            key={p.key}
            href={`/admin/zarada?period=${p.key}`}
            className="adm-chip"
            data-active={activeKey === p.key}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="adm-hint" style={{ marginTop: 16 }}>
          Nema narudžbi ni potrošnje na reklame u ovom periodu.
        </p>
      ) : (
        entries.map(({ name, days, totals }) => (
          <div className="adm-card" key={name} style={{ marginTop: 14 }}>
            <div
              className="adm-card-title"
              style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}
            >
              <span>{name}</span>
              <span className="adm-hint" style={{ fontWeight: 500 }}>
                ukupno: {totals.orders} nar. · {km(totals.revenue)} prihod ·{" "}
                {totals.adSpend > 0 ? `−${km(totals.adSpend)} reklame · ` : ""}
                <b style={{ color: totals.profit >= 0 ? "#148a4b" : "#b3261e" }}>
                  {km(totals.profit)} zarada
                </b>
              </span>
            </div>
            <div className="adm-table-wrap" style={{ border: "none", marginTop: 8 }}>
              <table className="adm-table" style={{ minWidth: 0 }}>
                <thead>
                  <tr>
                    <th>Dan</th>
                    <th style={{ textAlign: "right" }}>Narudž.</th>
                    <th style={{ textAlign: "right" }}>Prihod</th>
                    <th style={{ textAlign: "right" }}>Reklame</th>
                    <th style={{ textAlign: "right" }}>Zarada</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((d) => (
                    <tr key={d.day}>
                      <td>{d.day}</td>
                      <td style={{ textAlign: "right" }}>
                        {d.orders > 0 ? (
                          <b>{d.orders}</b>
                        ) : (
                          <span className="adm-hint">0</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>{km(d.revenue)}</td>
                      <td style={{ textAlign: "right" }} className="adm-hint">
                        {d.adSpend > 0 ? `−${km(d.adSpend)}` : "—"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <b style={{ color: d.profit >= 0 ? "#148a4b" : "#b3261e" }}>
                          {km(d.profit)}
                        </b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </>
  );
}
