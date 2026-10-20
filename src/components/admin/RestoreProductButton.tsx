"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RestoreProductButton({
  productId,
  naziv,
}: {
  productId: string;
  naziv: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function restore() {
    setBusy(true);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });
    setBusy(false);
    if (res.ok) {
      setDone(true);
      router.refresh();
    }
  }

  if (done) return <span className="adm-hint">✓ Vraćeno</span>;

  return (
    <button
      type="button"
      className="adm-btn adm-btn-sm adm-btn-primary"
      disabled={busy}
      onClick={restore}
      title={`Vrati proizvod „${naziv}"`}
    >
      {busy ? "Vraćam…" : "VRATI"}
    </button>
  );
}
