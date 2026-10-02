import { Suspense } from "react";
import Link from "next/link";
import {
  countUnsynced,
  listFilterOptions,
  listManualSales,
  listOrders,
  type OrderSort,
} from "@/lib/orders/repo";
import { listProducts } from "@/lib/cms/repo";
import { isOrderStatus } from "@/lib/orders/types";
import OrderFilters from "@/components/admin/OrderFilters";
import OrdersTable from "@/components/admin/OrdersTable";
import AddOrderButton from "@/components/admin/AddOrderButton";
import QuickSaleManager from "@/components/admin/QuickSaleManager";

export const dynamic = "force-dynamic";

type Params = Promise<{
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  preset?: string;
  product?: string;
  city?: string;
  sort?: string;
  page?: string;
  perPage?: string;
  unsynced?: string;
}>;

const SORTS: OrderSort[] = ["newest", "oldest", "highest", "lowest"];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Params;
}) {
  const sp = await searchParams;

  // Filtriranje, sortiranje i paginacija se rade u SQL-u — u browser
  // nikad ne ide više od jedne stranice narudžbi.
  //
  // Pozivi idu SEKVENCIJALNO, ne kroz Promise.all: pool ima malo
  // konekcija, a uz previše paralelnih upita se dešavalo da jedan ostane
  // trajno zaglavljen u redu (stranica bi visila 30s+). Ukupno je i
  // ovako ~200ms.
  const res = await listOrders({
      search: sp.q,
      status: isOrderStatus(sp.status) ? sp.status : "ALL",
      from: sp.from,
      to: sp.to,
      product: sp.product,
      city: sp.city,
      unsyncedOnly: sp.unsynced === "1",
      sort: SORTS.includes(sp.sort as OrderSort)
        ? (sp.sort as OrderSort)
        : "newest",
    page: Number(sp.page ?? 1),
    perPage: Number(sp.perPage ?? 25),
  });
  const options = await listFilterOptions();
  const unsynced = await countUnsynced();
  const cmsProducts = await listProducts();
  const orderableProducts = cmsProducts
    // Stari ("prod_static_…") proizvodi imaju svoju ručno kodiranu
    // stranicu izvan CMS-a (vidi RattleCheckout.tsx i sl.) i zato nikad
    // ne prolaze kroz "Objavi" — ostaju trajno na statusu "draft" iako
    // su stvarno u prodaji. Zato ih dropdown ovdje mora propustiti i
    // bez statusa "published", inače se ne mogu ručno unijeti narudžbe
    // za njih (npr. zvečke).
    .filter(
      (p) =>
        (p.status === "published" || p.id.startsWith("prod_static_")) &&
        p.cijena !== null
    )
    .map((p) => ({ id: p.id, naziv: p.naziv, cijena: p.cijena }));
  const manualSales = await listManualSales();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Narudžbe</h1>
          <p>
            {res.total} {res.total === 1 ? "narudžba" : "narudžbi"} po ovim
            filterima. Status se mijenja direktno u tabeli.
          </p>
        </div>
        <div className="adm-head-actions">
          <AddOrderButton products={orderableProducts} />
          <Link className="adm-btn" href="/admin/orders/import">
            ⤒ UVEZI IZ GOOGLE SHEETA
          </Link>
        </div>
      </div>

      <QuickSaleManager
        initial={manualSales}
        products={orderableProducts.map((p) => p.naziv)}
      />

      <Suspense fallback={<div className="adm-hint">Učitavam filtere…</div>}>
        <OrderFilters
          products={options.products}
          cities={options.cities}
          unsynced={unsynced}
        />
      </Suspense>

      {/* Bez `key` trika: OrdersTable čita redove direktno iz propsa, pa
          se svaka promjena filtera odmah i tačno odrazi (ranije je
          komponenta držala kopiju u stateu i pokazivala stare rezultate). */}
      <OrdersTable
        initial={res.orders}
        total={res.total}
        page={res.page}
        perPage={res.perPage}
        pages={res.pages}
      />
    </>
  );
}
