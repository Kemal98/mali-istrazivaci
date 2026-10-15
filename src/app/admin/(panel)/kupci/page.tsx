import { listCustomers, type CustomerSort } from "@/lib/orders/repo";
import CustomersTable from "@/components/admin/CustomersTable";

export const dynamic = "force-dynamic";

type Params = Promise<{
  q?: string;
  sort?: string;
  page?: string;
  perPage?: string;
}>;

const SORTS: CustomerSort[] = ["spent", "recent", "orders"];

/**
 * Jedan red po kupcu (grupisano po broju telefona — vidi listCustomers),
 * umjesto da se ista osoba traži ručno kroz narudžbe. "Potrošeno" broji
 * samo DOSTAVLJENE narudžbe (pouzeće se naplati tek na isporuci).
 */
export default async function KupciPage({
  searchParams,
}: {
  searchParams: Params;
}) {
  const sp = await searchParams;

  const res = await listCustomers({
    search: sp.q,
    sort: SORTS.includes(sp.sort as CustomerSort)
      ? (sp.sort as CustomerSort)
      : "spent",
    page: Number(sp.page ?? 1),
    perPage: Number(sp.perPage ?? 25),
  });

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Kupci</h1>
          <p>
            {res.total} {res.total === 1 ? "kupac" : "kupaca"} — grupisano po
            broju telefona iz svih narudžbi.
          </p>
        </div>
      </div>

      <CustomersTable
        initial={res.customers}
        total={res.total}
        page={res.page}
        perPage={res.perPage}
        pages={res.pages}
      />
    </>
  );
}
