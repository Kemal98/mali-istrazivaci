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
  // \s+ bi pojeo i \n (ubačen za <br>, vidi inlineMarkdown) — ovdje se
  // čuva prelom reda, samo se čisti razmaci/tabovi UNUTAR jednog reda.
  const t = text
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .trim();
  if (t.length > 1) out.push({ kind: "text", text: t.slice(0, MAX_TEXT) });
}

/** Mutable "trenutni tekst paragrafa dok se gradi" — dijeli se kroz rekurziju. */
interface ParaState {
  buf: string;
}

function flushPara(out: ContentItem[], state: ParaState) {
  pushText(out, state.buf);
  state.buf = "";
}

function pushMedia(out: ContentItem[], el: Element, $: cheerio.CheerioAPI, base: URL) {
  const tag = el.tagName?.toLowerCase();
  if (tag === "img") {
    const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
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
  }
}

/**
 * Prolazi kroz SADRŽAJ paragrafa (tekst, bold/italic, slike/gif/video
 * zalijepljeni UNUTAR teksta, prelomi reda) i gradi ga u ISTOM redoslijedu
 * kako je na izvornoj stranici. Mnogi sajtovi (npr. Shopify) stavljaju
 * sliku NASRED pasusa — <p>tekst<img>tekst</p> — a stari kod je radio
 * .text()/jednu spojenu string-vrijednost po paragrafu, pa je takva
 * slika nestajala BEZ TRAGA (nije ni postala "prazan prostor" placeholder,
 * nego se prosto izgubila), a tekst prije/poslije nje ispadao nepovezan.
 * Sad se tekst prikupi u `state.buf`, a čim se naiđe na <img>/<video>,
 * dosadašnji tekst se "ispljune" kao jedna text stavka i slika postane
 * svoja stavka — redoslijed ostaje tačan.
 */
function walkParaContent(
  $node: cheerio.Cheerio<AnyNode>,
  $: cheerio.CheerioAPI,
  base: URL,
  out: ContentItem[],
  state: ParaState
): void {
  $node.contents().each((_, child) => {
    if (out.length >= MAX_ITEMS) return;
    if (child.type === "text") {
      state.buf += (child as unknown as { data?: string }).data ?? "";
      return;
    }
    if (child.type !== "tag") return;
    const el = child as Element;
    const tag = el.tagName?.toLowerCase();
    if (!tag || SKIP_TAGS.has(tag)) return;

    if (tag === "br") {
      state.buf += "\n";
      return;
    }
    if (tag === "img" || tag === "video") {
      flushPara(out, state);
      pushMedia(out, el, $, base);
      return;
    }
    if (tag === "b" || tag === "strong" || tag === "i" || tag === "em") {
      const marker = tag === "b" || tag === "strong" ? "**" : "__";
      // ISTI state/out kao i ostatak paragrafa (ne poseban buffer) — tako
      // redoslijed ostaje tačan čak i kad nešto iznutra "ispljune" (slika).
      // Marker se ne piše unaprijed: tek nakon rekurzije, ako UNUTAR nije
      // bilo flush-a (nema slike u ovom rasponu), markeri se naknadno
      // umetnu oko tog dijela buffera. Ako JE bilo flush-a (npr. pravi
      // slučaj sa Shopify stranica: "<strong><br><br><img></strong>"),
      // taj dio teksta je već izašao kao običan tekst prije slike — ne
      // pokušavamo ga naknadno boldovati preko granice flush-a, da ne
      // ostane nespareni "**" koji RichText ne bi umio prikazati.
      const markerStart = state.buf.length;
      const outStart = out.length;
      walkParaContent($(el), $, base, out, state);
      if (out.length === outStart) {
        const inner = state.buf.slice(markerStart);
        if (inner.trim()) {
          state.buf = state.buf.slice(0, markerStart) + marker + inner + marker;
        }
      }
      return;
    }
    // ostali inline kontejneri (span, a, font…) — ista "rečenica u toku",
    // samo nastavi u isti buffer
    walkParaContent($(el), $, base, out, state);
  });
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

  if (tag === "img" || tag === "video") {
    pushMedia(out, el, $, base);
    return;
  }

  if (tag === "p" || tag === "li" || tag === "span") {
    // ne silazi dublje kao zaseban "walk" po djeci (izbjegava sjeckanje
    // jedne rečenice u mikro-blokove) — ali SE čita <b>/<strong>/<i>/<em>
    // i slike/video UNUTAR teksta (vidi walkParaContent), ne samo plain tekst.
    const state: ParaState = { buf: "" };
    walkParaContent($(el), $, base, out, state);
    flushPara(out, state);
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
