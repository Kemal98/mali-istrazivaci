"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkMessengerRead() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function markRead() {
    setBusy(true);
    await fetch("/api/admin/messenger/read", { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button type="button" className="adm-btn" disabled={busy} onClick={markRead}>
      {busy ? "…" : "OZNAČI SVE PROČITANO"}
    </button>
  );
}
