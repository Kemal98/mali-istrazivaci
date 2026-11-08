import "server-only";

import { sql } from "@/lib/cms/db";
import { listProducts, listPublishedReviews } from "@/lib/cms/repo";
import { stockSummaryByProduct } from "@/lib/nabavke/repo";
import { PRODUCTS, type Product as LegacyProduct } from "@/lib/products";

type Row = Record<string, unknown>;
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

/**
 * Stare ručno pisane stranice (SAT MIRA, Sparkling Diamond) i dalje imaju
 * red u `products` tabeli (za narudžbe/zalihe), samo im javna stranica
 * nije CMS-generička — "Vesele rotirajuće zvečke" je NAMJERNO izbačena
 * odavde (migrirana u CMS ranije ove sesije, products.json red bi
 * zastario ako se cijena promijeni u adminu, a ovdje se ne čita).
 */
const LEGACY_PRODUCT_ID: Record<string, string> = {
  "/sat-mira": "prod_static_sat_mira",
  "/blinger-aparat-za-kosu": "prod_7c3bfb6823e24d77",
};

export interface UnifiedProduct extends LegacyProduct {
  /** Pravi red u products tabeli (CMS proizvod, ili legacy preko LEGACY_PRODUCT_ID) — null = nema veze (ne učestvuje u rangu/zalihama). */
  resolvedId: string | null;
  /** Aktivne paketne ponude (samo CMS proizvodi mogu imati ovo — vidi posebnePonude). */
  paketiAktivni: boolean;
}

/**
 * Spaja legacy (products.json) i CMS proizvode u JEDNU listu, isti oblik
 * kao prije (HomeProductGrid.tsx) — ali centralizovano, da "Hit
 * proizvodi"/"Posebne ponude" ne duplira ovu logiku triput. CMS proizvod
 * se preskače ako već postoji legacy red sa istim linkom (ista pravila
 * kao do sad).
 */
export async function getUnifiedProducts(): Promise<UnifiedProduct[]> {
  const legacy: UnifiedProduct[] = PRODUCTS.map((p) => ({
    ...p,
    resolvedId: LEGACY_PRODUCT_ID[p.link] ?? null,
    paketiAktivni: false,
  }));
  const existingLinks = new Set(legacy.map((p) => p.link));

  const published = (await listProducts()).filter(
    (p) =>
      p.status === "published" &&
      p.prikaziNaPocetnoj &&
      p.publishedHero &&
      p.publishedData &&
      p.publishedData.cijena !== null &&
      !existingLinks.has(`/${p.slug}`)
  );

  const cms: UnifiedProduct[] = await Promise.all(
    published.map(async (p) => {
      const reviews = await listPublishedReviews(p.id);
      const avg = reviews.length
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : 0;
      return {
        id: p.id,
        naziv: p.publishedData!.naziv,
        podnaslov: "",
        cijena: p.publishedData!.cijena as number,
        staraCijena: p.publishedData!.staraCijena,
        valuta: "KM",
        badge: p.publishedData!.badge || null,
        uzrast: ["2-3", "4-6"],
        kategorije: p.shopKategorija ? [p.shopKategorija] : [],
        slike: [p.publishedHero!.slika],
        ocjena: avg,
        brojRecenzija: reviews.length,
        naStanju: true,
        link: `/${p.slug}`,
        resolvedId: p.id,
        paketiAktivni: p.publishedPaketiAktivni,
      };
    })
  );

  // Legacy proizvod isključen sa početne (prikaziNaPocetnoj se ovdje ne
  // primjenjuje na legacy json — nema tog prekidača za njih, premali broj
  // redova da vrijedi UI za to), pa se legacy lista vraća kompletna.
  return [...legacy, ...cms];
}

function thirtyDaysAgoIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 30);
  return d.toISOString();
}

/**
 * Prodano po proizvodu zadnjih 30 dana. Isti obrazac spajanja po ID-u
 * ILI imenu kao profit.ts — orders.product_id je često NULL za stare
 * ručno pisane stranice (Checkout komponenta ga ne šalje), pa bi
 * GROUP BY product_id sam potcijenio njihovu stvarnu prodaju.
 */
export async function salesQty30d(): Promise<Map<string, number>> {
  const rows = await sql()<Row[]>`
    SELECT COALESCE(pr.id, 'name:' || lower(trim(o.product_name))) AS key,
           SUM(o.quantity) AS qty
      FROM orders o
      LEFT JOIN products pr
        ON pr.deleted_at IS NULL
       AND (pr.id = o.product_id
            OR (o.product_id IS NULL AND lower(trim(pr.naziv)) = lower(trim(o.product_name))))
     WHERE o.deleted_at IS NULL AND o.product_name <> '' AND o.status NOT IN ('CANCELLED', 'RETURNED')
       AND o.created_at >= ${thirtyDaysAgoIso()}
     GROUP BY 1`;
  const map = new Map<string, number>();
  for (const r of rows) map.set(String(r.key), n(r.qty));
  return map;
}

function keyFor(p: UnifiedProduct): string {
  return p.resolvedId ?? `name:${p.naziv.trim().toLowerCase()}`;
}

export interface HitProizvodiResult {
  /** Automatski rang (sold-out gurnut na dno — vidi raspolozivo ispod), nezavisno od ručnog zakucavanja. */
  autoRankedIds: string[];
  /** top 5 po prodaji I minimum 10 komada/30 dana — bedž se računa iz STVARNE prodaje, bez obzira na ručni rang. */
  bestsellerIds: Set<string>;
}

/**
 * Odluka #15: proizvod BEZ ijedne partije u sistemu zaliha se NIKAD ne
 * tretira kao rasprodan (samo nepoznato) — kažnjava se samo onaj koji
 * IMA historiju partija I raspoloživo<=0.
 */
export async function computeHitProizvodi(products: UnifiedProduct[]): Promise<HitProizvodiResult> {
  const [qtyMap, stock] = await Promise.all([salesQty30d(), stockSummaryByProduct()]);
  const stockByProduct = new Map(stock.map((s) => [s.productId, s.raspolozivo]));

  const withQty = products.map((p) => {
    const key = keyFor(p);
    const qty = qtyMap.get(key) ?? 0;
    const hasBatchHistory = p.resolvedId !== null && stockByProduct.has(p.resolvedId);
    const soldOut = hasBatchHistory && (stockByProduct.get(p.resolvedId!) ?? 0) <= 0;
    return { p, qty, soldOut };
  });

  const autoRankedIds = [...withQty]
    .sort((a, b) => Number(a.soldOut) - Number(b.soldOut) || b.qty - a.qty)
    .map((x) => x.p.link);

  const top5 = [...withQty]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
    .filter((x) => x.qty >= 10)
    .map((x) => x.p.link);

  return { autoRankedIds, bestsellerIds: new Set(top5) };
}

/** Odluka #5: automatski — stvarno sniženje ILI aktivan paket (CMS). Radi za legacy i CMS jer oba imaju cijena/staraCijena polja. */
export function posebnePonude(products: UnifiedProduct[]): UnifiedProduct[] {
  return products.filter(
    (p) => (p.staraCijena !== null && p.staraCijena > p.cijena) || p.paketiAktivni
  );
}
