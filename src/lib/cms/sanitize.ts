import { Block, BlockType, BLOCK_LABELS, Hero, Seo, defaultHero } from "./types";
import { publicUrlPrefix } from "./storage";

// Server-side sanitizacija. Podacima iz admin UI-a se NE VJERUJE —
// sve prolazi kroz ovo prije upisa u bazu.
//
// Rich text se NIKAD ne renderuje kao HTML (nema dangerouslySetInnerHTML),
// pa nema XSS vektora iz teksta. Bold/italic se pišu kao **bold** /
// *italic* i renderer ih pretvara u React elemente.

const MAX_TEXT = 8000;
const MAX_SHORT = 300;

export function str(v: unknown, max = MAX_SHORT): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max);
}

export function longStr(v: unknown): string {
  return str(v, MAX_TEXT);
}

export function bool(v: unknown): boolean {
  return v === true || v === "true" || v === 1 || v === "1";
}

export function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Bijela lista izvora slika/videa. Dozvoljeno je samo:
 *  - interne putanje iz repoa (/img/..., /video/..., stari /uploads/...)
 *  - javni URL NAŠEG Supabase Storage bucketa
 * Sve ostalo (bilo koji vanjski domen) se odbacuje, da admin UI ne može
 * ubaciti hotlink na tuđi server ni tracking piksel.
 */
