import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/cms/repo";
import { str } from "@/lib/cms/sanitize";

export async function GET() {
  return NextResponse.json({ settings: await getSettings() });
}

export async function PUT(request: Request) {
  const b = await request.json().catch(() => ({}));
  await saveSettings({
    announcementBar: str(b.announcementBar, 200),
    placanjeTekst: str(b.placanjeTekst, 120),
    dostavaTekst: str(b.dostavaTekst, 120),
    garancijaTekst: str(b.garancijaTekst, 160),
    kontaktEmail: str(b.kontaktEmail, 160),
    defaultCtaTekst: str(b.defaultCtaTekst, 60),
    footerTekst: str(b.footerTekst, 200),
  });
  return NextResponse.json({ settings: await getSettings() });
}
