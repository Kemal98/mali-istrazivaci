import { Suspense } from "react";
import {
  countUnsynced,
  listFilterOptions,
  listOrders,
  type OrderSort,
} from "@/lib/orders/repo";
import { isOrderStatus } from "@/lib/orders/types";
import OrderFilters from "@/components/admin/OrderFilters";
import OrdersTable from "@/components/admin/OrdersTable";

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
      </div>

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
