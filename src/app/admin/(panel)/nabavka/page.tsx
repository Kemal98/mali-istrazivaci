import { redirect } from "next/navigation";

// Stara stranica (flat ledger stock_purchases, bez dokumentacije/FIFO-a) je
// zamijenjena sa /admin/nabavke (partije, status, dokumenti, korekcije).
// Stari bookmark i dalje radi — samo preusmjeri. API ruta /api/admin/
// nabavke (stock_purchases) i dalje postoji netaknuta, samo se više ne
// koristi iz admin UI-a.
export default function NabavkaRedirect() {
  redirect("/admin/nabavke");
}
