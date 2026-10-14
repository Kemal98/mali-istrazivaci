import Link from "next/link";
import { listDeletedOrders } from "@/lib/orders/repo";
import { datum } from "@/lib/cms/datum";
import RestoreOrderButton from "@/components/admin/RestoreOrderButton";

export const dynamic = "force-dynamic";

/**
 * Sigurnosna mreža za greškom obrisane narudžbe (vidi deleteOrder u
 * repo.ts — soft delete, podaci ostaju u bazi). Admin ih odavde može
 * vratiti jednim klikom umjesto direktno u bazi.
 */
export default async function ObrisaneNarudzbePage() {
  const orders = await listDeletedOrders();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Obrisane narudžbe</h1>
          <p>
            Narudžbe obrisane iz liste (greškom ili namjerno) — podaci su i
            dalje sačuvani, možeš ih vratiti.
          </p>
        </div>
        <div className="adm-head-actions">
          <Link className="adm-btn" href="/admin/orders">
            ← NAZAD NA NARUDŽBE
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="adm-empty" style={{ background: "#fff", borderRadius: 10 }}>
          Nema obrisanih narudžbi.
        </div>
      ) : (
        <div className="adm-table-wrap adm-order-table-wrap">
          <table className="adm-table adm-table-grid" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th>Narudžba</th>
                <th>Kupac</th>
                <th>Proizvod</th>
                <th>Vrijednost</th>
                <th>Obrisano</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <b>{o.orderNumber}</b>
                  </td>
                  <td>
                    {o.customerName || "—"}
                    <div className="adm-hint">{o.phone || "—"}</div>
                  </td>
                  <td>
                    {o.productName}
                    {o.quantity > 1 ? ` × ${o.quantity}` : ""}
                  </td>
                  <td>{o.totalPrice} KM</td>
                  <td className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                    {datum(o.updatedAt)}
                  </td>
                  <td>
                    <RestoreOrderButton orderId={o.id} orderNumber={o.orderNumber} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
