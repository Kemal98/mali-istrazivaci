import "server-only";

import { adAmountKm } from "./currency";
import {
  configuredAccounts,
  fetchMetaDailySpend,
  listMetaCampaigns,
  type MetaDaySpend,
} from "./meta";
import {
  listCampaignMap,
  upsertCampaignNames,
  upsertMetaAdSpend,
} from "./repo";

/**
 * Učitaj sve kampanje sa SVIH podešenih Meta naloga (1 ili 2 — vidi
 * configuredAccounts) i one bez ijedne potrošnje u zadnje vrijeme, da
 * admin ima šta mapirati PRIJE prvog sync-a — inače bi se nova kampanja
 * pojavila tek kad već ima potrošnju, i taj prvi dan bi otišao pod
 * "Nemapirano". ID kampanje je jedinstven na cijelom Meta-i, pa se
 * kampanje sa dva naloga nikad ne sudare.
 */
export async function refreshCampaignList(): Promise<
  { ok: true; count: number } | { ok: false; error: string }
> {
  const accounts = configuredAccounts();
  if (!accounts.length) return { ok: false, error: "Meta nalog nije podešen." };

  const all: { id: string; name: string }[] = [];
  const errors: string[] = [];
  for (const creds of accounts) {
    const res = await listMetaCampaigns(creds);
    if (!res.ok || !res.data) {
      errors.push(`Nalog ${creds.slot}: ${res.error ?? "greška"}`);
      continue;
    }
    all.push(...res.data.map((c) => ({ id: c.id, name: c.name })));
  }
  if (!all.length) return { ok: false, error: errors.join(" | ") || "greška" };

  await upsertCampaignNames(all);
  return { ok: true, count: all.length };
}

export interface SyncSummary {
  rows: number;
  totalSpend: number;
  unmappedCampaigns: string[];
}

/**
 * Povuci dnevnu potrošnju za [since, until] sa SVIH podešenih Meta
 * naloga (1 ili 2) i upiši u ad_spend, po proizvodu iz mapiranja.
 * Idempotentno — vidi upsertMetaAdSpend. Ako jedan nalog padne (npr.
 * token istekao) a drugi radi, nastavlja se sa onim što je uspjelo —
 * ne obara cijeli sync zbog jednog naloga.
 */
export async function syncMetaSpend(
  since: string,
  until: string
): Promise<{ ok: true; summary: SyncSummary } | { ok: false; error: string }> {
  const accounts = configuredAccounts();
  if (!accounts.length) return { ok: false, error: "Meta nalog nije podešen." };

  const rows: MetaDaySpend[] = [];
  const errors: string[] = [];
  for (const creds of accounts) {
    const res = await fetchMetaDailySpend(creds, since, until);
    if (!res.ok || !res.data) {
      errors.push(`Nalog ${creds.slot}: ${res.error ?? "greška"}`);
      continue;
    }
    rows.push(...res.data);
  }
  if (!rows.length && errors.length) return { ok: false, error: errors.join(" | ") };

  let mapping = await listCampaignMap();
  let byId = new Map(mapping.map((m) => [m.campaignId, m.productName]));

  // Kampanje koje se pojave u insights-u a nisu još u mapiranju (nove,
  // ili je admin preskočio "Učitaj kampanje") — dodaj ih odmah. Ako neka
  // ima ISTO ime kao već mapirana kampanja (npr. isto ime na drugom ad
  // nalogu), upsertCampaignNames je odmah auto-mapira na isti proizvod —
  // zato se `byId` ponovo učita OVDJE, da se ta auto-mapa iskoristi ODMAH
  // u ovom istom sync-u, ne tek od sljedećeg.
  const seen = new Map<string, string>();
  for (const r of rows) seen.set(r.campaignId, r.campaignName);
  const newOnes = [...seen.entries()].filter(([id]) => !byId.has(id));
  if (newOnes.length) {
    await upsertCampaignNames(newOnes.map(([id, name]) => ({ id, name })));
    mapping = await listCampaignMap();
    byId = new Map(mapping.map((m) => [m.campaignId, m.productName]));
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
