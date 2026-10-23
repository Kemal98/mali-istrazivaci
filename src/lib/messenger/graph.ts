import "server-only";

/**
 * Best-effort lookup imena pošiljaoca preko Graph API-ja (treba Page
 * Access Token — MESSENGER_PAGE_ACCESS_TOKEN). Ako token nije podešen
 * ili poziv padne, vraća "" — poruka se i dalje upiše, samo bez imena
 * (prikazuje se PSID u adminu).
 */
export async function resolveSenderName(psid: string): Promise<string> {
  const token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
  if (!token) return "";
  try {
    const url = `https://graph.facebook.com/v21.0/${psid}?fields=name&access_token=${token}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return "";
    const data = (await res.json().catch(() => null)) as { name?: string } | null;
    return data?.name ?? "";
  } catch {
    return "";
  }
}
