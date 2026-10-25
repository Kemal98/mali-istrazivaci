import "server-only";

import { callClaude } from "./claude";
import { createProduct, updateProduct } from "./repo";
import { scrapeProductPage, type ScrapeResult } from "./scrape";
import { SABLONI, napraviPrompt, popuniStranicu, sablonHero, sablonSekcije } from "./sabloni";

/**
 * "AI uvoz proizvoda" — jedan korak umjesto dva: link + izabrani šablon
 * (vidi sabloni.ts) ide u Claude, odgovor se automatski raspoređuje u
 * sekcije (isti parser kao ručni "Popuni iz Claude-a" u editoru, samo
 * se poziv Claude-u radi ovdje server-side preko API ključa, ne kroz
 * kopiranje između admina i Claude chata).
 *
 * Slike se NAMJERNO ne diraju — ni hero, ni slika/gif mjesta u šablonu.
 * Admin ih uvijek sam ručno bira u editoru (na izričit zahtjev — ranije
 * je ovo automatski navlačilo slike sa izvora, nije se koristilo).
 */

const MAX_SCRAPED_CHARS = 6000;

/** Pretvori scrape rezultat u čitljiv tekst koji ide Claude-u umjesto golog linka. */
function scrapedContentForPrompt(scraped: ScrapeResult): string {
  const parts: string[] = [];
  if (scraped.title) parts.push(`NASLOV SA IZVORA: ${scraped.title}`);
  if (scraped.description) parts.push(`OPIS SA IZVORA: ${scraped.description}`);
  const structText = (scraped.structure ?? [])
    .filter((it) => it.kind === "heading" || it.kind === "text")
    .map((it) => it.text)
    .filter(Boolean)
    .join("\n");
  if (structText) parts.push(`OSTATAK TEKSTA SA STRANICE:\n${structText}`);
  const joined = parts.join("\n\n");
  return joined.slice(0, MAX_SCRAPED_CHARS);
}

export interface AiImportResult {
  ok: boolean;
  error?: string;
  productId?: string;
  popunjeno?: string[];
  nedostaje?: string[];
  /** Nacrt je napravljen, ali AI popunjavanje nije uspjelo — admin dovršava ručno. */
  aiError?: string;
  /** Claude-ov odgovor je dosegao max_tokens — zadnja sekcija (U_KUTIJI/NAPOMENA) je možda skraćena. */
  truncated?: boolean;
}

export async function aiImportProduct(
  url: string,
  sablonKljuc: string
): Promise<AiImportResult> {
  const def = SABLONI.find((s) => s.kljuc === sablonKljuc);
  if (!def) return { ok: false, error: "Nepoznat šablon." };

  const scraped = await scrapeProductPage(url);
  if (!scraped.ok) return { ok: false, error: scraped.error };

  const product = await createProduct({ naziv: scraped.title || def.naziv });
  const hero = sablonHero(scraped.title || product.naziv);
  const sections = sablonSekcije(def);
  await updateProduct(product.id, { hero, sections });

  const prompt = napraviPrompt(sections).replace(
    "[OVDJE ZALIJEPI LINK ILI OPIS PROIZVODA]",
    scrapedContentForPrompt(scraped) || url
  );

  const ai = await callClaude(prompt);
  if (!ai.ok) {
    return { ok: true, productId: product.id, aiError: ai.error };
  }

  const result = popuniStranicu(ai.text, hero, sections);
  // Admin-naziv (lista proizvoda, slug već postoji pa se ne mijenja) se
  // sinhronizuje sa AI-prevedenim naslovom — bez ovoga ostaje engleski
  // naziv sa izvora (npr. "The Crawly Crab™") iako je stranica na bosanskom.
  const noviNaziv = result.hero.naslovLinija1 || product.naziv;
  await updateProduct(product.id, {
    naziv: noviNaziv,
    hero: result.hero,
    sections: result.sections,
  });

  return {
    ok: true,
    productId: product.id,
    popunjeno: result.popunjeno,
    nedostaje: result.nedostaje,
    truncated: ai.truncated,
  };
}

/** Da li je ANTHROPIC_API_KEY podešen — admin UI koristi ovo da zna prikazati li dugme. */
export function aiImportConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
