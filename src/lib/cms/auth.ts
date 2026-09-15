// Admin autentikacija.
//
// - Lozinka NIKAD nije u frontend kodu — dolazi iz ADMIN_PASSWORD (env).
// - Session je HMAC-potpisan cookie (httpOnly, sameSite=lax, secure u
//   produkciji). Bez tajnog ključa potpis se ne može podvaliti.
// - Koristi SAMO Web Crypto (crypto.subtle), pa isti kod radi i u
//   proxy.ts (Edge runtime) i u server komponentama (Node).

export const SESSION_COOKIE = "mi_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET nije postavljen (min 16 znakova). Vidi .env.local.example"
    );
  }
  return s;
}

function b64url(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return b64url(new Uint8Array(sig));
}

/** Kreira potpisani session token. */
export async function createSessionToken(): Promise<{
  token: string;
  maxAge: number;
}> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ exp })));
  const sig = await hmac(payload);
  return { token: `${payload}.${sig}`, maxAge: SESSION_TTL_SECONDS };
}

/** Provjerava potpis i rok trajanja. */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;

  let expected: string;
  try {
    expected = await hmac(payload);
  } catch {
    return false;
  }
  if (!timingSafeEqualStr(sig, expected)) return false;

  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    return typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Provjera lozinke — PBKDF2 pa timing-safe poređenje. */
export async function checkPassword(submitted: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 6) return false;
  const [a, b] = await Promise.all([derive(submitted), derive(expected)]);
  return timingSafeEqualStr(a, b);
}

async function derive(pw: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pw),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("mi-admin-static-salt"),
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256
  );
  return b64url(new Uint8Array(bits));
}
