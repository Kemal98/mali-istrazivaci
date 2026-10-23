import { NextResponse } from "next/server";
import { markAllMessengerRead } from "@/lib/messenger/repo";

export async function POST() {
  await markAllMessengerRead();
  return NextResponse.json({ ok: true });
}
