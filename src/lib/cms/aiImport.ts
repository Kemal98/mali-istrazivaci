import "server-only";

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

const MODEL = "claude-sonnet-5-5";
const CLAUDE_TIMEOUT_MS = 45000;
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

async function callClaude(
  prompt: string
): Promise<{ ok: true; text: string; truncated: boolean } | { ok: false; error: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY nije postavljen." };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), CLAUDE_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        // Dovoljno prostora za CIJELU stranicu (naslov + svi blokovi) —
        // premalo ovdje znači da Claude prekine odgovor NA POLA RIJEČI
        // (viđeno uživo: "1x Cr" umjesto "1x Crawly Crab igračka"), što
        // pokvari baš zadnji dio stranice bez ikakve vidljive greške.
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      const msg = json?.error?.message || `HTTP ${res.status}`;
      return { ok: false, error: msg };
    }
    const text = (json.content ?? [])
      .filter((b: { type?: string }) => b.type === "text")
      .map((b: { text?: string }) => b.text ?? "")
      .join("\n");
    if (!text.trim()) return { ok: false, error: "Claude je vratio prazan odgovor." };
    return { ok: true, text, truncated: json.stop_reason === "max_tokens" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: /abort/i.test(msg) ? "Claude ne odgovara (timeout)." : msg };
  } finally {
    clearTimeout(timer);
  }
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
