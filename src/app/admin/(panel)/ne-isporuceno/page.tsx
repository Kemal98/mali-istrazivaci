import Link from "next/link";
import { listOpenDeliveryIssues } from "@/lib/orders/repo";
import { datum } from "@/lib/cms/datum";
import { STATUS_CLASS, STATUS_ICON, STATUS_LABEL } from "@/lib/orders/types";
import QuickDeliveryIssue from "@/components/admin/QuickDeliveryIssue";

export const dynamic = "force-dynamic";

/**
 * Narudžbe koje imaju bar jedan upis u "Ne isporučeno" logu (kurir zvao,
 * broj pogrešan i sl.) i status im još nije Dostavljena/Vraćena/Otkazana.
 * Čim status postane jedan od ta tri, narudžba sama nestane sa liste —
 * vidi listOpenDeliveryIssues u repo.ts.
 */
export default async function NeIsporucenoPage() {
  const issues = await listOpenDeliveryIssues();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Ne isporučeno</h1>
          <p>
            Narudžbe sa otvorenim problemom oko isporuke (kurir zvao, broj
            pogrešan, ne javlja se…). Narudžba sama nestane sa ove liste čim
            joj promijeniš status na Dostavljena, Vraćena ili Otkazana.
          </p>
        </div>
      </div>

      <QuickDeliveryIssue />

      {issues.length === 0 ? (
        <div className="adm-empty" style={{ background: "#fff", borderRadius: 10 }}>
          Nema otvorenih problema oko isporuke.
        </div>
      ) : (
        <div className="adm-table-wrap adm-order-table-wrap">
          <table className="adm-table adm-table-grid" style={{ minWidth: 860 }}>
            <thead>
              <tr>
                <th>Narudžba</th>
                <th>Kupac</th>
                <th>Grad</th>
                <th>Status</th>
                <th>Zadnji upis</th>
                <th>Kad</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(({ order: o, latestReason, latestNote, latestAt }) => {
                const color = STATUS_CLASS[o.status];
                return (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.id}`}>
                        <b>{o.orderNumber}</b>
                      </Link>
                    </td>
                    <td>
                      {o.customerName || "—"}
                      <div className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                        <a className="adm-tel" href={`tel:${o.phone.replace(/\s/g, "")}`}>
                          {o.phone || "—"}
                        </a>
                      </div>
                    </td>
                    <td>{o.city || "—"}</td>
                    <td>
                      <span className={`adm-st ${color}`}>
                        {STATUS_ICON[o.status]} {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <b>{latestReason}</b>
                      {latestNote ? (
                        <div className="adm-hint">{latestNote}</div>
                      ) : null}
                    </td>
                    <td className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                      {datum(latestAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
