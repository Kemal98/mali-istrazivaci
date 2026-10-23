// Next 16: "middleware.ts" je preimenovan u "proxy.ts", i od v16 radi na
// Node.js runtimeu po defaultu (ne Edge) — zato ovdje smije da se zove
// baza (getSettings), što na Edge runtimeu ne bi radilo (postgres paket
// treba Node net/tls).
//
// Dva posla u jednom fajlu:
//  1) /admin i /api/admin — bez validnog potpisanog session cookieja se
//     ne može ući. Potpis se provjerava kriptografski (Web Crypto).
//  2) Sve OSTALO (javni sajt) — ako je admin uključio "Zatvori cijeli
//     sajt" (Postavke), svaka javna stranica/ruta se rewrituje na
//     /zatvoreno. Admin dio OSTAJE dostupan da se blokada može ugasiti.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/cms/auth";
import { getSettings } from "@/lib/cms/repo";

// Kratak keš po "toplom" serverless instance-u — bez ovoga bi SVAKI
// javni pregled stranice pitao bazu. 15s znači da se uključena/isključena
// blokada vidi skoro odmah, a baza se ne zove na svaki klik.
let closedCache: { value: boolean; until: number } | null = null;

async function isSiteClosed(): Promise<boolean> {
  const now = Date.now();
  if (closedCache && closedCache.until > now) return closedCache.value;
  try {
    const settings = await getSettings();
    const value = Boolean(settings.siteClosed);
    closedCache = { value, until: now + 15_000 };
    return value;
  } catch {
    // Baza nedostupna -> sajt radi normalno, ne zaključavaj kupce zbog toga.
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdmin = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdmin || isAdminApi) {
    const isLogin = pathname === "/admin/login";
    const isLoginApi = pathname === "/api/admin/login";
    if (isLogin || isLoginApi) return NextResponse.next();

    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const ok = await verifySessionToken(token);
    if (ok) return NextResponse.next();

    if (isAdminApi) {
      return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Cron rute (Vercel Cron) i webhookovi (npr. Meta Messenger) rade i
  // dok je sajt "zatvoren" — ne zavise od posjetilaca, i Meta zna zvati
  // webhook bilo kad, nezavisno od toga da li je shop trenutno otvoren.
  const bypassClosed =
    pathname.startsWith("/api/cron/") || pathname.startsWith("/api/webhooks/");
  if (!bypassClosed && pathname !== "/zatvoreno" && (await isSiteClosed())) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Sajt je trenutno privremeno nedostupan." },
        { status: 503 }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/zatvoreno";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)",
  ],
};
