import { NextResponse } from "next/server";
import { createMedia } from "@/lib/cms/repo";
import { newId } from "@/lib/cms/db";
import { slugify } from "@/lib/cms/slug";
import { createSignedUpload, publicUrl, storageObjectExists } from "@/lib/cms/storage";

// Veći fajlovi (GIF, video) ne mogu kroz Vercel funkciju (~4.5 MB limit tijela),
// pa browser šalje fajl DIREKTNO u Storage preko potpisanog URL-a; ovdje se samo
// izda potpis (sign) i upiše zapis u bazu (register).
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const MAX_BYTES = 40 * 1024 * 1024;
const KEY_RE = /^\d{4}\/[a-z0-9-]+-[A-Za-z0-9_]+\.(jpg|png|webp|gif|avif|mp4|webm|mov)$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.filename === "string" ? body.filename : "";
  const mime = typeof body.mime === "string" ? body.mime : "";
  const size = Number(body.size);
  const ext = ALLOWED[mime];

  if (!ext) {
    return NextResponse.json(
      { error: `${name}: nedozvoljen tip fajla (${mime || "nepoznat"}).` },
      { status: 400 }
    );
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return NextResponse.json(
      { error: `${name}: fajl je prevelik (limit ${MAX_BYTES / 1024 / 1024} MB).` },
      { status: 400 }
    );
  }

  try {
    if (body.action === "sign") {
      const base = slugify(name.replace(/\.[^.]+$/, "")) || "fajl";
      const key = `${new Date().getFullYear()}/${base}-${newId()}.${ext}`;
      const { signedUrl } = await createSignedUpload(key);
      return NextResponse.json({ key, signedUrl });
    }

    if (body.action === "register") {
      const key = typeof body.key === "string" ? body.key : "";
      if (!KEY_RE.test(key) || !key.endsWith(`.${ext}`)) {
        return NextResponse.json({ error: "Neispravan ključ fajla." }, { status: 400 });
      }
      if (!(await storageObjectExists(key))) {
        return NextResponse.json({ error: "Fajl nije stigao u Storage." }, { status: 400 });
      }
      const base = key.split("/")[1].replace(/-[A-Za-z0-9_]+\.[a-z0-9]+$/, "") || "fajl";
      const media = await createMedia({
        filename: `${base}.${ext}`,
        url: publicUrl(key),
        alt: "",
        mime,
        size,
        storageKey: key,
      });
      return NextResponse.json({ media });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Greška pri uploadu." },
      { status: 500 }
    );
  }
  return NextResponse.json({ error: "Nepoznata akcija." }, { status: 400 });
}
