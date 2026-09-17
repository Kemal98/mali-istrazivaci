import { NextResponse } from "next/server";
import { sarajevoDateOnly } from "@/lib/cms/datum";
import { syncMetaSpend } from "@/lib/ads/sync";

/**
 * Ručno pokretanje sync-a iz admina (dugme). `days` = koliko dana
 * unazad (uključujući danas) — default 7, jer Meta zna naknadno
 * korigovati potrošnju za zadnjih par dana (attribution se stabilizuje
 * do ~72h), pa čist "samo juče" zna ostati blago netačan.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { days?: number };
  const days = Math.min(30, Math.max(1, Number(body.days) || 7));

  const until = sarajevoDateOnly();
  const since = sarajevoDateOnly(new Date(Date.now() - (days - 1) * 864e5));

  const res = await syncMetaSpend(since, until);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });
  return NextResponse.json({ ok: true, ...res.summary, since, until });
}
