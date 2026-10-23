import "server-only";

import { newId, nowIso, sql } from "@/lib/cms/db";
import type { MessengerMessage } from "./types";

type Row = Record<string, unknown>;
const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

function rowToMessage(r: Row): MessengerMessage {
  return {
    id: s(r.id),
    mid: s(r.mid),
    psid: s(r.psid),
    senderName: s(r.sender_name),
    text: s(r.text),
    createdAt: s(r.created_at),
    readAt: r.read_at ? s(r.read_at) : null,
  };
}

/**
 * Upiši primljenu poruku — `mid` (Meta-in message id) je UNIQUE, pa
 * webhook retry (Meta zna poslati isti event dvaput) ne pravi duplikat.
 */
export async function insertMessengerMessage(input: {
  mid: string;
  psid: string;
  senderName: string;
  text: string;
  createdAt: string;
}): Promise<void> {
  await sql()`
    INSERT INTO messenger_messages (id, mid, psid, sender_name, text, created_at)
    VALUES (${newId("mm")}, ${input.mid}, ${input.psid}, ${input.senderName},
            ${input.text}, ${input.createdAt})
    ON CONFLICT (mid) DO NOTHING`;
}

export async function listMessengerMessages(limit = 200): Promise<MessengerMessage[]> {
  const rows = await sql()<Row[]>`
    SELECT * FROM messenger_messages ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map(rowToMessage);
}

export async function countUnreadMessenger(): Promise<number> {
  const rows = await sql()<{ c: number }[]>`
    SELECT COUNT(*) AS c FROM messenger_messages WHERE read_at IS NULL`;
  return Number(rows[0]?.c ?? 0);
}

export async function markAllMessengerRead(): Promise<void> {
  await sql()`
    UPDATE messenger_messages SET read_at = ${nowIso()} WHERE read_at IS NULL`;
}
