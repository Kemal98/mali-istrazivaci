// Parsiranje recenzija zalijepljenih iz browsera (npr. selektuj+kopiraj
// sa Amazon stranice proizvoda). NIJE server-only — čist tekst parser,
// koristi ga i admin UI direktno u browseru za trenutni pregled.
//
// Amazon ne pušta automatsko čitanje recenzija (učitavaju se preko
// JavaScripta, nema ih u sirovom HTML-u), pa admin ručno selektuje i
// kopira tekst recenzija sa stranice — ovo pretvara taj zalijepljeni
// tekst u listu {ime, ocjena, tekst}, koju admin pregleda/ispravi PRIJE
// nego što se bilo šta upiše u bazu.

export interface ParsedReview {
  ime: string;
  rating: number;
  tekst: string;
}

const STARS_RE = /(\d(?:[.,]\d)?)\s+out of 5 stars?/i;
const DATE_RE = /^Reviewed in .+ on /i;
const SKIP_LINE_RE =
  /^(verified purchase|helpful|report|\d+\s+people found this helpful|comment|\|)$/i;

const TEMPLATE_NAME_RE = /^ime\s*:/i;
const TEMPLATE_RATING_RE = /^ocjena\s*:/i;
const TEMPLATE_TEXT_RE = /^tekst\s*:/i;

/**
 * Dva podržana ulazna oblika:
 *  1. Prirodan copy-paste sa Amazona (traži "N out of 5 stars" kao
 *     sidro za svaku recenziju).
 *  2. Eksplicitan predložak (Ime: / Ocjena: / Tekst:, prazan red ili
 *     "---" između recenzija) — za ostale sajtove bez tog obrasca.
 */
export function parsePastedReviews(raw: string): ParsedReview[] {
  const lines = raw.split("\n").map((l) => l.trim());
  if (lines.some((l) => TEMPLATE_NAME_RE.test(l))) {
    return parseTemplate(lines);
  }
  return parseAmazonCopy(lines);
}

function parseTemplate(lines: string[]): ParsedReview[] {
  const out: ParsedReview[] = [];
  let ime = "";
  let rating = 5;
  let tekst = "";
  let inText = false;

  const flush = () => {
    if (tekst.trim()) out.push({ ime: ime || "Kupac", rating, tekst: tekst.trim() });
    ime = "";
    rating = 5;
    tekst = "";
    inText = false;
  };

  for (const line of lines) {
    if (line === "---") {
      flush();
      continue;
    }
    if (TEMPLATE_NAME_RE.test(line)) {
      flush();
      ime = line.replace(TEMPLATE_NAME_RE, "").trim();
      continue;
    }
    if (TEMPLATE_RATING_RE.test(line)) {
      const n = Number(line.replace(TEMPLATE_RATING_RE, "").trim());
      rating = Number.isFinite(n) ? Math.min(5, Math.max(1, Math.round(n))) : 5;
      continue;
    }
    if (TEMPLATE_TEXT_RE.test(line)) {
      tekst = line.replace(TEMPLATE_TEXT_RE, "").trim();
      inText = true;
      continue;
    }
    if (inText && line) tekst += ` ${line}`;
  }
  flush();
  return out;
}

function parseAmazonCopy(lines: string[]): ParsedReview[] {
  const anchors: number[] = [];
  lines.forEach((l, i) => {
    if (STARS_RE.test(l)) anchors.push(i);
  });
  if (!anchors.length) return [];

  // Prvo nađi GDJE je "ime" red za svako sidro (najbliži neprazan red
  // prije njega) — pa te redove izuzmi iz TEKSTA prethodne recenzije.
  // Bez ovoga, ime SLJEDEĆE recenzije upadne na kraj teksta prethodne
  // (stoji odmah prije njenog "N out of 5 stars", unutar istog raspona).
  const nameLineByAnchor = new Map<number, number>();
  for (const idx of anchors) {
    for (let j = idx - 1; j >= 0; j--) {
      const l = lines[j];
      if (!l) continue;
      if (!STARS_RE.test(l) && !DATE_RE.test(l)) nameLineByAnchor.set(idx, j);
      break;
    }
  }
  const reservedNameLines = new Set(nameLineByAnchor.values());

  const out: ParsedReview[] = [];
  for (let a = 0; a < anchors.length; a++) {
    const idx = anchors[a];
    const nextAnchor = anchors[a + 1] ?? lines.length;
    const m = lines[idx].match(STARS_RE)!;
    const rating = Math.min(5, Math.max(1, Math.round(Number(m[1].replace(",", ".")))));

    const nameLine = nameLineByAnchor.get(idx);
    const ime =
      nameLine !== undefined && lines[nameLine].length <= 60 ? lines[nameLine] : "Kupac";

    // Tekst: sve između ove i sljedeće ocjene, bez datum-linije, dugmića
    // i reda koji je ime SLJEDEĆE recenzije.
    const body: string[] = [];
    for (let j = idx + 1; j < nextAnchor; j++) {
      const l = lines[j];
      if (!l || DATE_RE.test(l) || SKIP_LINE_RE.test(l) || reservedNameLines.has(j)) continue;
      body.push(l);
    }
    const tekst = body.join(" ").trim();
    if (tekst) out.push({ ime, rating, tekst });
  }
  return out;
}
