import { Suspense } from "react";
import Link from "next/link";
import { after } from "next/server";
import { metaConfigured } from "@/lib/ads/meta";
import { syncMetaSpend } from "@/lib/ads/sync";
import { datum, sarajevoDateOnly } from "@/lib/cms/datum";
import { META_USD_TO_KM } from "@/lib/ads/currency";
import { profitAsIfSold } from "@/lib/orders/profit";
import { countUnsynced, listOrders } from "@/lib/orders/repo";
import { shopStats } from "@/lib/orders/dashboard";
import {
  bySource,
  byCampaign,
  dailySeries,
  fillDays,
  kpi,
  topCities,
  topProducts,
  type Period,
} from "@/lib/orders/stats";
import { STATUS_CLASS, STATUS_LABEL, type OrderStatus } from "@/lib/orders/types";
import DashboardPeriod from "@/components/admin/DashboardPeriod";
import OrdersChart from "@/components/admin/OrdersChart";

export const dynamic = "force-dynamic";

/* ---------- pomoćno: rasponi datuma ---------- */

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

function resolvePeriod(
  period: string | undefined,
  from?: string,
  to?: string
): { range: Period; fromDate: Date; toDate: Date; label: string } {
  const now = new Date();

  if (from || to) {
    const f = from ? new Date(from) : startOfDay(new Date(now.getTime() - 29 * 864e5));
    const t = to ? new Date(to) : now;
    return {
      range: { from: f.toISOString(), to: t.toISOString() },
      fromDate: f,
      toDate: t,
      label: "izabrani period",
    };
  }

  switch (period) {
    case "7d": {
      const f = startOfDay(new Date(now.getTime() - 6 * 864e5));
      return { range: { from: f.toISOString() }, fromDate: f, toDate: now, label: "7 dana" };
    }
    case "90d": {
      const f = startOfDay(new Date(now.getTime() - 89 * 864e5));
      return { range: { from: f.toISOString() }, fromDate: f, toDate: now, label: "90 dana" };
    }
    case "month": {
      const f = new Date(now.getFullYear(), now.getMonth(), 1);
      return { range: { from: f.toISOString() }, fromDate: f, toDate: now, label: "ovaj mjesec" };
    }
    case "lastmonth": {
      const f = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const t = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, -1);
      return {
        range: { from: f.toISOString(), to: t.toISOString() },
        fromDate: f,
        toDate: t,
        label: "prošli mjesec",
      };
    }
    default: {
      const f = startOfDay(new Date(now.getTime() - 29 * 864e5));
      return { range: { from: f.toISOString() }, fromDate: f, toDate: now, label: "30 dana" };
    }
  }
}

// Potrošnja iz Mete se osvježi u pozadini kad se dashboard otvori (najviše
// jednom u 10 min), pa brojke nisu stare do dnevnog cron-a u 6:00. Vidi se
// pri sljedećem učitavanju stranice.
let lastMetaRefresh = 0;

const km = (v: number) => `${v.toLocaleString("bs-BA")} KM`;

