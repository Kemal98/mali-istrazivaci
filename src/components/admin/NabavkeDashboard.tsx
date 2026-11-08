import type { StockSummary } from "@/lib/nabavke/types";

export default function NabavkeDashboard({ items }: { items: StockSummary[] }) {
  if (items.length === 0) return null;

  const totals = items.reduce(
    (acc, r) => ({
      fizicki: acc.fizicki + r.fizicki,
      dokumentovano: acc.dokumentovano + r.dokumentovano,
      cekaDokumentaciju: acc.cekaDokumentaciju + r.cekaDokumentaciju,
      rezervisano: acc.rezervisano + r.rezervisano,
      raspolozivo: acc.raspolozivo + r.raspolozivo,
    }),
    { fizicki: 0, dokumentovano: 0, cekaDokumentaciju: 0, rezervisano: 0, raspolozivo: 0 }
  );

  return (
    <div className="adm-card">
      <div className="adm-card-title">Stanje zaliha — svi proizvodi</div>
      <div className="adm-kpi-grid">
        <div className="adm-kpi">
          <span>Fizički na stanju</span>
          <b>{totals.fizicki}</b>
        </div>
        <div className="adm-kpi">
          <span>Dokumentovano</span>
          <b>{totals.dokumentovano}</b>
        </div>
        <div className="adm-kpi adm-kpi-warn">
          <span>Čeka dokumentaciju</span>
          <b>{totals.cekaDokumentaciju}</b>
        </div>
        <div className="adm-kpi">
          <span>Rezervisano (informativno)</span>
          <b>{totals.rezervisano}</b>
        </div>
        <div className="adm-kpi adm-kpi-accent">
          <span>Raspoloživo za prodaju</span>
          <b>{totals.raspolozivo}</b>
        </div>
      </div>

      <div className="adm-table-wrap" style={{ border: "none", marginTop: 14 }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Proizvod</th>
              <th style={{ textAlign: "right" }}>Fizički</th>
              <th style={{ textAlign: "right" }}>Dokumentovano</th>
              <th style={{ textAlign: "right" }}>Čeka dokumentaciju</th>
              <th style={{ textAlign: "right" }}>Rezervisano</th>
              <th style={{ textAlign: "right" }}>Raspoloživo</th>
            </tr>
          </thead>
          <tbody>
            {items
              .slice()
              .sort((a, b) => a.productName.localeCompare(b.productName))
              .map((r) => (
                <tr key={r.productId}>
                  <td>{r.productName}</td>
                  <td style={{ textAlign: "right" }}>{r.fizicki}</td>
                  <td style={{ textAlign: "right" }}>{r.dokumentovano}</td>
                  <td style={{ textAlign: "right" }}>
                    {r.cekaDokumentaciju > 0 ? (
                      <b style={{ color: "#b7791f" }}>{r.cekaDokumentaciju}</b>
                    ) : (
                      0
                    )}
                  </td>
                  <td style={{ textAlign: "right" }} className="adm-hint">
                    {r.rezervisano}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <b style={{ color: r.raspolozivo <= 0 ? "#b3261e" : undefined }}>
                      {r.raspolozivo}
                    </b>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
