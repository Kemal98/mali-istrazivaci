import { notFound } from "next/navigation";
import CmsProductPage from "@/components/cms/CmsProductPage";
import { getProduct, listReviews } from "@/lib/cms/repo";

// Pregled NACRTA (draft) — vidi se tačno kako će izgledati nakon objave,
// ali javna stranica još prikazuje staru objavljenu verziju.
// ?bare=1 sakriva crnu traku (koristi se u iframe-u unutar editora).
export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bare?: string }>;
}) {
  const { id } = await params;
  const { bare } = await searchParams;
  const p = await getProduct(id);
  if (!p) notFound();

  return (
    <>
      {bare ? null : (
        <div
          style={{
            background: "#111",
            color: "#fff",
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          PREGLED NACRTA — ovo još nije objavljeno ·{" "}
          <a href={`/admin/products/${p.id}`} style={{ color: "#ffb96b" }}>
            nazad u editor
          </a>
        </div>
      )}
      <CmsProductPage
        naziv={p.naziv}
        hero={p.hero}
        sections={p.sections}
        reviews={(await listReviews(p.id)).filter((r) => r.status === "published")}
        cijena={p.cijena}
        staraCijena={p.staraCijena}
        badge={p.badge}
        productId={p.id}
        preview
      />
    </>
  );
}
