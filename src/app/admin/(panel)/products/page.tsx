import { listProducts, listTemplates } from "@/lib/cms/repo";
import { profitAsIfSold } from "@/lib/orders/profit";
import ProductsTable from "@/components/admin/ProductsTable";
import NewProductButton from "@/components/admin/NewProductButton";
import ImportProductButton from "@/components/admin/ImportProductButton";

export const dynamic = "force-dynamic";

const km = (v: number) => `${v.toLocaleString("bs-BA")} KM`;

export default async function ProductsPage() {
  const products = await listProducts();
  const templates = await listTemplates();
  // Sve vrijeme (bez perioda) — brz pregled po proizvodu, detaljnije
  // razrade po periodu su na Dashboardu.
  const profit = await profitAsIfSold({}, "2000-01-01", "2100-01-01");

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Proizvodi</h1>
          <p>Sve proizvod-stranice shopa. Nacrti se javno ne vide.</p>
        </div>
        <div className="adm-head-actions">
          <ImportProductButton />
          <NewProductButton templates={templates} products={products} />
        </div>
      </div>

      {profit.rows.length > 0 ? (
        <div className="adm-card">
          <div className="adm-card-title">Po proizvodu — sve vrijeme</div>
          <p className="adm-hint" style={{ marginBottom: 10 }}>
            Kao da je sve prodano (sve narudžbe, bez obzira na status). Za
            period i detalje idi na{" "}
            <a href="/admin/dashboard">Dashboard</a>.
          </p>
          <div className="adm-table-wrap" style={{ border: "none" }}>
            <table className="adm-table" style={{ minWidth: 620 }}>
              <thead>
                <tr>
                  <th>Proizvod</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Narudžbi</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Reklame</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Nabavna</th>
                  <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>Zarada</th>
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
                    <td style={{ textAlign: "right" }}>{p.orders || "—"}</td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                      {p.adSpend > 0 ? `−${km(p.adSpend)}` : "—"}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }} className="adm-hint">
                      {p.cost > 0 ? `−${km(p.cost)}` : "—"}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <b style={{ color: p.profit >= 0 ? "#148a4b" : "#b3261e" }}>
                        {km(p.profit)}
                      </b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <ProductsTable initial={products} />
    </>
  );
}
