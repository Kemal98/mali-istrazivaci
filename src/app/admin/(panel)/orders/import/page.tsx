import Link from "next/link";
import OrderImport from "@/components/admin/OrderImport";

export const dynamic = "force-dynamic";

export default function OrderImportPage() {
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Uvoz starih narudžbi</h1>
          <p>
            Jednokratno prebacivanje narudžbi iz Google Sheeta u bazu, da i
            one ulaze u statistiku.
          </p>
        </div>
        <div className="adm-head-actions">
          <Link className="adm-btn" href="/admin/orders">
            ← NAZAD NA NARUDŽBE
          </Link>
        </div>
      </div>
      <OrderImport />
    </>
  );
}
