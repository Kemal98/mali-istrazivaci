import "server-only";

import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";

/**
 * Čita STRUKTURU opisa proizvoda sa tuđe stranice — ne samo jedan naslov
 * i jedan pasus teksta, nego redoslijed kako je admin vidi u browseru:
 * naslov, slika, tekst, slika, video... Ide u sekcije istim redom.
 *
 * Za ovo treba pravi HTML parser (cheerio) — regex ne može pratiti
 * ugnježdenu strukturu ni redoslijed elemenata.
 */

export type ContentItem =
  | { kind: "heading"; text: string }
  | { kind: "text"; text: string }
  | { kind: "image"; url: string }
  | { kind: "gif"; url: string }
  | { kind: "video"; url: string };

const MAX_ITEMS = 40;
const MAX_TEXT = 800;

// Prioritetna lista selektora za "opis proizvoda" kontejner — pokriva
// WooCommerce, OpenCart, Shopify i generičke šablone. Prvi koji ima
// smislenu količinu teksta pobjeđuje.
const CONTAINER_SELECTORS = [
  ".woocommerce-Tabs-panel--description",
  "#tab-description",
  ".product-description",
  ".product__description",
  ".product-details__description",
  "[itemprop='description']",
  ".entry-content",
  ".product-info",
  ".product-details",
  "#description",
  ".description",
];

const SKIP_TAGS = new Set(["script", "style", "noscript", "svg", "button", "form", "nav"]);

function absolutize(url: string, base: URL): string {
  try {
    return new URL(url, base).toString();
  } catch {
    return "";
  }
}

function isGifUrl(url: string): boolean {
  return /\.gif(\?|$)/i.test(url);
}

function pushText(out: ContentItem[], text: string) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length > 1) out.push({ kind: "text", text: t.slice(0, MAX_TEXT) });
}

function walk(
  node: AnyNode,
  $: cheerio.CheerioAPI,
  base: URL,
  out: ContentItem[]
): void {
  if (out.length >= MAX_ITEMS) return;
  if (node.type !== "tag") {
    if (node.type === "text") {
      // "goli" tekst direktno u kontejneru (nije u <p>) — i to se broji
      const t = (node as unknown as { data?: string }).data ?? "";
      if (t.trim()) pushText(out, t);
    }
    return;
  }

  const el = node as Element;
  const tag = el.tagName?.toLowerCase();
  if (!tag || SKIP_TAGS.has(tag)) return;

  if (/^h[1-6]$/.test(tag)) {
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (text) out.push({ kind: "heading", text: text.slice(0, 200) });
    return;
  }

  if (tag === "img") {
    const src =
      $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
    if (src && !/^data:/.test(src)) {
      const abs = absolutize(src, base);
      if (abs) out.push({ kind: isGifUrl(abs) ? "gif" : "image", url: abs });
    }
    return;
  }

  if (tag === "video") {
    const src = $(el).attr("src") || $(el).find("source").first().attr("src");
    if (src) {
      const abs = absolutize(src, base);
      if (abs) out.push({ kind: "video", url: abs });
    }
    return;
  }

  if (tag === "p" || tag === "li" || tag === "span") {
    // ne silazi dublje u p/li/span — uzmi sav tekst odjednom (izbjegava
    // sjeckanje jedne rečenice u pet mikro-blokova zbog <b>/<i> tagova)
    pushText(out, $(el).text());
    return;
  }

  if (tag === "br" || tag === "iframe") return; // iframe (YouTube i sl.) van dosega "video" bloka

  // kontejner (div, section, ul...) — silazi u djecu, istim redom
  $(el)
    .contents()
    .each((_, child) => walk(child, $, base, out));
}

/**
 * @param html već dekodiran (charset-ispravan) HTML string
 * @param pageUrl stranica sa koje je HTML — za apsolutizaciju relativnih URL-ova
 */
export function extractContentStructure(html: string, pageUrl: string): ContentItem[] {
  const $ = cheerio.load(html);
  const base = new URL(pageUrl);

  let container: ReturnType<typeof $> | null = null;
  for (const sel of CONTAINER_SELECTORS) {
    const found = $(sel).first();
    if (found.length && found.text().trim().length > 40) {
      container = found;
      break;
    }
  }
  if (!container) return [];

  const out: ContentItem[] = [];
  container.contents().each((_, node) => walk(node, $, base, out));

  // ukloni uzastopne duplikate slika (thumbnail + puna verzija isti src,
  // ili je ista slika i u glavnoj galeriji i u opisu)
  return out.filter((item, i) => {
    if (i === 0) return true;
    const prev = out[i - 1];
    if (
      (item.kind === "image" || item.kind === "gif") &&
      prev.kind === item.kind &&
      "url" in prev &&
      prev.url === item.url
    )
      return false;
    return true;
  });
}
