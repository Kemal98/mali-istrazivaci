import Link from "next/link";
import {
  listMedia,
  listProducts,
  listReviews,
  listTemplates,
  productStats,
} from "@/lib/cms/repo";
import NewProductButton from "@/components/admin/NewProductButton";
import { datum } from "@/lib/cms/datum";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await productStats();
  const products = (await listProducts()).slice(0, 6);
  const media = await listMedia();
  const reviews = await listReviews();
  const templates = await listTemplates();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p>Pregled shopa i brzi pristup uređivanju.</p>
        </div>
        <div className="adm-head-actions">
          <NewProductButton templates={templates} products={await listProducts()} />
        </div>
      </div>

      <div className="adm-grid-stats">
        <div className="adm-stat">
          <b>{stats.total}</b>
          <span>Proizvoda</span>
        </div>
        <div className="adm-stat">
          <b>{stats.published}</b>
          <span>Objavljeno</span>
        </div>
        <div className="adm-stat">
          <b>{stats.draft}</b>
          <span>Nacrta</span>
        </div>
        <div className="adm-stat">
          <b>{reviews.length}</b>
          <span>Recenzija</span>
        </div>
        <div className="adm-stat">
          <b>{media.length}</b>
          <span>Fajlova u mediji</span>
        </div>
      </div>

      <div className="adm-card" style={{ marginTop: 14 }}>
        <div className="adm-card-title">Zadnje mijenjano</div>
        {products.length === 0 ? (
          <div className="adm-empty">
            Još nema proizvoda. Kliknite <b>+ NOVI PROIZVOD</b> da napravite prvi.
          </div>
        ) : (
          <div className="adm-table-wrap" style={{ border: "none" }}>
            <table className="adm-table" style={{ minWidth: 560 }}>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ width: 66 }}>
                      {p.hero?.slika ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img className="adm-thumb" src={p.hero.slika} alt="" />
                      ) : (
                        <div className="adm-thumb-empty">nema</div>
                      )}
                    </td>
                    <td>
                      <b>{p.naziv}</b>
                      <div className="adm-hint">/{p.slug}</div>
                    </td>
                    <td>
                      <span
                        className={`adm-badge ${
                          p.status === "published"
                            ? "adm-badge-pub"
                            : "adm-badge-draft"
                        }`}
                      >
                        {p.status === "published" ? "Objavljeno" : "Nacrt"}
                      </span>
                    </td>
                    <td className="adm-hint">{datum(p.updatedAt)}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        className="adm-btn adm-btn-sm"
                        href={`/admin/products/${p.id}`}
                      >
                        UREDI
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