/* ---------- stranica ---------- */

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  if (metaConfigured() && Date.now() - lastMetaRefresh > 10 * 60_000) {
    lastMetaRefresh = Date.now();
    after(async () => {
      try {
        await syncMetaSpend(
          sarajevoDateOnly(new Date(Date.now() - 3 * 864e5)),
          sarajevoDateOnly(new Date())
        );
      } catch (e) {
        console.error("[dashboard] osvježavanje Meta potrošnje palo:", e);
      }
    });
  }
  const { range, fromDate, toDate, label } = resolvePeriod(sp.period, sp.from, sp.to);

  const now = new Date();
  const todayRange: Period = { from: startOfDay(now).toISOString() };
  const d7: Period = {
    from: startOfDay(new Date(now.getTime() - 6 * 864e5)).toISOString(),
  };
  const d30: Period = {
    from: startOfDay(new Date(now.getTime() - 29 * 864e5)).toISOString(),
  };

  // Sve sekvencijalno — vidi komentar u stats.ts o poolu konekcija.
  const today = await kpi(todayRange);
  const week = await kpi(d7);
  const month = await kpi(d30);
  const all = await kpi({});
  const period = await kpi(range);
  const series = fillDays(await dailySeries(range), fromDate, toDate);
  const products = await topProducts(range);
  const profit = await profitAsIfSold(
    range,
    sarajevoDateOnly(fromDate),
    sarajevoDateOnly(toDate)
  );
  const cities = await topCities(range);
  const sources = await bySource(range);
  const campaigns = await byCampaign(range);
  const unsynced = await countUnsynced();
  const latest = await listOrders({ page: 1, perPage: 8 });
  const shop = await shopStats();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p>
            Svi iznosi su <b>vrijednost proizvoda, bez dostave</b> —
            dostavu kupac plaća kuriru i nije prihod shopa. Realizovan
            promet računa se samo iz <b>dostavljenih</b> narudžbi.
          </p>
        </div>
        <div className="adm-head-actions">
          <Link className="adm-btn" href="/admin/orders">
            SVE NARUDŽBE →
          </Link>
        </div>
      </div>

      {unsynced > 0 ? (
        <div className="adm-note adm-note-err">
          <b>
            {unsynced}{" "}
            {unsynced === 1 ? "narudžba nije" : "narudžbi nije"} sinhronizovano
            sa Google Sheets.
          </b>{" "}
          Sve su sigurne u bazi.{" "}
          <Link
            className="adm-btn adm-btn-sm"
            style={{ marginLeft: 8 }}
            href="/admin/orders?unsynced=1"
          >
            PRIKAŽI I POKUŠAJ PONOVO
          </Link>
        </div>
      ) : null}

      {/* ---------- DANAS ---------- */}
      <div className="adm-card-title" style={{ marginTop: 4 }}>
        Danas
      </div>
      <div className="adm-kpi-grid">
        <div className="adm-kpi">
          <span>Narudžbi</span>
          <b>{today.orders}</b>
        </div>
        <div className="adm-kpi">
          <span>Vrijednost proizvoda</span>
          <b>{km(today.revenue)}</b>
          <small>kurir naplati {km(today.collected)} (sa dostavom)</small>
        </div>
        <div className="adm-kpi">
          <span>Prosječna narudžba</span>
          <b>{km(today.avg)}</b>
        </div>
        <div className="adm-kpi adm-kpi-accent">
          <span>Dostavljene</span>
          <b>{today.delivered}</b>
          <small>{km(today.realized)} realizovano</small>
        </div>
        <div className="adm-kpi adm-kpi-warn">
          <span>Vraćene</span>
          <b>{today.returned}</b>
        </div>
        <div className="adm-kpi adm-kpi-bad">
          <span>Otkazane</span>
          <b>{today.cancelled}</b>
        </div>
      </div>

      {/* ---------- 7 / 30 DANA ---------- */}
      <div className="adm-row" style={{ marginTop: 14 }}>
        {[
          { t: "Posljednjih 7 dana", k: week },
          { t: "Posljednjih 30 dana", k: month },
        ].map(({ t, k }) => (
          <div className="adm-card" key={t}>
            <div className="adm-card-title">{t}</div>
            <div className="adm-kpi-grid">
              <div className="adm-kpi">
                <span>Narudžbe</span>
                <b>{k.orders}</b>
              </div>
              <div className="adm-kpi">
                <span>Vrijednost proizvoda</span>
                <b>{km(k.revenue)}</b>
              </div>
              <div className="adm-kpi">
                <span>Prosjek</span>
                <b>{km(k.avg)}</b>
              </div>
              <div className="adm-kpi adm-kpi-accent">
                <span>Realizovano</span>
                <b>{km(k.realized)}</b>
                <small>{k.delivered} dostavljeno</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- GRAFIKON ---------- */}
      <div className="adm-card">
        <div
          className="adm-card-title"
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span>Narudžbe i promet po danima — {label}</span>
        </div>
        <Suspense fallback={<div className="adm-hint">Učitavam…</div>}>
          <DashboardPeriod />
        </Suspense>
        <div style={{ marginTop: 16 }}>
          <OrdersChart data={series} />
        </div>
        <div className="adm-kpi-grid" style={{ marginTop: 16 }}>
          <div className="adm-kpi">
            <span>Narudžbe u periodu</span>
            <b>{period.orders}</b>
          </div>
          <div className="adm-kpi">
            <span>Vrijednost proizvoda</span>
            <b>{km(period.revenue)}</b>
            <small>bez dostave ({km(period.shipping)})</small>
          </div>
          <div className="adm-kpi adm-kpi-accent">
            <span>Realizovan promet</span>
            <b>{km(period.realized)}</b>
            <small>samo dostavljene</small>
          </div>
          <div className="adm-kpi">
            <span>Delivery rate</span>
            <b>{period.deliveryRate}%</b>
            <small>
              {period.delivered} dostavljeno / {period.returned} vraćeno
            </small>
          </div>
          <div className="adm-kpi adm-kpi-warn">
            <span>Return rate</span>
            <b>{period.returnRate}%</b>
          </div>
          <div className="adm-kpi adm-kpi-bad">
            <span>Cancellation rate</span>
            <b>{period.cancellationRate}%</b>
            <small>{period.cancelled} otkazano</small>
          </div>
        </div>
      </div>

      {/* ---------- STATUSI ---------- */}
      <div className="adm-card">
        <div className="adm-card-title">Status narudžbi — {label}</div>
        <div className="adm-chips">
          {(
            [
              ["NEW", period.countNew],
              ["CONFIRMED", period.confirmed],
              ["PACKING", period.packing],
              ["SHIPPED", period.shipped],
              ["DELIVERED", period.delivered],
              ["RETURNED", period.returned],
              ["CANCELLED", period.cancelled],
            ] as [OrderStatus, number][]
          ).map(([st, count]) => (
            <Link
              key={st}
              className="adm-chip"
              href={`/admin/orders?status=${st}`}
              title={`Prikaži: ${STATUS_LABEL[st]}`}
            >
              <span className={`adm-st ${STATUS_CLASS[st]}`} style={{ marginRight: 6 }}>
                {STATUS_LABEL[st]}
              </span>
              {count}
            </Link>
          ))}
        </div>
      </div>

      {/* ---------- TOP PROIZVODI ---------- */}
      <div className="adm-card">
        <div className="adm-card-title">Najprodavaniji proizvodi — {label}</div>
        {products.length === 0 ? (
          <p className="adm-hint">Nema narudžbi u ovom periodu.</p>
        ) : (
          <div className="adm-table-wrap" style={{ border: "none" }}>
            <table className="adm-table" style={{ minWidth: 820 }}>
              <thead>
                <tr>
                  <th>Proizvod</th>
                  <th style={{ textAlign: "right" }}>Narudžbi</th>
                  <th style={{ textAlign: "right" }}>Komada</th>
                  <th style={{ textAlign: "right" }}>Proizvodi</th>
                  <th style={{ textAlign: "right" }}>Dostavljeno</th>
                  <th style={{ textAlign: "right" }}>Vraćeno</th>
                  <th style={{ textAlign: "right" }}>Otkazano</th>
                  <th style={{ textAlign: "right" }}>Realizovano</th>
                  <th style={{ textAlign: "right" }}>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.productName}>
                    <td>
                      <Link
                        href={`/admin/orders?product=${encodeURIComponent(p.productName)}`}
                      >
                        {p.productName}
                      </Link>
                    </td>
                    <td style={{ textAlign: "right" }}>{p.orders}</td>
                    <td style={{ textAlign: "right" }}>{p.quantity}</td>
                    <td style={{ textAlign: "right" }}>{km(p.revenue)}</td>
                    <td style={{ textAlign: "right" }}>{p.delivered}</td>
                    <td style={{ textAlign: "right" }}>{p.returned}</td>
                    <td style={{ textAlign: "right" }}>{p.cancelled}</td>
                    <td style={{ textAlign: "right" }}>
                      <b>{km(p.realized)}</b>
                    </td>
                    <td style={{ textAlign: "right" }}>{p.deliveryRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- ZARADA (kao da je sve prodano) ---------- */}
      <div className="adm-card">
        <div className="adm-card-title">Zarada — {label}</div>
        <p className="adm-hint" style={{ marginBottom: 14 }}>
          Računa se <b>kao da je sve prodano</b>: sve narudžbe iz perioda
          (bez obzira na status), vrijednost proizvoda bez dostave, minus
          nabavna cijena (stvarna prosječna iz <b>Nabavka robe</b>, ako je uneseno; inače cijena iz proizvoda) i minus sav novac potrošen na reklame (Meta u USD
          pretvoren u KM po kursu {META_USD_TO_KM}).
        </p>
        <div className="adm-kpi-grid">
          <div className="adm-kpi">
            <span>Prihod</span>
            <b>{km(profit.revenue)}</b>
            <small>{profit.orders} narudžbi · {profit.quantity} kom</small>
          </div>
          <div className="adm-kpi">
            <span>Nabavna cijena</span>
            <b>−{km(profit.cost)}</b>
          </div>
          {profit.purchasedCost > 0 ? (
            <div className="adm-kpi">
              <span>Uloženo u robu</span>
              <b>{km(profit.purchasedCost)}</b>
              <small>sve nabavke (unosi se u Nabavka robe)</small>
            </div>
          ) : null}
          <div className="adm-kpi">
            <span>Reklame</span>
            <b>−{km(profit.adSpend)}</b>
          </div>
          <div className="adm-kpi">
            <span>ZARADA</span>
            <b style={{ color: profit.profit >= 0 ? "#148a4b" : "#b3261e" }}>
              {km(profit.profit)}
            </b>
            <small>
              {profit.revenue > 0
                ? `marža ${Math.round((profit.profit / profit.revenue) * 1000) / 10}%`
                : ""}
            </small>
          </div>
        </div>

        {profit.rows.length > 0 ? (
          <div className="adm-table-wrap" style={{ border: "none", marginTop: 14 }}>
            <table className="adm-table" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Proizvod</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Narudž.</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Prihod</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Nabavna</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Reklame</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Zarada</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Po narudž.</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Na stanju</th>
                </tr>
              </thead>
              <tbody>
                {profit.rows.map((p) => (
                  <tr key={p.productName}>
                    <td>
                      {p.productName}
                      {p.missingCost ? (
                        <span className="adm-hint"> · fali nabavna cijena</span>
                      ) : null}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{p.orders || "—"}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{km(p.revenue)}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                      {p.cost > 0 ? `−${km(p.cost)}` : "—"}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                      {p.adSpend > 0 ? `−${km(p.adSpend)}` : "—"}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <b style={{ color: p.profit >= 0 ? "#148a4b" : "#b3261e" }}>
                        {km(p.profit)}
                      </b>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                      {p.orders ? km(Math.round((p.profit / p.orders) * 100) / 100) : "—"}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                      {p.stock === null ? "—" : `${p.stock} kom`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="adm-hint">Nema narudžbi ni reklama u ovom periodu.</p>
        )}
        <p className="adm-hint" style={{ marginTop: 10 }}>
          Nabavna cijena se upisuje u{" "}
          <Link href="/admin/products">uređivaču proizvoda</Link>; reklame se
          same povlače iz Mete, ručni unos je u{" "}
          <Link href="/admin/troskovi">Troškovi reklama</Link>.
        </p>
      </div>

      {/* ---------- GRADOVI + MARKETING ---------- */}
      <div className="adm-detail-grid">
        <div className="adm-card">
          <div className="adm-card-title">Top gradovi — {label}</div>
          {cities.length === 0 ? (
            <p className="adm-hint">Nema podataka.</p>
          ) : (
            <table className="adm-table" style={{ minWidth: 0 }}>
              <thead>
                <tr>
                  <th>Grad</th>
                  <th style={{ textAlign: "right" }}>Narudžbi</th>
                  <th style={{ textAlign: "right" }}>Proizvodi</th>
                  <th style={{ textAlign: "right" }}>Dost.</th>
                  <th style={{ textAlign: "right" }}>Vrać.</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((c) => (
                  <tr key={c.city}>
                    <td>
                      <Link href={`/admin/orders?city=${encodeURIComponent(c.city)}`}>
                        {c.city}
                      </Link>
                    </td>
                    <td style={{ textAlign: "right" }}>{c.orders}</td>
                    <td style={{ textAlign: "right" }}>{km(c.revenue)}</td>
                    <td style={{ textAlign: "right" }}>{c.delivered}</td>
                    <td style={{ textAlign: "right" }}>{c.returned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card-title">Odakle dolaze narudžbe — {label}</div>
          {sources.length === 0 ? (
            <p className="adm-hint">Nema podataka.</p>
          ) : (
            <table className="adm-table" style={{ minWidth: 0 }}>
              <thead>
                <tr>
                  <th>Kanal</th>
                  <th style={{ textAlign: "right" }}>Narudžbi</th>
                  <th style={{ textAlign: "right" }}>Proizvodi</th>
                  <th style={{ textAlign: "right" }}>Realiz.</th>
                  <th style={{ textAlign: "right" }}>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.channel}>
                    <td>
                      <b>{s.channel}</b>
                    </td>
                    <td style={{ textAlign: "right" }}>{s.orders}</td>
                    <td style={{ textAlign: "right" }}>{km(s.revenue)}</td>
                    <td style={{ textAlign: "right" }}>{km(s.realized)}</td>
                    <td style={{ textAlign: "right" }}>{s.deliveryRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="adm-hint" style={{ marginTop: 10 }}>
            „direct&rdquo; znači da nije bilo UTM parametra ni referrera — npr.
            kupac je upisao adresu ručno ili došao iz aplikacije.
          </p>
        </div>
      </div>

      {/* ---------- KAMPANJE ---------- */}
      <div className="adm-card">
        <div className="adm-card-title">
          Facebook / Instagram kampanje — {label}
        </div>
        {campaigns.length === 0 ? (
          <p className="adm-hint">
            Još nema narudžbi sa UTM kampanjom. Kad u oglasu staviš link sa{" "}
            <code>?utm_source=facebook&utm_campaign=naziv&utm_content=oglas1</code>
            , ovdje ćeš vidjeti koliko je koji oglas donio stvarnih narudžbi.
          </p>
        ) : (
          <div className="adm-table-wrap" style={{ border: "none" }}>
            <table className="adm-table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th>Kampanja</th>
                  <th>Oglas / sadržaj</th>
                  <th style={{ textAlign: "right" }}>Narudžbi</th>
                  <th style={{ textAlign: "right" }}>Proizvodi</th>
                  <th style={{ textAlign: "right" }}>Realizovano</th>
                  <th style={{ textAlign: "right" }}>Vraćeno</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={`${c.campaign}|${c.content}`}>
                    <td>{c.campaign}</td>
                    <td>{c.content}</td>
                    <td style={{ textAlign: "right" }}>{c.orders}</td>
                    <td style={{ textAlign: "right" }}>{km(c.revenue)}</td>
                    <td style={{ textAlign: "right" }}>
                      <b>{km(c.realized)}</b>
                    </td>
                    <td style={{ textAlign: "right" }}>{c.returned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- UKUPNO OD POČETKA ---------- */}
      <div className="adm-card">
        <div className="adm-card-title">Ukupno od početka</div>
        <div className="adm-kpi-grid">
          <div className="adm-kpi">
            <span>Narudžbi</span>
            <b>{all.orders}</b>
          </div>
          <div className="adm-kpi">
            <span>Vrijednost proizvoda</span>
            <b>{km(all.revenue)}</b>
            <small>kurir naplatio {km(all.collected)}</small>
          </div>
          <div className="adm-kpi adm-kpi-accent">
            <span>Realizovan promet</span>
            <b>{km(all.realized)}</b>
            <small>samo dostavljene</small>
          </div>
          <div className="adm-kpi">
            <span>Prosječna narudžba</span>
            <b>{km(all.avg)}</b>
          </div>
          <div className="adm-kpi">
            <span>Delivery rate</span>
            <b>{all.deliveryRate}%</b>
          </div>
          <div className="adm-kpi adm-kpi-bad">
            <span>Cancellation rate</span>
            <b>{all.cancellationRate}%</b>
          </div>
        </div>
      </div>

      {/* ---------- NAJNOVIJE NARUDŽBE ---------- */}
      <div className="adm-card">
        <div
          className="adm-card-title"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span>Najnovije narudžbe</span>
          <Link href="/admin/orders" style={{ textTransform: "none" }}>
            vidi sve →
          </Link>
        </div>
        {latest.orders.length === 0 ? (
          <p className="adm-hint">Još nema narudžbi.</p>
        ) : (
          <div className="adm-table-wrap" style={{ border: "none" }}>
            <table className="adm-table" style={{ minWidth: 640 }}>
              <tbody>
                {latest.orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.id}`}>
                        <b>{o.orderNumber}</b>
                      </Link>
                    </td>
                    <td className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                      {datum(o.createdAt)}
                    </td>
                    <td>{o.customerName}</td>
                    <td>{o.city}</td>
                    <td>{o.productName}</td>
                    <td style={{ textAlign: "right" }}>
                      <b>{km(o.totalPrice)}</b>
                    </td>
                    <td>
                      <span className={`adm-st ${STATUS_CLASS[o.status]}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- SHOP (postojeće) ---------- */}
      <div className="adm-card">
        <div className="adm-card-title">Shop</div>
        <div className="adm-kpi-grid">
          <div className="adm-kpi">
            <span>Proizvoda</span>
            <b>{shop.total}</b>
          </div>
          <div className="adm-kpi">
            <span>Objavljeno</span>
            <b>{shop.published}</b>
          </div>
          <div className="adm-kpi">
            <span>Nacrta</span>
            <b>{shop.draft}</b>
          </div>
          <div className="adm-kpi">
            <span>Recenzija</span>
            <b>{shop.reviews}</b>
          </div>
          <div className="adm-kpi">
            <span>Fajlova u mediji</span>
            <b>{shop.media}</b>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <Link className="adm-btn" href="/admin/products">
            PROIZVODI
          </Link>
          <Link className="adm-btn" href="/admin/media">
            MEDIA
          </Link>
          <Link className="adm-btn" href="/admin/reviews">
            RECENZIJE
          </Link>
        </div>
      </div>
    </>
  );
}
