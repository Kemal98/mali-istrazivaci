import "server-only";

import { callClaude } from "./claude";
import type { ParsedReview } from "./parseReviews";

/**
 * "Povuci recenzije sa linka" — tuđa stranica proizvoda → SVE njene
 * recenzije → prevod na bosanski (Claude). NIŠTA se ne upisuje u bazu
 * ovdje: admin ih pregleda/ispravi u ImportReviewsModal, i tek onda se
 * uvezu (kao SKRIVENE — ne izlaze same na stranicu).
 *
 * Redom se probaju tri izvora, prvi koji vrati recenzije pobjeđuje:
 *  1. Aplikacija za recenzije na Shopify-ju (Rivyo, Ali Reviews) — one
 *     učitavaju recenzije JavaScriptom (nema ih u HTML-u), ali imaju javni
 *     API koji njihov widget zove, pa se zove isti taj API, SA SVIM
 *     stranicama. Shop domen je u HTML-u (Shopify.shop), a ID proizvoda
 *     daje Shopify-jev javni /products/<handle>.js.
 *  2. JSON-LD (schema.org Product.review) — mnogi sajtovi (Judge.me,
 *     WooCommerce, Yotpo…) stavljaju recenzije u stranicu za Google.
 *  3. Claude pročita tekst stranice i izvuče recenzije koje su na njoj
 *     (radi kad su recenzije u HTML-u — WooCommerce i sl.).
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 15000;
const MAX_REVIEWS = 300;
// Prevod ide u paketima PARALELNO — jedan poziv za 300 recenzija bi
// probio i max_tokens i vremensko ograničenje rute (60 s).
const PREVOD_PAKET = 30;
const MAX_TEKST_STRANICE = 40000;

export interface SourceReviewsResult {
  ok: boolean;
  error?: string;
  izvor?: string;
  reviews?: ParsedReview[];
  /** false = prevod (bar dijela) nije uspio, tamo je ostao originalni tekst. */
  prevedeno?: boolean;
  prevodGreska?: string;
}

