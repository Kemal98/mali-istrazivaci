// Next 16: "middleware.ts" je preimenovan u "proxy.ts".
// Ovdje se čuva /admin i /api/admin — bez validnog potpisanog session
// cookieja se ne može ući. Potpis se provjerava kriptografski (Web
// Crypto), ne samo postojanje cookieja.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/cms/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLogin = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isLogin || isLoginApi) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(token);
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
