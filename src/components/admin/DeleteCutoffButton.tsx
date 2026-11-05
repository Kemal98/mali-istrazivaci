"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCutoffButton({ id, date }: { id: string; date: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    if (
      !window.confirm(
        `Obrisati presjek ${date}? Narudžbe se ne diraju — ovo samo uklanja oznaku, periodi prije/poslije se spajaju nazad u jedan.`
      )
    )
      return;
    setBusy(true);
    await fetch(`/api/admin/presjeci/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      type="button"
      className="adm-btn adm-btn-sm adm-btn-danger"
      onClick={run}
      disabled={busy}
    >
      OBRIŠI
    </button>
  );
}