async function get(url: string, referer?: string): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": UA,
        "Accept-Language": "bs,hr,sr,en;q=0.8",
        ...(referer ? { Referer: referer } : {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function getJson<T>(url: string, referer?: string): Promise<T | null> {
  try {
    const res = await get(url, referer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Claude zna ostaviti poneko ćirilično slovo usred riječi (viđeno uživo:
// "provели") — zato se poslije prevoda ćirilica uvijek prebaci i ovdje.
const CIR: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "đ", е: "e", ж: "ž", з: "z", и: "i",
  ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o", п: "p", р: "r",
  с: "s", т: "t", ћ: "ć", у: "u", ф: "f", х: "h", ц: "c", ч: "č", џ: "dž", ш: "š",
};
function latinica(s: string): string {
  return s.replace(/[Ѐ-ӿ]/g, (ch) => {
    const lat = CIR[ch.toLowerCase()];
    if (lat === undefined) return ch;
    return ch === ch.toLowerCase() ? lat : lat.charAt(0).toUpperCase() + lat.slice(1);
  });
}

function clampRating(n: unknown): number {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(5, Math.max(1, v)) : 5;
}

/* --------------------------- 1. Shopify aplikacije --------------------------- */

interface ShopCtx {
  shop: string; // xxx.myshopify.com
  productId: string;
  handle: string;
  pageUrl: string;
}

/** Rivyo (npr. zabavaonica.com) — straničeno po 6, "last_page" kaže koliko ih ima. */
async function rivyo(ctx: ShopCtx): Promise<ParsedReview[]> {
  type Page = {
    result?: {
      review?: {
        last_page?: number;
        data?: { name?: string; rating?: number; review_title?: string; review_body?: string }[];
      };
    };
  };
  const pageUrl = (page: number) =>
    "https://app.rivyo.com/rivyo-app/V2/get-product-reviews?" +
    new URLSearchParams({
      product_id: ctx.productId,
      product_handle: ctx.handle,
      shop: ctx.shop,
      page_url: ctx.pageUrl,
      page: String(page),
      rating_val: "",
    });

  const first = await getJson<Page>(pageUrl(1), ctx.pageUrl);
  const last = Math.min(first?.result?.review?.last_page ?? 1, Math.ceil(MAX_REVIEWS / 6));
  const pages = [first];
  // Ostale stranice po 10 odjednom — brzo, a ne zatrpa njihov server.
  for (let from = 2; from <= last; from += 10) {
    const to = Math.min(last, from + 9);
    pages.push(
      ...(await Promise.all(
        Array.from({ length: to - from + 1 }, (_, i) => getJson<Page>(pageUrl(from + i), ctx.pageUrl))
      ))
    );
  }
  return pages
    .flatMap((p) => p?.result?.review?.data ?? [])
    .map((r) => {
      const naslov = (r.review_title ?? "").trim();
      const tijelo = (r.review_body ?? "").trim();
      // Rivyo ima zaseban naslov recenzije — kod nas je samo jedan tekst.
      // Kratki naslovi su uglavnom šum ("Olovka", "3D olovka", "Ocena"),
      // pa ide samo naslov od bar 3 riječi.
      const tekst =
        naslov.split(/\s+/).length >= 3 &&
        !tijelo.toLowerCase().startsWith(naslov.toLowerCase())
          ? `${naslov}${/[.!?]$/.test(naslov) ? "" : "."} ${tijelo}`.trim()
          : tijelo;
      return { ime: (r.name ?? "").trim() || "Kupac", rating: clampRating(r.rating), tekst };
    });
}

/** Ali Reviews / Kudosi (npr. igralica.com) — "Load more" šalje after_review_id zadnje recenzije. */
async function aliReviews(ctx: ShopCtx): Promise<ParsedReview[]> {
  type Page = {
    reviews?: { id: string; author?: string; star?: number; content?: string }[];
    has_more?: boolean;
  };
  const out: ParsedReview[] = [];
  let after = "";
  for (let i = 0; i < 80 && out.length < MAX_REVIEWS; i++) {
    const page = await getJson<Page>(
      "https://pub.kudosi.ai/storefront/reviews?" +
        new URLSearchParams({
          shop_domain: ctx.shop,
          product_ids: ctx.productId,
          sort_by: "by_date",
          widget_type: "review_box",
          ...(after ? { after_review_id: after } : {}),
        })
    );
    const rows = page?.reviews ?? [];
    for (const r of rows) {
      out.push({
        ime: (r.author ?? "").trim() || "Kupac",
        rating: clampRating(r.star),
        tekst: (r.content ?? "").trim(),
      });
    }
    if (!page?.has_more || !rows.length) break;
    after = rows[rows.length - 1].id;
  }
  return out;
}

const APLIKACIJE: { naziv: string; prepoznaj: RegExp; povuci: (c: ShopCtx) => Promise<ParsedReview[]> }[] = [
  { naziv: "Rivyo", prepoznaj: /rivyo/i, povuci: rivyo },
  { naziv: "Ali Reviews", prepoznaj: /alireviews|ali-reviews|kudosi/i, povuci: aliReviews },
];

async function izShopifyAplikacije(
  html: string,
  page: URL
): Promise<{ izvor: string; reviews: ParsedReview[] } | null> {
  const handle = page.pathname.match(/\/products\/([^/?#]+)/)?.[1];
  const shop =
    html.match(/Shopify\.shop\s*=\s*"([^"]+\.myshopify\.com)"/)?.[1] ||
    html.match(/shop=([a-z0-9-]+\.myshopify\.com)/i)?.[1];
  const app = APLIKACIJE.find((a) => a.prepoznaj.test(html));
  if (!handle || !shop || !app) return null;

  const product = await getJson<{ id?: number }>(`${page.origin}/products/${handle}.js`);
  if (!product?.id) return null;
  const reviews = await app
    .povuci({
      shop,
      productId: String(product.id),
      handle: decodeURIComponent(handle),
      pageUrl: `${page.origin}${page.pathname}`,
    })
    .catch(() => []);
  return reviews.length ? { izvor: app.naziv, reviews } : null;
}

/* ------------------------------- 2. JSON-LD ------------------------------- */

function izJsonLd(html: string): ParsedReview[] {
  const out: ParsedReview[] = [];
  const seen = new Set<unknown>();
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) return node.forEach(walk);
    const o = node as Record<string, unknown>;
    const type = ([] as unknown[]).concat(o["@type"] ?? []).map(String);
    if (type.includes("Review")) {
      const author = o.author as { name?: string } | string | undefined;
      const rr = (o.reviewRating ?? {}) as { ratingValue?: unknown; bestRating?: unknown };
      const best = Number(rr.bestRating) || 5;
      const tekst = String(o.reviewBody ?? o.description ?? "").trim();
      if (tekst) {
        out.push({
          ime: (typeof author === "string" ? author : author?.name ?? "").trim() || "Kupac",
          rating: clampRating((Number(rr.ratingValue ?? 5) / best) * 5),
          tekst,
        });
      }
    }
    Object.values(o).forEach(walk);
  };
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walk(JSON.parse(m[1]));
    } catch {
      // neispravan JSON-LD na tuđem sajtu — preskoči taj blok
    }
  }
  return out;
}

/* -------------------------- 3. Claude čita stranicu -------------------------- */

function tekstStranice(html: string): string {
  return html
    .replace(/<(script|style|svg|noscript|template|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h\d|\/tr|\/article|\/section)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function parseJsonNiz(text: string): unknown[] | null {
  const a = text.indexOf("[");
  const b = text.lastIndexOf("]");
  if (a < 0 || b < a) return null;
  try {
    const arr = JSON.parse(text.slice(a, b + 1));
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

/** Izvuče I prevede u jednom pozivu — vraća već prevedene recenzije. */
async function claudeCitaStranicu(
  html: string
): Promise<{ ok: true; reviews: ParsedReview[] } | { ok: false; error: string }> {
  let tekst = tekstStranice(html);
  if (tekst.length > MAX_TEKST_STRANICE) {
    // Recenzije su skoro uvijek u donjem dijelu stranice — zadrži početak
    // (naziv proizvoda) i što više kraja.
    tekst = `${tekst.slice(0, 3000)}\n…\n${tekst.slice(-(MAX_TEKST_STRANICE - 3000))}`;
  }
  const prompt = `Ispod je tekst sa stranice proizvoda u online prodavnici. Pronađi SVE recenzije kupaca koje su na njoj (ime, ocjena 1–5, tekst recenzije).

Pravila:
- Samo stvarne recenzije kupaca koje su u tekstu. Ništa ne izmišljaj. Opis proizvoda, pitanja i odgovori, reklame i "ocjena prodavnice" NISU recenzije.
- Tekst recenzije prevedi na bosanski (ijekavica, latinica), prirodno, kako bi roditelj napisao. Ne uljepšavaj, ne skraćuj.
- Ime ostavi kako jeste. Ako ocjena nije navedena, stavi 5.
- Ako recenzija nema, vrati [].

Vrati SAMO JSON niz, bez ikakvog drugog teksta: [{"ime": "...", "ocjena": 5, "tekst": "..."}]

TEKST STRANICE:
${tekst}`;

  const ai = await callClaude(prompt, { maxTokens: 16000, timeoutMs: 55000 });
  if (!ai.ok) return { ok: false, error: ai.error };
  const arr = parseJsonNiz(ai.text);
  if (!arr) return { ok: false, error: "Claude nije vratio recenzije u ispravnom formatu." };
  const reviews = arr
    .map((x) => x as { ime?: unknown; ocjena?: unknown; tekst?: unknown })
    .map((x) => ({
      ime: latinica(String(x.ime ?? "").trim()) || "Kupac",
      rating: clampRating(x.ocjena ?? 5),
      tekst: latinica(String(x.tekst ?? "").trim()),
    }))
    .filter((r) => r.tekst);
  return { ok: true, reviews };
}

/* -------------------------------- prevod -------------------------------- */

async function prevediPaket(tekstovi: string[]): Promise<string[] | string> {
  const prompt = `Prevedi ove recenzije kupaca na bosanski jezik (ijekavica, latinica).

Pravila:
- Zadrži smisao i ton — prirodno, kako bi roditelj napisao u poruci. Ne uljepšavaj, ne dodaji ništa, ne skraćuj.
- Ćirilicu prebaci u latinicu. Ekavicu u ijekavicu (dete → dijete, deca → djeca, lepo → lijepo).
- Valute, gradove i kurirske službe iz Srbije (dinari, Bex, AKS…) ne mijenjaj — samo prevedi.
- Ispravi očite tipfelere i dodaj kvačice (č, ć, š, ž, đ) gdje fale.

Vrati SAMO JSON niz stringova, istim redoslijedom i istog broja elemenata (${tekstovi.length}), bez ikakvog drugog teksta.

${JSON.stringify(tekstovi)}`;

  const ai = await callClaude(prompt, { maxTokens: 8000, timeoutMs: 50000 });
  if (!ai.ok) return ai.error;
  const arr = parseJsonNiz(ai.text);
  if (!arr || arr.length !== tekstovi.length) return "Prevod nije vratio sve recenzije.";
  return arr.map((x) => latinica(String(x ?? "").trim()));
}

async function prevedi(
  reviews: ParsedReview[]
): Promise<{ reviews: ParsedReview[]; greska?: string }> {
  const paketi: ParsedReview[][] = [];
  for (let i = 0; i < reviews.length; i += PREVOD_PAKET) paketi.push(reviews.slice(i, i + PREVOD_PAKET));
  const rez = await Promise.all(paketi.map((p) => prevediPaket(p.map((r) => r.tekst))));
  let greska: string | undefined;
  const out = paketi.flatMap((p, i) => {
    const t = rez[i];
    if (typeof t === "string") {
      greska = t;
      return p; // ovaj paket ostaje original
    }
    return p.map((r, j) => ({ ...r, tekst: t[j] || r.tekst }));
  });
  return { reviews: out, greska };
}

/* -------------------------------- glavno -------------------------------- */

export async function povuciRecenzijeSaLinka(url: string): Promise<SourceReviewsResult> {
  let page: URL;
  try {
    page = new URL(url);
    if (!/^https?:$/.test(page.protocol)) throw new Error("bad protocol");
  } catch {
    return { ok: false, error: "Neispravan link." };
  }

  let html: string;
  try {
    const res = await get(page.toString());
    if (!res.ok) return { ok: false, error: `Sajt je odgovorio sa HTTP ${res.status}.` };
    html = await res.text();
  } catch {
    return { ok: false, error: "Sajt se ne može otvoriti." };
  }

  const izApp = await izShopifyAplikacije(html, page);
  const izLd = izApp ? [] : izJsonLd(html);
  const nadjene = izApp?.reviews ?? izLd;

  if (nadjene.length) {
    const reviews = nadjene.filter((r) => r.tekst).slice(0, MAX_REVIEWS);
    const pr = await prevedi(reviews);
    return {
      ok: true,
      izvor: izApp?.izvor ?? "podaci sa stranice",
      reviews: pr.reviews,
      prevedeno: !pr.greska,
      prevodGreska: pr.greska,
    };
  }

  const ai = await claudeCitaStranicu(html);
  if (!ai.ok) return { ok: false, error: `Nisam uspio pročitati stranicu: ${ai.error}` };
  if (!ai.reviews.length) {
    return {
      ok: false,
      error:
        "Na ovoj stranici nisam našao recenzije. Ako ih vidiš u pregledniku, sajt ih učitava " +
        "posebnim sistemom — pošalji link pa ću dodati podršku za njega.",
    };
  }
  return {
    ok: true,
    izvor: "Claude pročitao stranicu",
    reviews: ai.reviews.slice(0, MAX_REVIEWS),
    prevedeno: true,
  };
}
