import "server-only";

import { newId } from "./db";
import { createMedia, createProduct, getProduct, updateProduct } from "./repo";
import { scrapeProductPage, type ScrapeResult } from "./scrape";
import { uploadToStorage } from "./storage";
import type { Block, Media } from "./types";

/**
 * Puni uvoz, u DVIJE faze — vidi napomenu u api/admin/products/import/route.ts
 * za zašto (Vercel ubija funkciju poslije ~10s, a puno slika sekvencijalno
 * lako pređe to, isti problem kao Google Sheets sync ranije u projektu):
 *
 *  1. createDraftFromScrape — BRZO: napravi nacrt, sekcije istim
 *     redoslijedom kao na izvornoj stranici (naslov/tekst/slika/gif/video),
 *     slike za sad kao "prazan prostor" placeholder. Admin odmah dobije
 *     productId i ide na editor.
 *  2. importProductImages — SPORO: skida slike (i za hero galeriju i za
 *     placeholdere u sadržaju), zove se iz after() u ruti, poslije
 *     odgovora. Svaki placeholder se zamijeni STVARNOM slikom na ISTOM
 *     mjestu u nizu — ne dodaje se na kraj.
 *
 * Best-effort na svakom koraku: jedna slika koja ne uspije ostaje kao
 * prazan placeholder (admin vidi gdje treba ručno dodati, "prostor" koji
 * je tražio) — ne obara ostatak uvoza.
 */

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const IMAGE_TIMEOUT_MS = 10000;
const FAILED_ALT = "⚠️ Nije uspjelo automatsko skidanje — dodaj ručno";

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

/** Jedna slika/gif koja čeka skidanje, s mjestom gdje ide kad završi. */
interface PendingImage {
  sourceUrl: string;
  /** Sekcija koju treba zamijeniti kad slika stigne (undefined = ide u hero galeriju). */
  blockId?: string;
}

export interface StartImportResult {
  ok: boolean;
  error?: string;
  productId?: string;
  pending?: PendingImage[];
}

/** Faza 1 — brzo. Sekcije po strukturi izvorne stranice, slike kao placeholderi. */
export async function createDraftFromScrape(
  scraped: ScrapeResult
): Promise<{ productId: string; pending: PendingImage[] }> {
  const product = await createProduct({ naziv: scraped.title || "Novi proizvod" });

  const sections: Block[] = [];
  const pending: PendingImage[] = [];

  if (scraped.structure && scraped.structure.length > 0) {
    // Susjedni "text" redovi (npr. tri pasusa zaredom, bez slike između)
    // idu u JEDAN "tekst" blok spojen novim redom, ne blok po red —
    // svaki blok nosi fiksan razmak (.dawn-story-block margin-bottom),
    // pa bi 6 pasusa = 6 blokova ostavilo mnogo praznog prostora.
    let textBuf: string[] = [];
    const flushText = () => {
      if (!textBuf.length) return;
      sections.push({
        id: newId("blk"),
        type: "tekst",
        data: { tekst: textBuf.join("\n"), bold: false, align: "center" },
      });
      textBuf = [];
    };

    for (const item of scraped.structure) {
      if (item.kind === "heading") {
        flushText();
        sections.push({
          id: newId("blk"),
          type: "naslov",
          data: { tekst: item.text, velicina: "L", bold: true, align: "center" },
        });
      } else if (item.kind === "text") {
        textBuf.push(item.text);
      } else if (item.kind === "image" || item.kind === "gif") {
        flushText();
        const id = newId("blk");
        sections.push({
          id,
          type: item.kind === "gif" ? "gif" : "slika",
          data: { url: "", alt: "⏳ Slika se učitava…", radius: true, fullWidth: false, caption: "" },
        });
        pending.push({ sourceUrl: item.url, blockId: id });
      } else if (item.kind === "video") {
        // Video se NE skida na naš Storage (veliki fajlovi, nepotreban
        // rizik) — ide direktno sa izvorne adrese.
        flushText();
        sections.push({
          id: newId("blk"),
          type: "video",
          data: { url: item.url, autoplay: false, muted: true, loop: false, controls: true },
        });
      }
    }
    flushText();
  } else if (scraped.description) {
    // Fallback kad struktura nije nađena (npr. sajt bez prepoznatljivog
    // kontejnera za opis) — staro ponašanje, jedan blok sa svim tekstom.
    sections.push({
      id: newId("blk"),
      type: "naslov_tekst",
      data: {
        naslov: scraped.title || "",
        tekst: scraped.description,
        bold: true,
        align: "center",
      },
    });
  }

  if (sections.length) await updateProduct(product.id, { sections });

  // Hero galerija — odvojeno od sekcija sadržaja: ovo su "zvanične"
  // proizvod-fotografije (JSON-LD/og:image), ne slike unutar opisa.
  for (const url of scraped.images ?? []) pending.push({ sourceUrl: url });

  return { productId: product.id, pending };
}

