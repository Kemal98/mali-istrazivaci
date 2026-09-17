import { listAdSpend } from "@/lib/ads/repo";
import { listProducts } from "@/lib/cms/repo";
import { listFilterOptions } from "@/lib/orders/repo";
import AdSpendManager from "@/components/admin/AdSpendManager";

export const dynamic = "force-dynamic";

export default async function TroskoviPage() {
  // Sekvencijalno — isti razlog kao svuda u orders/repo.ts (mali pool).
  const items = await listAdSpend();
  const { products: orderedNames } = await listFilterOptions();
  const cmsProducts = await listProducts();

  // Spoj imena iz stvarnih narudžbi (već poznata, tačan pravopis) i CMS
  // proizvoda (uključi i nove bez ijedne narudžbe još) — bez duplikata.
  const names = new Set<string>(orderedNames);
  for (const p of cmsProducts) if (p.naziv) names.add(p.naziv);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Troškovi reklama</h1>
          <p className="adm-hint">
            Ručni dnevni unos po proizvodu — koristi se za profit na dashboardu.
          </p>
        </div>
      </div>
      <AdSpendManager initial={items} products={[...names].sort()} />
    </>
  );
}
