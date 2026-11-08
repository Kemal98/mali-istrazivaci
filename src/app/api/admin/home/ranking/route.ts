import { NextResponse } from "next/server";
import { getUnifiedProducts, computeHitProizvodi } from "@/lib/home/rank";

/** Samo za prikaz uživo u admin editoru — "ovako bi izgledao automatski rang baš sad". */
export async function GET() {
  const all = await getUnifiedProducts();
  const { autoRankedIds, bestsellerIds } = await computeHitProizvodi(all);
  const byLink = new Map(all.map((p) => [p.link, p]));
  const items = autoRankedIds
    .map((link) => byLink.get(link))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .map((p) => ({ link: p.link, naziv: p.naziv, bestseller: bestsellerIds.has(p.link) }));
  return NextResponse.json({ items });
}
