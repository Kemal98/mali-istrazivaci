import { notFound } from "next/navigation";
import ProductEditor from "@/components/admin/ProductEditor";
import { getProduct, getSettings, listProducts, listReviews } from "@/lib/cms/repo";

export const dynamic = "force-dynamic";

export default async function ProductEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <ProductEditor
      product={product}
      reviews={await listReviews(product.id)}
      products={(await listProducts()).map((p) => ({ id: p.id, naziv: p.naziv }))}
      settings={await getSettings()}
    />
  );
}
