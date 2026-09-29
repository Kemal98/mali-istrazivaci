import type { CampaignAnalysis } from "@/lib/ads/analysis";

const km = (v: number) => `${v.toLocaleString("bs-BA")} KM`;

const VERDICT_COLOR: Record<string, string> = {
  stop: "#b3261e",
  loss: "#b7791f",
  watch: "#555",
  good: "#148a4b",
};

/** Analitika po kampanji: koliko troši, da li se isplati, šta gasiti. */
export default function CampaignAnalysisCard({ analysis }: { analysis: CampaignAnalysis }) {
  return (
    <div className="adm-card">
      <div className="adm-card-title">📊 Analitika po kampanji</div>
      <p className="adm-hint" style={{ marginBottom: 14 }}>
        Prihod/profit/ROAS su na nivou <b>proizvoda</b> (ne pojedinačne
        kampanje) — narudžba ne nosi podatak koja je kampanja tačno dovela
        tu prodaju, pa se sve kampanje na isti proizvod gledaju zajedno.
      </p>

      <div className="adm-kpi-grid" style={{ marginBottom: 16 }}>
        <div className="adm-kpi">
          <span>Potrošeno — 7 dana</span>
          <b>{km(analysis.totalSpend7d)}</b>
        </div>
        <div className="adm-kpi">
          <span>Potrošeno — 30 dana</span>
          <b>{km(analysis.totalSpend30d)}</b>
        </div>
        <div className="adm-kpi">
          <span>Potrošeno — sve vrijeme (Meta)</span>
          <b>{km(analysis.totalSpendAll)}</b>
        </div>
        {analysis.manualSpendAll > 0 ? (
          <div className="adm-kpi">
            <span>Ručni unosi — sve vrijeme</span>
            <b>{km(analysis.manualSpendAll)}</b>
          </div>
        ) : null}
      </div>

      {analysis.rows.length === 0 ? (
        <p className="adm-hint">Nema još povučene potrošnje iz Mete.</p>
      ) : (
        <div className="adm-table-wrap" style={{ border: "none" }}>
          <table className="adm-table" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th>Kampanja</th>
                <th>Proizvod</th>
                <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>7 dana</th>
                <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>30 dana</th>
                <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Sve vrijeme</th>
                <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>ROAS</th>
                <th>Šta raditi</th>
              </tr>
            </thead>
            <tbody>
              {analysis.rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.campaignName}</td>
                  <td>{r.productName}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{km(r.spend7d)}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{km(r.spend30d)}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{km(r.spendAll)}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                    {r.roas !== null ? `${r.roas}×` : "—"}
                  </td>
                  <td style={{ color: VERDICT_COLOR[r.verdict], fontWeight: 700, fontSize: ".88rem" }}>
                    {r.verdictLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="adm-hint" style={{ marginTop: 10 }}>
        <b>ROAS</b> = prihod proizvoda ÷ potrošeno na reklame (sve vrijeme). 3× i
        više je dobro, ispod 1,5× je slabo. <b>❌ Gasi</b> = trošilo zadnja 1–2
        dana, nema nijedne prodaje u tom periodu.
      </p>
    </div>
  );
}
