import "server-only";

/**
 * Meta Marketing API (Graph API) — čitanje POTROŠNJE sa vlastitog ad
 * naloga. Samo `ads_read`, ništa se ne piše nazad u Meta.
 *
 * Ne treba App Review: čita se samo nalog kojim vlasnik administrira
 * (System User token iz Business Managera), ne tuđi podaci — to je
 * dozvoljeno bez pregleda Facebooka, provjereno prije implementacije.
 *
 * server-only: token se ovdje čita iz env varijable i nikad ne smije
 * doći do klijentskog bundla.
 */

const API_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;

function accountId(): string | null {
  const raw = process.env.META_AD_ACCOUNT_ID;
  if (!raw) return null;
  return raw.startsWith("act_") ? raw : `act_${raw}`;
}

function token(): string | null {
  return process.env.META_ACCESS_TOKEN || null;
}

export interface MetaResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** Da li su oba env-a postavljena — UI koristi ovo da zna prikazati li dugme. */
export function metaConfigured(): boolean {
  return Boolean(token() && accountId());
}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<MetaResult<T>> {
  const t = token();
  const acc = accountId();
  if (!t || !acc) {
    return { ok: false, error: "META_ACCESS_TOKEN / META_AD_ACCOUNT_ID nisu postavljeni." };
  }

  const url = new URL(`${BASE}/${path.replace("{account}", acc)}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("access_token", t);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url.toString(), { signal: ctrl.signal });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      const msg = json?.error?.message || `HTTP ${res.status}`;
      return { ok: false, error: msg };
    }
    return { ok: true, data: json as T };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: /abort/i.test(msg) ? "Meta API ne odgovara (timeout)." : msg };
  } finally {
    clearTimeout(timer);
  }
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
}

/** Sve kampanje na nalogu (aktivne i pauzirane — mapiranje treba obje). */
export async function listMetaCampaigns(): Promise<MetaResult<MetaCampaign[]>> {
  const res = await graphGet<{ data: MetaCampaign[] }>("{account}/campaigns", {
    fields: "id,name,status",
    limit: "200",
  });
  if (!res.ok || !res.data) return { ok: false, error: res.error };
  return { ok: true, data: res.data.data };
}

export interface MetaDaySpend {
  campaignId: string;
  campaignName: string;
  date: string; // YYYY-MM-DD, kako ga Meta vrati (nalog ima svoju vremensku zonu podešenu u Ads Manageru)
  spend: number;
}

/**
 * Dnevna potrošnja po kampanji za period [since, until] (uključivo,
 * YYYY-MM-DD). time_increment=1 razbija period na pojedinačne dane, pa
 * jedan poziv pokrije i "povuci zadnjih 7 dana" i "samo juče".
 */
export async function fetchMetaDailySpend(
  since: string,
  until: string
): Promise<MetaResult<MetaDaySpend[]>> {
  const res = await graphGet<{
    data: { campaign_id: string; campaign_name: string; spend: string; date_start: string }[];
  }>("{account}/insights", {
    level: "campaign",
    fields: "campaign_id,campaign_name,spend",
    time_increment: "1",
    time_range: JSON.stringify({ since, until }),
    limit: "500",
  });
  if (!res.ok || !res.data) return { ok: false, error: res.error };

  return {
    ok: true,
    data: res.data.data.map((r) => ({
      campaignId: r.campaign_id,
      campaignName: r.campaign_name,
      date: r.date_start,
      spend: Math.round(Number(r.spend || 0) * 100) / 100,
    })),
  };
}
