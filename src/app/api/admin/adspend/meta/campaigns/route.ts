import { NextResponse } from "next/server";
import { listCampaignMap } from "@/lib/ads/repo";
import { metaConfigured } from "@/lib/ads/meta";
import { refreshCampaignList } from "@/lib/ads/sync";

// Zaštićeno preko proxy.ts (matcher /api/admin/:path*).

export async function GET() {
  return NextResponse.json({
    configured: metaConfigured(),
    campaigns: await listCampaignMap(),
  });
}

/** Povuci listu kampanja sa Meta naloga (ne diraj potrošnju, samo imena). */
export async function POST() {
  const res = await refreshCampaignList();
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });
  return NextResponse.json({ ok: true, count: res.count, campaigns: await listCampaignMap() });
}
