import { NextResponse } from "next/server";
import { sarajevoDateOnly } from "@/lib/cms/datum";
import { syncMetaSpend } from "@/lib/ads/sync";

/**
 * Dnevni automatski sync potrošnje — poziva ga Vercel Cron (vidi
 * vercel.json), NE korisnik iz browsera. Zato nije pod /api/admin/ (koji
 * traži admin sesiju koju cron nema) — umjesto toga provjerava
 * CRON_SECRET koji Vercel šalje u Authorization headeru.
 *
 * Povlači zadnjih 4 dana (ne samo "juče"): Meta zna naknadno korigovati
 * potrošnju kako se atribucija stabilizuje, pa dnevni re-sync poslije
 * ispravi eventualnu jučerašnju brojku bez ičije intervencije.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const until = sarajevoDateOnly();
  const since = sarajevoDateOnly(new Date(Date.now() - 3 * 864e5));

  const res = await syncMetaSpend(since, until);
  if (!res.ok) {
    console.error("[cron] Meta Ads sync pao:", res.error);
    return NextResponse.json({ error: res.error }, { status: 502 });
  }
  console.log("[cron] Meta Ads sync:", res.summary);
  return NextResponse.json({ ok: true, ...res.summary, since, until });
}
