import { listProducts, listReviews } from "@/lib/cms/repo";
import ReviewsPanel from "@/components/admin/ReviewsPanel";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const products = (await listProducts()).map((p) => ({ id: p.id, naziv: p.naziv }));

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Recenzije</h1>
          <p>
            Recenzije vezane za proizvode. Prikazuju se u bloku „Recenzije” na
            stranici proizvoda.
          </p>
        </div>
      </div>

      <ReviewsPanel products={products} initial={await listReviews()} />
    </>
  );
}
