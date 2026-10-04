import { NextResponse } from "next/server";
import { createMedia } from "@/lib/cms/repo";
import { str } from "@/lib/cms/sanitize";

/**
 * Dodaje sliku/GIF/video u biblioteku SAMO kao link — bez uploada na naš
 * storage. Hitno dodano dok je Supabase Storage blokiran (prekoračena
 * kvota prometa): admin u međuvremenu slike hostuje negdje drugo (npr.
 * Imgur) i ovdje samo zalijepi gotov link, koji onda radi svuda isto kao
 * i obično uploadovana slika (hero, CMS blokovi…).
 */
const IMG_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
};

function guessMime(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  return IMG_EXT[ext] ?? "image/jpeg";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const url = str(body?.url, 2000).trim();

  if (!/^https:\/\/.+/i.test(url)) {
    return NextResponse.json(
      { error: "Link mora početi sa https://" },
      { status: 400 }
    );
  }

  const filename = str(body?.filename, 120).trim() || url.split("/").pop() || "slika";

  const media = await createMedia({
    filename,
    url,
    alt: str(body?.alt, 200),
    mime: guessMime(url),
    size: 0,
    storageKey: "",
  });

  return NextResponse.json({ media });
}
