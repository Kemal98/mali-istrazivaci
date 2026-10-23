import "server-only";

const API_VERSION = "v21.0";

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
    const url = `https://graph.facebook.com/${API_VERSION}/${psid}?fields=name&access_token=${token}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return "";
    const data = (await res.json().catch(() => null)) as { name?: string } | null;
    return data?.name ?? "";
  } catch {
    return "";
  }
}

export interface BackfilledMessage {
  mid: string;
  psid: string;
  senderName: string;
  text: string;
  createdAt: string;
}

interface ConvMessage {
  id: string;
  message?: string;
  from?: { id?: string; name?: string };
  created_time?: string;
}

/**
 * Da li su MESSENGER_PAGE_ID/MESSENGER_PAGE_ACCESS_TOKEN podešeni — admin
 * stranica koristi ovo da zna prikazati li dugme "Povuci starije poruke".
 */
export function backfillConfigured(): boolean {
  return Boolean(process.env.MESSENGER_PAGE_ID && process.env.MESSENGER_PAGE_ACCESS_TOKEN);
}

/**
 * Povuci SVE poruke koje je stranica ikad primila (ne samo od sad —
 * webhook hvata samo NOVE poruke od trenutka podešavanja). Koristi
 * Conversations API (/​{page}/conversations → /​{conversation}/messages),
 * koji vraća i `from.name` direktno — ovdje nema potrebe za dodatnim
 * lookup pozivom kao kod webhooka. Filtrira poruke koje je poslala SAMA
 * stranica (odgovori), vraća samo kupčeve.
 */
export async function fetchAllConversationMessages(): Promise<
  { ok: true; data: BackfilledMessage[] } | { ok: false; error: string }
> {
  const pageId = process.env.MESSENGER_PAGE_ID;
  const token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    return { ok: false, error: "MESSENGER_PAGE_ID / MESSENGER_PAGE_ACCESS_TOKEN nisu postavljeni." };
  }

  const out: BackfilledMessage[] = [];

  try {
    let convUrl: string | null =
      `https://graph.facebook.com/${API_VERSION}/${pageId}/conversations?limit=50&access_token=${token}`;

    while (convUrl) {
      const convRes = await fetch(convUrl, { signal: AbortSignal.timeout(15000) });
      const convJson = (await convRes.json().catch(() => null)) as {
        data?: { id: string }[];
        paging?: { next?: string };
        error?: { message?: string };
      } | null;
      if (!convRes.ok || !convJson) {
        return { ok: false, error: convJson?.error?.message ?? `HTTP ${convRes.status}` };
      }

      for (const conv of convJson.data ?? []) {
        let msgUrl: string | null =
          `https://graph.facebook.com/${API_VERSION}/${conv.id}/messages` +
          `?fields=id,message,from,created_time&limit=100&access_token=${token}`;

        while (msgUrl) {
          const msgRes = await fetch(msgUrl, { signal: AbortSignal.timeout(15000) });
          const msgJson = (await msgRes.json().catch(() => null)) as {
            data?: ConvMessage[];
            paging?: { next?: string };
          } | null;
          if (!msgRes.ok || !msgJson) break; // jedna loša konverzacija ne obara cijeli backfill

          for (const m of msgJson.data ?? []) {
            if (!m.message || !m.id || !m.from?.id) continue;
            if (m.from.id === pageId) continue; // odgovor stranice, ne kupac
            out.push({
              mid: m.id,
              psid: m.from.id,
              senderName: m.from.name ?? "",
              text: m.message,
              createdAt: m.created_time ? new Date(m.created_time).toISOString() : new Date().toISOString(),
            });
          }
          msgUrl = msgJson.paging?.next ?? null;
        }
      }

      convUrl = convJson.paging?.next ?? null;
    }

    return { ok: true, data: out };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: /abort/i.test(msg) ? "Meta API ne odgovara (timeout)." : msg };
  }
}
