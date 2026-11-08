"use client";

import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { NABAVKA_STATUSES, STATUS_LABEL, type NabavkaStatus } from "@/lib/nabavke/types";

/**
 * Promjena statusa NIKAD nije običan <select> koji odmah okine zahtjev —
 * namjerno je dvokorakna (izbor + potvrda kroz ConfirmModal), da
 * nedokumentovana roba ne postane "spremno za prodaju" slučajnim klikom.
 */
export default function NabavkeStatusControl({
  batchId,
  current,
  onChanged,
}: {
  batchId: string;
  current: NabavkaStatus;
  onChanged: (newStatus: NabavkaStatus) => void;
}) {
  const [pending, setPending] = useState<NabavkaStatus | null>(null);
  const [napomena, setNapomena] = useState("");
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    const res = await fetch(`/api/admin/nabavke-partije/${batchId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: pending, napomena }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.item) {
      onChanged(pending);
      setPending(null);
      setNapomena("");
    }
  }

  return (
    <>
      <select
        className="adm-st-select"
        value={current}
        onChange={(e) => setPending(e.target.value as NabavkaStatus)}
      >
        {NABAVKA_STATUSES.map((st) => (
          <option key={st} value={st}>
            {STATUS_LABEL[st]}
          </option>
        ))}
      </select>

      {pending && pending !== current ? (
        <ConfirmModal
          title="Promjena statusa nabavke"
          text={
            <>
              <p style={{ margin: "0 0 8px" }}>
                {STATUS_LABEL[current]} → <b>{STATUS_LABEL[pending]}</b>
              </p>
              {pending === "spremno" ? (
                <p style={{ margin: "0 0 8px", color: "var(--red)" }}>
                  Ova partija postaje raspoloživa za prodaju. Provjeri da je
                  dokumentacija zaista uredna prije potvrde.
                </p>
              ) : null}
              <div className="adm-field">
                <label>Napomena (opciono)</label>
                <input
                  type="text"
                  value={napomena}
                  onChange={(e) => setNapomena(e.target.value)}
                  placeholder="npr. provjereno uz fakturu br. ..."
                />
              </div>
            </>
          }
          confirmLabel="POTVRDI PROMJENU"
          danger={pending === "neaktivno"}
          busy={busy}
          onConfirm={confirm}
          onCancel={() => {
            setPending(null);
            setNapomena("");
          }}
        />
      ) : null}
    </>
  );
}
