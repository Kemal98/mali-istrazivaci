import { NextResponse } from "next/server";
import { scrapeProductPage } from "@/lib/cms/scrape";

// Zaštićeno preko proxy.ts (matcher /api/admin/:path*).

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { url?: string };
  const url = String(body.url || "").trim();
  if (!url) return NextResponse.json({ error: "Nedostaje link." }, { status: 400 });

  const res = await scrapeProductPage(url);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });
  return NextResponse.json(res);
}
