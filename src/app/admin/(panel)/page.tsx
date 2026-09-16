import { redirect } from "next/navigation";

// /admin je sad samo ulaz — pravi dashboard je /admin/dashboard, kako
// stoji i u navigaciji (Dashboard / Narudžbe / Proizvodi).
export default function AdminIndex() {
  redirect("/admin/dashboard");
}