/** Faza 2 — sporo, zove se iz after(). Zamijeni placeholdere i popuni hero. */
export async function importProductImages(
  productId: string,
  pending: PendingImage[],
  alt: string
): Promise<number> {
  if (!pending.length) return 0;

  // sekvencijalno — svaki download je vanjski HTTP poziv, paralelno bi
  // lako pogodilo timeout/rate limit na tuđem serveru
  const done: { media: Media; blockId?: string }[] = [];
  for (const p of pending) {
    const m = await downloadImage(p.sourceUrl);
    if (m) done.push({ media: m, blockId: p.blockId });
  }
  if (!done.length) return 0;

  // svjež fetch neposredno prije patch-a — admin je možda već nešto
  // sačuvao dok su se slike skidale, ne smijemo to prepisati starim stanjem
  const product = await getProduct(productId);
  if (!product) return 0;

  const byBlockId = new Map(done.filter((d) => d.blockId).map((d) => [d.blockId, d.media]));
  const pendingBlockIds = new Set(pending.filter((p) => p.blockId).map((p) => p.blockId));
  // SAMO "zvanične" slike (JSON-LD/og:image) idu u hero galeriju —
  // namjerno se NE popunjava automatski iz sekcija kad tih nema, admin
  // bira ručno u editoru koje slike ide u malu galeriju.
  const heroImages = done.filter((d) => !d.blockId).map((d) => d.media);

  const sections = product.sections.map((s) => {
    const m = byBlockId.get(s.id);
    if (m) return { ...s, data: { ...s.data, url: m.url, alt } };
    // Bio placeholder, skidanje nije uspjelo — ostaje prazan "prostor"
    // (isto mjesto u nizu) za ručno dodavanje, samo jasno obilježen.
    if (pendingBlockIds.has(s.id)) return { ...s, data: { ...s.data, alt: FAILED_ALT } };
    return s;
  });

  await updateProduct(productId, {
    sections,
    hero: heroImages.length
      ? {
          ...product.hero,
          slika: product.hero.slika || heroImages[0].url,
          galerija: [
            ...(product.hero.galerija ?? []),
            ...heroImages.slice(product.hero.slika ? 0 : 1).map((m) => ({ url: m.url, alt })),
          ],
        }
      : undefined,
  });

  return done.length;
}

export interface ScrapeAndDraftResult {
  ok: boolean;
  error?: string;
  productId?: string;
  pending?: PendingImage[];
  title?: string;
}

/** Scrape + faza 1, u jednom pozivu — koristi ruta. */
export async function startImport(url: string): Promise<ScrapeAndDraftResult> {
  const scraped = await scrapeProductPage(url);
  if (!scraped.ok) return { ok: false, error: scraped.error };

  const { productId, pending } = await createDraftFromScrape(scraped);
  return { ok: true, productId, pending, title: scraped.title };
}
