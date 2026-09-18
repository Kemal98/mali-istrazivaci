import "server-only";

/**
 * Izvlačenje naslova/opisa sa tuđeg linka (dobavljača), da se ne kuca
 * ručno prepisivanje. NIKAD ne pokušava puno "sastaviti stranicu" — samo
 * vrati čist tekst, admin ga zalijepi u chat i odatle se pravi prava
 * stranica (isto kao za sve dosadašnje proizvode).
 *
 * Namjerno BEZ biblioteke za parsiranje HTML-a (cheerio i sl.) — treba
 * nam par meta tagova, ne puno DOM stablo. Namjerno BEZ headless
 * browsera/plaćenog scraping servisa — dobavljači su "obični" sajtovi,
 * ne AliExpress (koji aktivno blokira automatske pozive); ako neki link
 * ipak odbije, admin ručno kopira tekst — isti krajnji rezultat.
 */

const TIMEOUT_MS = 10000;
const MAX_DESC = 2000;
const MAX_IMAGES = 8;

export interface ScrapeResult {
  ok: boolean;
  title?: string;
  description?: string;
  /** Prva slika — zadržano radi kompatibilnosti sa starijim pozivaocima. */
  image?: string;
  /** Sve pronađene slike (JSON-LD galerija + og:image), do MAX_IMAGES. */
  images?: string[];
  error?: string;
}

interface JsonLdProduct {
  name?: string;
  description?: string;
  image?: string | string[] | { url?: string; contentUrl?: string }[];
}

/**
 * Mnoge prodavnice (WooCommerce, OpenCart, Shopify...) ubace
 * `<script type="application/ld+json">` sa Product šemom — namijenjeno
 * Google-u za rich snippets, ali nama daje čist strukturiran opis I
 * CIJELU galeriju slika, ne samo jednu og:image. Pouzdanije od pogađanja
 * po <img> tagovima (koji su često u JS karuselu, van dohvata plain
 * fetch-a).
 */
function findJsonLdProduct(html: string): JsonLdProduct | null {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const m of scripts) {
    let data: unknown;
    try {
      data = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    const candidates = Array.isArray(data)
      ? data
      : (data as { "@graph"?: unknown[] })?.["@graph"] ?? [data];
    for (const c of candidates as Record<string, unknown>[]) {
      const type = c?.["@type"];
      const isProduct =
        type === "Product" || (Array.isArray(type) && type.includes("Product"));
      if (isProduct) return c as JsonLdProduct;
    }
  }
  return null;
}

function imagesFromJsonLd(p: JsonLdProduct): string[] {
  if (!p.image) return [];
  if (typeof p.image === "string") return [p.image];
  if (Array.isArray(p.image)) {
    return p.image
      .map((i) =>
        typeof i === "string" ? i : (i as { url?: string; contentUrl?: string })?.url ??
          (i as { url?: string; contentUrl?: string })?.contentUrl
      )
      .filter((u): u is string => Boolean(u));
  }
  return [];
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .trim();
}

function metaContent(html: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1]);
  }
  return "";
}

/**
 * Balkanski sajtovi nisu svi na UTF-8 (stariji OpenCart/WooCommerce
 * shopovi znaju biti na windows-1250) — pogrešan charset bi bosanska
 * slova (č,ć,š,ž,đ) pretvorio u zbrku. Čita se kao bajtovi pa se
 * charset nađe iz Content-Type headera ili <meta charset>, tek onda
 * dekodira ispravnim setom.
 */
function decodeHtml(buf: ArrayBuffer, contentType: string): string {
  const bytes = new Uint8Array(buf);
  const head = new TextDecoder("utf-8").decode(bytes.slice(0, 2000));

  let charset = /charset=([\w-]+)/i.exec(contentType)?.[1];
  if (!charset) {
    charset =
      /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ||
      /<meta[^>]+http-equiv=["']content-type["'][^>]+content=["'][^"']*charset=([\w-]+)/i.exec(
        head
      )?.[1];
  }
  charset = (charset || "utf-8").toLowerCase();

  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

export async function scrapeProductPage(url: string): Promise<ScrapeResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) throw new Error("bad protocol");
  } catch {
    return { ok: false, error: "Neispravan link." };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(parsed.toString(), {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        // Neki sajtovi odbiju zahtjeve bez "pravog" browser User-Agenta.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "bs,hr,sr,en;q=0.8",
      },
    });

    if (!res.ok) {
      return { ok: false, error: `Sajt je odgovorio sa HTTP ${res.status}.` };
    }

    const buf = await res.arrayBuffer();
    const html = decodeHtml(buf, res.headers.get("content-type") || "");

    const ld = findJsonLdProduct(html);

    const ogImage = metaContent(html, [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i,
      /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i,
    ]);

    // apsolutizuj relativne URL-ove (npr. "/slike/x.jpg") u odnosu na stranicu
    const toAbsolute = (u: string) => {
      try {
        return new URL(u, parsed).toString();
      } catch {
        return "";
      }
    };

    const images = [...(ld ? imagesFromJsonLd(ld) : []), ogImage]
      .filter(Boolean)
      .map(toAbsolute)
      .filter(Boolean)
      .filter((u, i, arr) => arr.indexOf(u) === i) // bez duplikata
      .slice(0, MAX_IMAGES);

    const title =
      decodeEntities(ld?.name ?? "") ||
      metaContent(html, [
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i,
        /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i,
        /<title[^>]*>([^<]*)<\/title>/i,
      ]);

    const description = (
      decodeEntities(ld?.description ?? "") ||
      metaContent(html, [
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i,
        /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
        /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i,
      ])
    ).slice(0, MAX_DESC);

    if (!title && !description) {
      return {
        ok: false,
        error:
          "Sajt ne dozvoljava automatsko čitanje (ili nema standardne " +
          "oznake). Kopiraj tekst ručno sa stranice.",
      };
    }

    return { ok: true, title, description, image: images[0], images };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: /abort/i.test(msg)
        ? "Sajt ne odgovara (timeout) — kopiraj tekst ručno."
        : "Nije uspjelo čitanje sa linka — kopiraj tekst ručno.",
    };
  } finally {
    clearTimeout(timer);
  }
}
