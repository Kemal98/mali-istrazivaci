import crypto from "node:crypto";
import { insertMessengerMessage } from "@/lib/messenger/repo";
import { resolveSenderName } from "@/lib/messenger/graph";

/**
 * Meta Messenger + Instagram DM webhook — JAVNA ruta (Meta je zove, ne
 * naš admin), pa nema proxy.ts zaštitu. Umjesto session cookieja,
 * provjerava se:
 *  - GET:  hub.verify_token (jednokratna provjera pri podešavanju webhooka)
 *  - POST: X-Hub-Signature-256 potpis (HMAC SHA-256 preko App Secret-a) —
 *          bez ovoga bi bilo ko mogao POST-ovati lažne "poruke" u bazu.
 *
 * Instagram (novi "Instagram Business Login" flow) ima SVOJ odvojeni
 * App ID/App Secret, različit od glavnog Facebook App-a koji potpisuje
 * Messenger "page" evente — zato se ovdje provjerava potpis protiv OBA
 * poznata secreta (MESSENGER_APP_SECRET, INSTAGRAM_APP_SECRET), šta god
 * se poklopi. Payload oblik (entry[].messaging[]) je inače identičan,
 * razlikuje se samo `object` polje, pa se to koristi samo za tag kanala.
 *
 * PAUZIRANO (24.10.2026, na izričit zahtjev) — admin ne želi trenutni
 * izgled/sistem inboxa, vratićemo se na doradu kasnije. Dolazne poruke
 * se i dalje PRIHVATAJU (Meta ne dobija grešku/ne gasi webhook), ali se
 * NE upisuju u bazu dok je MESSENGER_INBOX_PAUSED === true. Admin link
 * u meniju je uklonjen (vidi AdminNav.tsx) — sve ostalo (tabela, kod)
 * ostaje netaknuto za lakše vraćanje.
 */
const MESSENGER_INBOX_PAUSED = true;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    challenge &&
    token &&
    token === process.env.MESSENGER_VERIFY_TOKEN
  ) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

function signatureMatches(raw: string, signatureHeader: string, secret: string): boolean {
  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function validSignature(raw: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const secrets = [process.env.MESSENGER_APP_SECRET, process.env.INSTAGRAM_APP_SECRET].filter(
    (s): s is string => Boolean(s)
  );
  // Bez ijednog podešenog secreta ne možemo provjeriti — radije odbij
  // nego da tiho prihvatimo neprovjerene zahtjeve iz javnog interneta.
  return secrets.some((secret) => signatureMatches(raw, signatureHeader, secret));
}

interface MessagingEvent {
  sender?: { id?: string };
  timestamp?: number;
  message?: { mid?: string; text?: string; is_echo?: boolean };
}

export async function POST(request: Request) {
  if (MESSENGER_INBOX_PAUSED) return new Response("paused", { status: 200 });

  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const body = JSON.parse(raw) as {
    object?: string;
    entry?: { messaging?: MessagingEvent[] }[];
  };
  const platform =
    body.object === "instagram" ? "instagram" : body.object === "page" ? "messenger" : null;
  if (!platform) return new Response("ignored", { status: 200 });

  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const text = event.message?.text;
      const mid = event.message?.mid;
      const psid = event.sender?.id;
      // is_echo = poruka koju je STRANICA/profil poslala (naš odgovor),
      // ne kupčeva — preskoči, ovo je inbox za PRIMLJENE.
      if (!text || !mid || !psid || event.message?.is_echo) continue;

      const senderName = await resolveSenderName(psid);
      await insertMessengerMessage({
        mid,
        psid,
        senderName,
        text,
        platform,
        createdAt: event.timestamp
          ? new Date(event.timestamp).toISOString()
          : new Date().toISOString(),
      });
    }
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}
