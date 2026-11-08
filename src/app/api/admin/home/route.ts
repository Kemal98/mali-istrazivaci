import { NextResponse } from "next/server";
import { getHomeDraft, saveHomeDraft } from "@/lib/home/repo";
import type { HomeContent } from "@/lib/home/types";

export async function GET() {
  return NextResponse.json({ content: await getHomeDraft() });
}

/**
 * Sprema NACRT. Nikad ne mijenja objavljenu verziju (vidi /publish).
 * saveHomeDraft sam spoji ovaj (djelimični) patch sa trenutnim nacrtom
 * PRIJE sanitizacije — ne sanitizovati ovdje unaprijed, to bi popunilo
 * defaultima svako polje koje admin baš sad nije mijenjao.
 */
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const patch = (typeof body === "object" && body !== null ? body : {}) as Partial<HomeContent>;
  const content = await saveHomeDraft(patch);
  return NextResponse.json({ content });
}
