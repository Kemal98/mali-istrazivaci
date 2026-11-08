import { str, bool, mediaUrl, longStr } from "@/lib/cms/sanitize";
import {
  CATEGORY_KEYS,
  HOME_SECTION_KEYS,
  defaultHomeContent,
  type CategoryTile,
  type FaqItem,
  type HomeContent,
  type HomeSection,
} from "./types";

function sanitizeGalerija(v: unknown): { url: string; alt: string }[] {
  if (!Array.isArray(v)) return [];
  const out: { url: string; alt: string }[] = [];
  for (const item of v.slice(0, 6)) {
    const raw = (item ?? {}) as Record<string, unknown>;
    const url = mediaUrl(raw.url);
    if (!url) continue;
    out.push({ url, alt: str(raw.alt, 140) });
  }
  return out;
}

/** Uvijek vraća TAČNO 5 redova, jedan po CategoryKey — popuni nedostajuće iz defaulta. */
function sanitizeKategorijeTiles(v: unknown): CategoryTile[] {
  const byKey = new Map<string, Record<string, unknown>>();
  if (Array.isArray(v)) {
    for (const item of v) {
      const raw = (item ?? {}) as Record<string, unknown>;
      const k = str(raw.kategorija, 20);
      if ((CATEGORY_KEYS as readonly string[]).includes(k)) byKey.set(k, raw);
    }
  }
  return CATEGORY_KEYS.map((kategorija) => {
    const raw = byKey.get(kategorija);
    if (!raw) {
      return defaultHomeContent().kategorijeTiles.find((t) => t.kategorija === kategorija)!;
    }
    return {
      kategorija,
      slika: mediaUrl(raw.slika),
      alt: str(raw.alt, 140),
      prikazi: bool(raw.prikazi),
    };
  });
}

/** Uvijek vraća svih 9 poznatih sekcija — nepoznate ključeve odbacuje, nedostajuće dodaje na kraj. */
function sanitizeSections(v: unknown): HomeSection[] {
  const byKey = new Map<string, boolean>();
  if (Array.isArray(v)) {
    for (const item of v) {
      const raw = (item ?? {}) as Record<string, unknown>;
      const key = str(raw.key, 20);
      if ((HOME_SECTION_KEYS as readonly string[]).includes(key) && !byKey.has(key)) {
        byKey.set(key, bool(raw.prikazi));
      }
    }
  }
  const ordered = [...byKey.keys()];
  for (const key of HOME_SECTION_KEYS) if (!byKey.has(key)) ordered.push(key);
  return ordered.map((key) => ({
    key: key as HomeSection["key"],
    prikazi: byKey.get(key) ?? false,
  }));
}

function sanitizeFaq(v: unknown): FaqItem[] {
  if (!Array.isArray(v)) return [];
  const out: FaqItem[] = [];
  for (const item of v.slice(0, 20)) {
    const raw = (item ?? {}) as Record<string, unknown>;
    const pitanje = str(raw.pitanje, 200);
    if (!pitanje) continue;
    out.push({
      id: str(raw.id, 40) || `faq_${Math.random().toString(36).slice(2, 10)}`,
      pitanje,
      odgovor: longStr(raw.odgovor),
    });
  }
  return out;
}

function sanitizePinned(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const item of v.slice(0, 12)) {
    const id = str(item, 64);
    if (id) out.push(id);
  }
  return out;
}

export function sanitizeHomeContent(raw: unknown): HomeContent {
  const r = (raw ?? {}) as Record<string, unknown>;
  const d = defaultHomeContent();
  return {
    heroNaslov: str(r.heroNaslov, 200) || d.heroNaslov,
    heroPodnaslov: longStr(r.heroPodnaslov) || d.heroPodnaslov,
    heroCtaTekst: str(r.heroCtaTekst, 60) || d.heroCtaTekst,
    heroGalerija: sanitizeGalerija(r.heroGalerija),
    kategorijeTiles: sanitizeKategorijeTiles(r.kategorijeTiles),
    sections: sanitizeSections(r.sections),
    hitProizvodiPinned: sanitizePinned(r.hitProizvodiPinned),
    faq: sanitizeFaq(r.faq),
  };
}
