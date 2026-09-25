import "server-only";

import { adAmountKm } from "./currency";
import { fetchMetaDailySpend, listMetaCampaigns } from "./meta";
import {
  listCampaignMap,
  upsertCampaignNames,
  upsertMetaAdSpend,
} from "./repo";

/**
 * Učitaj sve kampanje sa Meta naloga (i one bez ijedne potrošnje u
 * zadnje vrijeme) da admin ima šta mapirati PRIJE prvog sync-a — inače
 * bi se nova kampanja pojavila tek kad već ima potrošnju, i taj prvi dan
 * bi otišao pod "Nemapirano".
 */
export async function refreshCampaignList(): Promise<
  { ok: true; count: number } | { ok: false; error: string }
> {
  const res = await listMetaCampaigns();
  if (!res.ok || !res.data) return { ok: false, error: res.error ?? "greška" };
  await upsertCampaignNames(res.data.map((c) => ({ id: c.id, name: c.name })));
  return { ok: true, count: res.data.length };
}

export interface SyncSummary {
  rows: number;
  totalSpend: number;
  unmappedCampaigns: string[];
}

/**
 * Povuci dnevnu potrošnju za [since, until] i upiši u ad_spend, po
 * proizvodu iz mapiranja. Idempotentno — vidi upsertMetaAdSpend.
 */
export async function syncMetaSpend(
  since: string,
  until: string
): Promise<{ ok: true; summary: SyncSummary } | { ok: false; error: string }> {
  const res = await fetchMetaDailySpend(since, until);
  if (!res.ok || !res.data) return { ok: false, error: res.error ?? "greška" };
  const rows = res.data;

  const mapping = await listCampaignMap();
  const byId = new Map(mapping.map((m) => [m.campaignId, m.productName]));

  // Kampanje koje se pojave u insights-u a nisu još u mapiranju (nove,
  // ili je admin preskočio "Učitaj kampanje") — dodaj ih odmah, prazne,
  // da se ne izgube iz vidokruga.
  const seen = new Map<string, string>();
  for (const r of rows) seen.set(r.campaignId, r.campaignName);
  const newOnes = [...seen.entries()].filter(([id]) => !byId.has(id));
  if (newOnes.length) {
    await upsertCampaignNames(newOnes.map(([id, name]) => ({ id, name })));
  }

  let totalSpend = 0;
  const unmapped = new Set<string>();

  for (const r of rows) {
    const mapped = byId.get(r.campaignId);
    const productName = mapped || `Nemapirano: ${r.campaignName}`;
    if (!mapped) unmapped.add(r.campaignName);
    totalSpend += adAmountKm(r.spend, "meta");
    await upsertMetaAdSpend({
      date: r.date,
      campaignId: r.campaignId,
      productName,
      amount: r.spend,
      note: `Meta Ads — ${r.campaignName}`,
    });
  }

  return {
    ok: true,
    summary: {
      rows: rows.length,
      totalSpend: Math.round(totalSpend * 100) / 100,
      unmappedCampaigns: [...unmapped],
    },
  };
}
