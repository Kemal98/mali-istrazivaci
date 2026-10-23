import { NextResponse } from "next/server";
import { fetchAllConversationMessages } from "@/lib/messenger/graph";
import { insertMessengerMessage } from "@/lib/messenger/repo";

/**
 * Jednokratno (ili ponovljivo) povlačenje SVIH dosadašnjih Messenger
 * poruka preko Conversations API — webhook hvata samo nove od momenta
 * podešavanja, ovo popuni i historiju. Idempotentno (isti `mid` UNIQUE
 * kao i webhook), pa se može pokrenuti više puta bez duplikata.
 */
export async function POST() {
  const res = await fetchAllConversationMessages();
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });

  let inserted = 0;
  for (const m of res.data) {
    await insertMessengerMessage({ ...m, platform: "messenger" });
    inserted++;
  }

  return NextResponse.json({ ok: true, found: res.data.length, processed: inserted });
}