export function mediaUrl(v: unknown): string {
  const s = str(v, 500);
  if (!s) return "";
  if (/^\/(uploads|img|video)\//.test(s)) return s;
  const prefix = publicUrlPrefix();
  if (prefix && s.startsWith(prefix)) return s;
  return "";
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  const s = typeof v === "string" ? v : "";
  return (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
}

/** #rgb ili #rrggbb — bilo šta drugo (uklj. prazno) postaje "" = bez boje. */
function hexColor(v: unknown): string {
  const s = typeof v === "string" ? v.trim() : "";
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s) ? s : "";
}

function strList(v: unknown, maxItems = 40): string[] {
  if (!Array.isArray(v)) return [];
  return v.slice(0, maxItems).map((x) => str(x, 500)).filter((x) => x.length > 0);
}

export function sanitizeHero(v: unknown): Hero {
  const raw = (v ?? {}) as Record<string, unknown>;
  const d = defaultHero();
  return {
    slika: mediaUrl(raw.slika),
    galerija: Array.isArray(raw.galerija)
      ? raw.galerija.slice(0, 12).map((g) => {
          const o = (g ?? {}) as Record<string, unknown>;
          return { url: mediaUrl(o.url), alt: str(o.alt) };
        }).filter((g) => g.url)
      : [],
    naslovLinija1: str(raw.naslovLinija1),
    naslovLinija2: str(raw.naslovLinija2),
    prikaziCijenu: raw.prikaziCijenu === undefined ? d.prikaziCijenu : bool(raw.prikaziCijenu),
    prikaziBadge: raw.prikaziBadge === undefined ? d.prikaziBadge : bool(raw.prikaziBadge),
    prikaziRating: bool(raw.prikaziRating),
    ratingTekst: str(raw.ratingTekst),
    ratingVrijednost: str(raw.ratingVrijednost, 10),
    ratingBrojOcjena: str(raw.ratingBrojOcjena, 10),
    ctaTekst: str(raw.ctaTekst) || d.ctaTekst,
    prikaziCtaPodtekst: bool(raw.prikaziCtaPodtekst),
    ctaPodtekst: str(raw.ctaPodtekst),
    alt: str(raw.alt),
  };
}

export function sanitizeSeo(v: unknown): Seo {
  const raw = (v ?? {}) as Record<string, unknown>;
  return {
    title: str(raw.title, 200),
    description: str(raw.description, 400),
    ogTitle: str(raw.ogTitle, 200),
    ogDescription: str(raw.ogDescription, 400),
    ogImage: mediaUrl(raw.ogImage),
    canonical: str(raw.canonical, 300),
  };
}

export function sanitizeSections(v: unknown): Block[] {
  if (!Array.isArray(v)) return [];
  const out: Block[] = [];
  for (const item of v.slice(0, 120)) {
    const raw = (item ?? {}) as Record<string, unknown>;
    const type = raw.type as BlockType;
    if (!type || !(type in BLOCK_LABELS)) continue;
    out.push({
      id: str(raw.id, 64) || Math.random().toString(36).slice(2, 12),
      type,
      hidden: bool(raw.hidden),
      data: sanitizeBlockData(type, raw.data),
    });
  }
  return out;
}

function sanitizeBlockData(type: BlockType, v: unknown): Record<string, unknown> {
  const r = (v ?? {}) as Record<string, unknown>;
  switch (type) {
    case "naslov":
      return {
        tekst: longStr(r.tekst),
        velicina: oneOf(r.velicina, ["S", "M", "L", "XL"] as const, "L"),
        bold: r.bold === undefined ? true : bool(r.bold),
        align: oneOf(r.align, ["left", "center", "right"] as const, "center"),
        istaknutoBoja: hexColor(r.istaknutoBoja),
      };
    case "tekst":
      return {
        tekst: longStr(r.tekst),
        velicina: oneOf(r.velicina, ["", "S", "M", "L", "XL"] as const, ""),
        bold: bool(r.bold),
        align: oneOf(r.align, ["left", "center", "right"] as const, "center"),
        istaknutoBoja: hexColor(r.istaknutoBoja),
      };
    case "naslov_tekst":
      return {
        naslov: longStr(r.naslov),
        tekst: longStr(r.tekst),
        bold: r.bold === undefined ? true : bool(r.bold),
        align: oneOf(r.align, ["left", "center", "right"] as const, "center"),
        istaknutoBoja: hexColor(r.istaknutoBoja),
      };
    case "slika":
    case "gif":
      return {
        url: mediaUrl(r.url),
        alt: str(r.alt),
        radius: r.radius === undefined ? true : bool(r.radius),
        fullWidth: bool(r.fullWidth),
        caption: str(r.caption, 400),
      };
    case "video":
      return {
        url: mediaUrl(r.url),
        autoplay: bool(r.autoplay),
        muted: r.muted === undefined ? true : bool(r.muted),
        loop: bool(r.loop),
        controls: r.controls === undefined ? true : bool(r.controls),
      };
    case "slika_tekst":
      return {
        url: mediaUrl(r.url),
        alt: str(r.alt),
        naslov: longStr(r.naslov),
        tekst: longStr(r.tekst),
        layout: oneOf(
          r.layout,
          ["img-top", "text-top", "img-left", "img-right"] as const,
          "img-top"
        ),
        radius: r.radius === undefined ? true : bool(r.radius),
      };
    case "social_proof":
      return {
        linija1: str(r.linija1, 200),
        zvjezdice: str(r.zvjezdice, 40),
        linija2: str(r.linija2, 200),
      };
    case "benefiti":
    case "koraci":
      return { naslov: str(r.naslov), items: strList(r.items) };
    case "u_kutiji":
      return {
        naslov: str(r.naslov),
        items: strList(r.items),
        napomena: str(r.napomena, 400),
      };
    case "trust":
      return {
        naslov: str(r.naslov),
        items: strList(r.items),
        badge: str(r.badge, 200),
      };
    case "cta":
      return {
        naslov: str(r.naslov),
        opis: str(r.opis, 400),
        ctaTekst: str(r.ctaTekst, 60),
      };
    case "spacer":
      return { size: oneOf(r.size, ["S", "M", "L"] as const, "M") };
    case "galerija":
      return {
        items: Array.isArray(r.items)
          ? r.items.slice(0, 24).map((g) => {
              const o = (g ?? {}) as Record<string, unknown>;
              return { url: mediaUrl(o.url), alt: str(o.alt) };
            }).filter((g) => g.url)
          : [],
      };
    case "recenzije":
      return {
        naslov: str(r.naslov),
        prikaziOcjenu: r.prikaziOcjenu === undefined ? true : bool(r.prikaziOcjenu),
        ratingVrijednost: str(r.ratingVrijednost, 10),
        ratingBrojOcjena: str(r.ratingBrojOcjena, 10),
      };
    case "divider":
      return {};
    default:
      return {};
  }
}
