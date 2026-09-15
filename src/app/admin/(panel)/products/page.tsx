import { listProducts, listTemplates } from "@/lib/cms/repo";
import ProductsTable from "@/components/admin/ProductsTable";
import NewProductButton from "@/components/admin/NewProductButton";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listProducts();
  const templates = await listTemplates();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Proizvodi</h1>
          <p>Sve proizvod-stranice shopa. Nacrti se javno ne vide.</p>
        </div>
        <div className="adm-head-actions">
          <NewProductButton templates={templates} products={products} />
        </div>
      </div>

      <ProductsTable initial={products} />
    </>
  );
}
