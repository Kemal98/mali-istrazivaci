import { NextResponse } from "next/server";
import { SESSION_COOKIE, checkPassword, createSessionToken } from "@/lib/cms/auth";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Neispravan zahtjev." }, { status: 400 });
  }

  if (!(await checkPassword(password))) {
    // Mala pauza da brute-force bude neisplativ
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Pogrešna lozinka." }, { status: 401 });
  }

  const { token, maxAge } = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}
