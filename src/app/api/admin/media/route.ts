import { NextResponse } from "next/server";
import { createMedia, listMedia } from "@/lib/cms/repo";
import { newId } from "@/lib/cms/db";
import { slugify } from "@/lib/cms/slug";
import { uploadToStorage } from "@/lib/cms/storage";

// Bijela lista tipova — ništa drugo se ne prima.
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

// Vercel serverless ima limit na veličinu tijela zahtjeva (~4.5 MB), pa je
// ovdje limit usklađen s tim. Za veće videe ide direktan upload u Storage
// (vidi napomenu u MediaBrowser-u) — ovako korisnik dobije jasnu grešku
// umjesto tihog 413.
const MAX_BYTES = 4 * 1024 * 1024;

export async function GET() {
  return NextResponse.json({ media: await listMedia() });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Neispravan upload." }, { status: 400 });
  }

  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) {
    return NextResponse.json({ error: "Nije poslan nijedan fajl." }, { status: 400 });
  }

  const uploaded = [];
  const errors: string[] = [];

  for (const file of files) {
    const ext = ALLOWED[file.type];
    if (!ext) {
      errors.push(`${file.name}: nedozvoljen tip fajla (${file.type || "nepoznat"}).`);
      continue;
    }
    if (file.size > MAX_BYTES) {
      errors.push(
        `${file.name}: fajl je ${(file.size / 1024 / 1024).toFixed(1)} MB — ` +
          `limit je 4 MB. Smanjite sliku ili kompresujte video.`
      );
      continue;
    }

    try {
      const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "fajl";
      const key = `${new Date().getFullYear()}/${base}-${newId()}.${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());
      const { url } = await uploadToStorage(key, buf, file.type);

      uploaded.push(
        await createMedia({
          filename: `${base}.${ext}`,
          url,
          alt: "",
          mime: file.type,
          size: file.size,
          storageKey: key,
        })
      );
    } catch (e) {
      // Jedan neuspio upload ne smije srušiti ostatak batcha
      const msg = e instanceof Error ? e.message : "greška pri uploadu";
      errors.push(`${file.name}: ${msg}`);
    }
  }

  return NextResponse.json({ uploaded, errors, media: await listMedia() });
}
