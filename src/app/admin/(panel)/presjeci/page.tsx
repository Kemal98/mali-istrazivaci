import { listCutoffs } from "@/lib/orders/cutoffs";
import { profitAsIfSold } from "@/lib/orders/profit";
import { sarajevoDateOnly, sarajevoStartOfDay } from "@/lib/cms/datum";
import CutoffManager from "@/components/admin/CutoffManager";
import DeleteCutoffButton from "@/components/admin/DeleteCutoffButton";

export const dynamic = "force-dynamic";

const km = (v: number) => `${v.toLocaleString("bs-BA")} KM`;
const bs = (iso: string) => iso.split("-").reverse().join(".") + ".";

/** "2026-11-05" + (-1) -> "2026-11-04". Čisto računanje kalendara, bez vremenske zone. */
function shiftDateOnly(dateOnly: string, days: number): string {
  const [y, m, d] = dateOnly.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Period [fromDateOnly, toDateOnly] (oba uključena, Sarajevo dani) kao Period za profitAsIfSold. */
function periodFor(fromDateOnly: string, toDateOnly: string) {
  const from = sarajevoStartOfDay(new Date(`${fromDateOnly}T12:00:00Z`)).toISOString();
  const toStart = sarajevoStartOfDay(new Date(`${toDateOnly}T12:00:00Z`)).getTime();
  const to = new Date(toStart + 86_400_000 - 1).toISOString();
  return { from, to };
}

export default async function PresjeciPage() {
  const cutoffs = await listCutoffs(); // najnoviji prvi
  const today = sarajevoDateOnly();
  const asc = [...cutoffs].sort((a, b) => a.date.localeCompare(b.date));

  // Za svaki presjek: zarada u periodu KOJI JE TAJ PRESJEK ZATVORIO (od
  // prethodnog presjeka, ili "oduvijek", do dan prije ovog presjeka).
  const zatvoreno = await Promise.all(
    asc.map(async (c, i) => {
      const fromDateOnly = i === 0 ? "2000-01-01" : asc[i - 1].date;
      const toDateOnly = shiftDateOnly(c.date, -1);
      if (fromDateOnly > toDateOnly) return { cutoff: c, fromDateOnly, toDateOnly, prazno: true, summary: null };
      const { from, to } = periodFor(fromDateOnly, toDateOnly);
      const summary = await profitAsIfSold({ from, to }, fromDateOnly, toDateOnly);
      return { cutoff: c, fromDateOnly, toDateOnly, prazno: false, summary };
    })
  );
  zatvoreno.reverse(); // nazad u "najnoviji prvi"

  // Trenutni (otvoreni) period: od zadnjeg presjeka do danas. Bez presjeka: sve vrijeme.
  const currentFromDateOnly = asc.length ? asc[asc.length - 1].date : "2000-01-01";
  const { from: curFrom, to: curTo } = periodFor(currentFromDateOnly, today);
  const current = await profitAsIfSold({ from: curFrom, to: curTo }, currentFromDateOnly, today);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Presjeci zarade</h1>
          <p className="adm-hint">
            Presjek NE briše ništa — sve narudžbe i kupci ostaju. On samo
            označava dan od kojeg Dashboard zadano računa zaradu/statistiku
            &bdquo;ispočetka&rdquo; (stariji period je i dalje dostupan preko
            filtera na Dashboardu — 90 dana, prošli mjesec, datum od-do).
          </p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-title">
          Trenutni period{" "}
          <span className="adm-hint" style={{ fontWeight: 500 }}>
            — {asc.length ? `od presjeka ${bs(currentFromDateOnly)}` : "oduvijek (još nema presjeka)"} do danas
          </span>
        </div>
        <div className="adm-kpi-grid">
          <div className="adm-kpi">
            <span>Narudžbi</span>
            <b>{current.orders}</b>
          </div>
          <div className="adm-kpi">
            <span>Prihod</span>
            <b>{km(current.revenue)}</b>
          </div>
          <div className="adm-kpi">
            <span>Nabavna cijena</span>
            <b>−{km(current.cost)}</b>
          </div>
          <div className="adm-kpi">
            <span>Reklame</span>
            <b>−{km(current.adSpend)}</b>
          </div>
          <div className="adm-kpi">
            <span>ZARADA</span>
            <b style={{ color: current.profit >= 0 ? "#148a4b" : "#b3261e" }}>
              {km(current.profit)}
            </b>
            <small>
              {current.revenue > 0
                ? `marža ${Math.round((current.profit / current.revenue) * 1000) / 10}%`
                : ""}
            </small>
          </div>
        </div>
      </div>

      <CutoffManager today={today} />

      {zatvoreno.length > 0 ? (
        <div className="adm-card">
          <div className="adm-card-title">Zarada zatvorena svakim presjekom</div>
          <div className="adm-table-wrap" style={{ border: "none" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Presjek</th>
                  <th>Period koji zatvara</th>
                  <th>Napomena</th>
                  <th style={{ textAlign: "right" }}>Narudžbi</th>
                  <th style={{ textAlign: "right" }}>Prihod</th>
                  <th style={{ textAlign: "right" }}>ZARADA</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {zatvoreno.map(({ cutoff, fromDateOnly, toDateOnly, prazno, summary }) => (
                  <tr key={cutoff.id}>
                    <td>
                      <b>{bs(cutoff.date)}</b>
                    </td>
                    <td className="adm-hint">
                      {prazno ? "—" : `${bs(fromDateOnly)} – ${bs(toDateOnly)}`}
                    </td>
                    <td className="adm-hint">{cutoff.note || "—"}</td>
                    <td style={{ textAlign: "right" }}>{summary?.orders ?? 0}</td>
                    <td style={{ textAlign: "right" }}>{km(summary?.revenue ?? 0)}</td>
                    <td style={{ textAlign: "right" }}>
                      <b style={{ color: (summary?.profit ?? 0) >= 0 ? "#148a4b" : "#b3261e" }}>
                        {km(summary?.profit ?? 0)}
                      </b>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <DeleteCutoffButton id={cutoff.id} date={bs(cutoff.date)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}
