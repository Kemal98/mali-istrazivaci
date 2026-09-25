import { listPurchases } from "@/lib/ads/repo";
import { listProducts } from "@/lib/cms/repo";
import { profitAsIfSold } from "@/lib/orders/profit";
import NabavkaManager from "@/components/admin/NabavkaManager";

export const dynamic = "force-dynamic";

export default async function NabavkaPage() {
  const items = await listPurchases();
  const cms = await listProducts();
  const all = await profitAsIfSold({}, "2000-01-01", "2100-01-01");
  const stock = all.rows.filter((r) => r.purchasedQty > 0);

  const products = [...new Set(cms.map((p) => p.naziv.trim()).filter(Boolean))].sort();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Nabavka robe</h1>
          <p className="adm-hint">
            Upiši koliko si komada kupio i koliko si ukupno platio. Iz toga se
            računa stvarna nabavna cijena po komadu i stanje zaliha
            (kupljeno − prodano; računaju se sve narudžbe).
          </p>
        </div>
      </div>

      {stock.length > 0 ? (
        <div className="adm-card">
          <div className="adm-card-title">Stanje zaliha</div>
          <div className="adm-table-wrap" style={{ border: "none" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Proizvod</th>
                  <th style={{ textAlign: "right" }}>Kupljeno</th>
                  <th style={{ textAlign: "right" }}>Prodano</th>
                  <th style={{ textAlign: "right" }}>Na stanju</th>
                  <th style={{ textAlign: "right" }}>Uloženo</th>
                  <th style={{ textAlign: "right" }}>Po komadu</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((r) => (
                  <tr key={r.productName}>
                    <td>{r.productName}</td>
                    <td style={{ textAlign: "right" }}>{r.purchasedQty}</td>
                    <td style={{ textAlign: "right" }}>
                      {r.purchasedQty - (r.stock ?? 0)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <b style={{ color: (r.stock ?? 0) < 0 ? "#b3261e" : undefined }}>
                        {r.stock}
                      </b>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {r.purchasedCost.toLocaleString("bs-BA")} KM
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {(r.purchasedCost / r.purchasedQty).toFixed(2)} KM
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <NabavkaManager initial={items} products={products} />
    </>
  );
}
