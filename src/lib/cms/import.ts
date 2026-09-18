import "server-only";

import { newId } from "./db";
import { createMedia, createProduct, getProduct, updateProduct } from "./repo";
import { scrapeProductPage, type ScrapeResult } from "./scrape";
import { uploadToStorage } from "./storage";
import type { Block, Media } from "./types";

/**
 * Puni uvoz, u DVIJE faze — vidi napomenu u api/admin/products/import/route.ts
 * za zašto (Vercel ubija funkciju poslije ~10s, a do 8 slika sekvencijalno
 * lako pređe to, isti problem kao Google Sheets sync ranije u projektu):
 *
 *  1. createDraftFromScrape — BRZO: napravi nacrt sa naslovom i tekstom.
 *     Admin odmah dobije productId i ide na editor.
 *  2. importProductImages — SPORO: skida slike, zove se iz after() u ruti,
 *     poslije odgovora. Kad završi, sekcije/hero se dopune slikama —
 *     admin ih vidi kad osvježi stranicu par sekundi kasnije.
 *
 * Best-effort na svakom koraku: jedna slika koja ne uspije se preskoči,
 * ne obara ostatak. Ako baš nijedna ne uspije, nacrt ostaje samo sa
 * tekstom — i dalje korisno, ništa se ne gubi.
 */

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const IMAGE_TIMEOUT_MS = 10000;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

async function downloadImage(url: string): Promise<Media | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), IMAGE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        // Neki CDN-ovi (hotlink zaštita) traže Referer sa istog sajta.
        Referer: new URL(url).origin,
      },
    });
    if (!res.ok) return null;

    const mime = (res.headers.get("content-type") || "").split(";")[0].trim();
    const ext = MIME_EXT[mime];
    if (!ext) return null; // nepoznat/nepodržan tip — preskoči, ne pucaj

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) return null;

    const key = `${new Date().getFullYear()}/uvoz-${newId()}.${ext}`;
    const { url: storedUrl } = await uploadToStorage(key, buf, mime);

    return createMedia({
      filename: `uvoz-${newId()}.${ext}`,
      url: storedUrl,
      alt: "",
      mime,
      size: buf.length,
      storageKey: key,
    });
  } catch {
    return null; // timeout, blokiran hotlink, šta god — samo preskoči
  } finally {
    clearTimeout(timer);
  }
}

function imageBlock(m: Media, alt: string): Block {
  return {
    id: newId("blk"),
    type: m.mime === "image/gif" ? "gif" : "slika",
    data: { url: m.url, alt, radius: true, fullWidth: false, caption: "" },
  };
}

/** Faza 1 — brzo. Samo tekst, bez slika. */
export async function createDraftFromScrape(
  scraped: ScrapeResult
): Promise<{ productId: string }> {
  const product = await createProduct({ naziv: scraped.title || "Novi proizvod" });

  if (scraped.description) {
    await updateProduct(product.id, {
      sections: [
        {
          id: newId("blk"),
          type: "naslov_tekst",
          data: {
            naslov: scraped.title || "",
            tekst: scraped.description,
            bold: true,
            align: "center",
          },
        },
      ],
    });
  }

  return { productId: product.id };
}

/** Faza 2 — sporo, zove se iz after(). Dopuni sekcije/hero slikama. */
export async function importProductImages(
  productId: string,
  imageUrls: string[],
  alt: string
): Promise<number> {
  if (!imageUrls.length) return 0;

  // sekvencijalno — svaki download je vanjski HTTP poziv, paralelno bi
  // lako pogodilo timeout/rate limit na tuđem serveru
  const media: Media[] = [];
  for (const imgUrl of imageUrls) {
    const m = await downloadImage(imgUrl);
    if (m) media.push(m);
  }
  if (!media.length) return 0;

  // svjež fetch neposredno prije patch-a — admin je možda već nešto
  // sačuvao dok su se slike skidale, ne smijemo to prepisati starim stanjem
  const product = await getProduct(productId);
  if (!product) return 0;

  await updateProduct(productId, {
    sections: [...product.sections, ...media.map((m) => imageBlock(m, alt))],
    hero: {
      ...product.hero,
      slika: product.hero.slika || media[0].url,
      galerija: [
        ...(product.hero.galerija ?? []),
        ...media.slice(product.hero.slika ? 0 : 1).map((m) => ({ url: m.url, alt })),
      ],
    },
  });

  return media.length;
}

export interface ScrapeAndDraftResult {
  ok: boolean;
  error?: string;
  productId?: string;
  images?: string[];
  title?: string;
}

/** Scrape + faza 1, u jednom pozivu — koristi ruta. */
export async function startImport(url: string): Promise<ScrapeAndDraftResult> {
  const scraped = await scrapeProductPage(url);
  if (!scraped.ok) return { ok: false, error: scraped.error };

  const { productId } = await createDraftFromScrape(scraped);
  return {
    ok: true,
    productId,
    images: scraped.images ?? [],
    title: scraped.title,
  };
}
