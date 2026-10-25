import { NextResponse } from "next/server";
import { povuciRecenzijeSaLinka } from "@/lib/cms/sourceReviews";

/**
 * Zaštićeno preko proxy.ts (matcher /api/admin/:path*). Samo vraća
 * povučene + prevedene recenzije — upis u bazu radi admin iz modala,
 * poslije pregleda (vidi ImportReviewsModal).
 */
export const maxDuration = 60;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { url?: string };
  const url = String(body.url || "").trim();
  if (!url) return NextResponse.json({ error: "Nedostaje link." }, { status: 400 });

  const res = await povuciRecenzijeSaLinka(url);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });
  return NextResponse.json(res);
}
