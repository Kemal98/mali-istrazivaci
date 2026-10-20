import Link from "next/link";
import { listDeletedProducts } from "@/lib/cms/repo";
import { datum } from "@/lib/cms/datum";
import RestoreProductButton from "@/components/admin/RestoreProductButton";

export const dynamic = "force-dynamic";

/**
 * Sigurnosna mreža za greškom obrisane proizvode (vidi softDeleteProduct
 * u repo.ts — soft delete, podaci ostaju u bazi). Admin ih odavde može
 * vratiti jednim klikom umjesto direktno u bazi.
 */
export default async function ObrisaniProizvodiPage() {
  const products = await listDeletedProducts();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Obrisani proizvodi</h1>
          <p>
            Proizvodi obrisani iz liste (greškom ili namjerno) — podaci su i
            dalje sačuvani, možeš ih vratiti.
          </p>
        </div>
        <div className="adm-head-actions">
          <Link className="adm-btn" href="/admin/products">
            ← NAZAD NA PROIZVODE
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="adm-empty" style={{ background: "#fff", borderRadius: 10 }}>
          Nema obrisanih proizvoda.
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table" style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th>Naziv</th>
                <th>URL</th>
                <th>Obrisano</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.naziv || "(bez naziva)"}</b>
                  </td>
                  <td className="adm-hint">/{p.slug}</td>
                  <td className="adm-hint" style={{ whiteSpace: "nowrap" }}>
                    {datum(p.updatedAt)}
                  </td>
                  <td>
                    <RestoreProductButton productId={p.id} naziv={p.naziv} />
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
