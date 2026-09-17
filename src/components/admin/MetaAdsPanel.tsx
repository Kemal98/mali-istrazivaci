"use client";

import { useState } from "react";
import type { CampaignMapping } from "@/lib/ads/types";

export default function MetaAdsPanel({
  configured,
  initial,
  products,
}: {
  configured: boolean;
  initial: CampaignMapping[];
  products: string[];
}) {
  const [campaigns, setCampaigns] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function refresh() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/adspend/meta/campaigns", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.campaigns) {
      setCampaigns(data.campaigns);
      setMsg(`Učitano ${data.count ?? data.campaigns.length} kampanja.`);
    } else {
      setMsg(data?.error || "Greška pri učitavanju kampanja.");
    }
  }

  async function setProduct(campaignId: string, productName: string) {
    setCampaigns((cs) =>
      cs.map((c) => (c.campaignId === campaignId ? { ...c, productName } : c))
    );
    await fetch(`/api/admin/adspend/meta/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName }),
    });
  }

  async function sync() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/adspend/meta/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: 7 }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.ok) {
      const un = data.unmappedCampaigns?.length
        ? ` ⚠️ Nemapirano: ${data.unmappedCampaigns.join(", ")}.`
        : "";
      setMsg(
        `Povučeno ${data.rows} redova (${data.since} – ${data.until}), ukupno ${data.totalSpend} KM.${un}`
      );
      // ponovo učitaj listu unosa ispod bi trebalo osvježiti stranicu — jednostavnije: reload
      window.location.reload();
    } else {
      setMsg(data?.error || "Sync nije uspio.");
    }
  }

  if (!configured) {
    return (
      <div className="adm-card">
        <div className="adm-card-title">Meta Ads — automatska potrošnja</div>
        <p className="adm-hint">
          Nije povezano. Treba <code>META_ACCESS_TOKEN</code> i{" "}
          <code>META_AD_ACCOUNT_ID</code> u environment varijablama — dok se ne
          doda, ovaj dio ostaje sakriven, ručni unos gore radi normalno.
        </p>
      </div>
    );
  }

  return (
    <div className="adm-card">
      <div className="adm-card-title">Meta Ads — automatska potrošnja</div>
      <div className="adm-row" style={{ marginBottom: 12 }}>
        <button type="button" className="adm-btn adm-btn-sm" disabled={busy} onClick={refresh}>
          ↻ UČITAJ KAMPANJE
        </button>
        <button
          type="button"
          className="adm-btn adm-btn-primary adm-btn-sm"
          disabled={busy}
          onClick={sync}
        >
          POVUCI POTROŠNJU (zadnjih 7 dana)
        </button>
      </div>
      {msg ? <p className="adm-hint">{msg}</p> : null}

      {campaigns.length === 0 ? (
        <p className="adm-hint">
          Još nema učitanih kampanja — klikni "Učitaj kampanje".
        </p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Kampanja</th>
              <th>Proizvod</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.campaignId}>
                <td>{c.campaignName}</td>
                <td>
                  <select
                    value={c.productName}
                    onChange={(e) => setProduct(c.campaignId, e.target.value)}
                  >
                    <option value="">— nemapirano —</option>
                    {products.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="adm-hint" style={{ marginTop: 10 }}>
        Nemapirane kampanje se ipak upisuju (kao "Nemapirano: ime") da se novac
        ne izgubi — mapiraj ih pa klikni "Povuci potrošnju" ponovo da se
        isprave.
      </p>
    </div>
  );
}
