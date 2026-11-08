import { listBatches, stockSummaryByProduct } from "@/lib/nabavke/repo";
import { listProducts } from "@/lib/cms/repo";
import NabavkeManager from "@/components/admin/NabavkeManager";
import NabavkeDashboard from "@/components/admin/NabavkeDashboard";

export const dynamic = "force-dynamic";

export default async function NabavkePage() {
  const [items, productsRaw, summary] = await Promise.all([
    listBatches(),
    listProducts(),
    stockSummaryByProduct(),
  ]);
  const products = productsRaw
    .map((p) => ({ id: p.id, naziv: p.naziv.trim() }))
    .filter((p) => p.naziv)
    .sort((a, b) => a.naziv.localeCompare(b.naziv));

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Zalihe i nabavke</h1>
          <p className="adm-hint">
            Svaka nabavka je posebna partija sa svojom dokumentacijom i
            statusom. Roba bez dokumenata ne ulazi u raspoloživo za
            prodaju — ovo je interna evidencija, ne zamjena za knjigovodstvo.
          </p>
        </div>
        <div className="adm-head-actions">
          <a href="/api/admin/nabavke-partije/export" className="adm-btn">
            IZVEZI CSV
          </a>
        </div>
      </div>

      <NabavkeDashboard items={summary} />

      <NabavkeManager initialBatches={items} products={products} />
    </>
  );
}
