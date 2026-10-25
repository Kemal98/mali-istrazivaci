import "server-only";

import { callClaude } from "./claude";
import type { ParsedReview } from "./parseReviews";

/**
 * "Povuci recenzije sa linka" — tuđa Shopify stranica proizvoda → sve
 * njene recenzije → prevod na bosanski (Claude). NIŠTA se ne upisuje u
 * bazu ovdje: admin ih pregleda/ispravi u ImportReviewsModal, i tek
 * onda se uvezu (kao SKRIVENE — ne izlaze same na stranicu).
 *
 * Recenzije se na tim stranicama učitavaju JavaScriptom iz aplikacije za
 * recenzije (nema ih u HTML-u), ali svaka aplikacija ima javni API koji
 * njen widget zove — pa se zove isti taj API, za svaku podržanu posebno.
 * Shop domen (xxx.myshopify.com) je u HTML-u (Shopify.shop), a ID
 * proizvoda daje Shopify-jev javni /products/<handle>.js.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 15000;
const MAX_REVIEWS = 60;

export interface SourceReviewsResult {
  ok: boolean;
  error?: string;
  izvor?: string;
  reviews?: ParsedReview[];
  /** false = prevod nije uspio, vraćen je originalni tekst. */
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
      headers: { "User-Agent": UA, ...(referer ? { Referer: referer } : {}) },
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

function clampRating(n: unknown): number {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(5, Math.max(1, v)) : 5;
}

/* ------------------------------ aplikacije ------------------------------ */

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
  const last = Math.min(first?.result?.review?.last_page ?? 1, 10);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, last - 1) }, (_, i) => getJson<Page>(pageUrl(i + 2), ctx.pageUrl))
  );
  return [first, ...rest]
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
  for (let i = 0; i < 15 && out.length < MAX_REVIEWS; i++) {
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

// Prepoznate, ali (još) nepodržane — da poruka kaže ŠTA je, ne samo "ne mogu".
const NEPODRZANE: [string, RegExp][] = [
  ["Judge.me", /judge\.me|jdgm/i],
  ["Loox", /loox\.io/i],
  ["Yotpo", /yotpo/i],
  ["Okendo", /okendo/i],
  ["Stamped", /stamped\.io/i],
];

/* -------------------------------- prevod -------------------------------- */

async function prevedi(
  reviews: ParsedReview[]
): Promise<{ ok: true; tekstovi: string[] } | { ok: false; error: string }> {
  const prompt = `Prevedi ove recenzije kupaca na bosanski jezik (ijekavica, latinica).

Pravila:
- Zadrži smisao i ton — prirodno, kako bi roditelj napisao u poruci. Ne uljepšavaj, ne dodaji ništa, ne skraćuj.
- Ćirilicu prebaci u latinicu. Ekavicu u ijekavicu (dete → dijete, deca → djeca, lepo → lijepo).
- Valute, gradove i kurirske službe iz Srbije (dinari, Bex, AKS…) ne mijenjaj — samo prevedi.
- Ispravi očite tipfelere i dodaj kvačice (č, ć, š, ž, đ) gdje fale.

Vrati SAMO JSON niz stringova, istim redoslijedom i istog broja elemenata (${reviews.length}), bez ikakvog drugog teksta.

${JSON.stringify(reviews.map((r) => r.tekst))}`;

  const ai = await callClaude(prompt, { maxTokens: 8000, timeoutMs: 50000 });
  if (!ai.ok) return { ok: false, error: ai.error };
  const a = ai.text.indexOf("[");
  const b = ai.text.lastIndexOf("]");
  try {
    const arr = JSON.parse(ai.text.slice(a, b + 1));
    if (!Array.isArray(arr) || arr.length !== reviews.length) {
      return { ok: false, error: "Prevod nije vratio sve recenzije." };
    }
    return { ok: true, tekstovi: arr.map((x) => String(x ?? "").trim()) };
  } catch {
    return { ok: false, error: "Prevod nije u ispravnom formatu." };
  }
}

/* -------------------------------- glavno -------------------------------- */

export async function povuciRecenzijeSaLinka(url: string): Promise<SourceReviewsResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) throw new Error("bad protocol");
  } catch {
    return { ok: false, error: "Neispravan link." };
  }
  const handle = parsed.pathname.match(/\/products\/([^/?#]+)/)?.[1];
  if (!handle) {
    return { ok: false, error: "Link mora biti stranica proizvoda (…/products/…)." };
  }

  let html: string;
  try {
    const res = await get(parsed.toString());
    if (!res.ok) return { ok: false, error: `Sajt je odgovorio sa HTTP ${res.status}.` };
    html = await res.text();
  } catch {
    return { ok: false, error: "Sajt se ne može otvoriti." };
  }

  const shop =
    html.match(/Shopify\.shop\s*=\s*"([^"]+\.myshopify\.com)"/)?.[1] ||
    html.match(/shop=([a-z0-9-]+\.myshopify\.com)/i)?.[1];
  if (!shop) return { ok: false, error: "To nije Shopify prodavnica — za sad podržavam samo Shopify." };

  const app = APLIKACIJE.find((a) => a.prepoznaj.test(html));
  if (!app) {
    const poznata = NEPODRZANE.find(([, re]) => re.test(html))?.[0];
    return {
      ok: false,
      error: poznata
        ? `Ovaj sajt koristi ${poznata} za recenzije — to još ne podržavam (za sad: Rivyo, Ali Reviews).`
        : "Na ovoj stranici nisam našao recenzije (ili koristi sistem koji ne podržavam).",
    };
  }

  const product = await getJson<{ id?: number }>(`${parsed.origin}/products/${handle}.js`);
  if (!product?.id) return { ok: false, error: "Ne mogu pročitati ID proizvoda sa sajta." };

  const ctx: ShopCtx = {
    shop,
    productId: String(product.id),
    handle: decodeURIComponent(handle),
    pageUrl: `${parsed.origin}${parsed.pathname}`,
  };
  const reviews = (await app.povuci(ctx).catch(() => []))
    .filter((r) => r.tekst)
    .slice(0, MAX_REVIEWS);
  if (!reviews.length) {
    return { ok: false, error: `Sajt koristi ${app.naziv}, ali ovaj proizvod nema recenzija.` };
  }

  const pr = await prevedi(reviews);
  if (!pr.ok) {
    return { ok: true, izvor: app.naziv, reviews, prevedeno: false, prevodGreska: pr.error };
  }
  return {
    ok: true,
    izvor: app.naziv,
    reviews: reviews.map((r, i) => ({ ...r, tekst: pr.tekstovi[i] || r.tekst })),
    prevedeno: true,
  };
}
