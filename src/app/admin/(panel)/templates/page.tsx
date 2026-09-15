import { listProducts, listTemplates } from "@/lib/cms/repo";
import TemplatesPanel from "@/components/admin/TemplatesPanel";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Šabloni</h1>
          <p>
            Šablon je gotov raspored blokova. Novi proizvod može startovati iz
            šablona, pa se samo mijenja tekst i slike.
          </p>
        </div>
      </div>

      <TemplatesPanel initial={await listTemplates()} products={await listProducts()} />
    </>
  );
}
