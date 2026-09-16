import type { OrderAttribution } from "./types";

/**
 * Marketing atribucija na klijentu.
 *
 * Problem koji rješava: kupac klikne Facebook oglas sa ?utm_source=facebook,
 * padne na /rotirajuce-zvecke, pa ode na početnu, pa se vrati i tek onda
 * naruči. U tom trenutku u URL-u NEMA više UTM parametara — da ih ne
 * čuvamo, svaka takva narudžba bi izgledala kao "direct".
 *
 * Zato se prvi viđeni izvor zapamti i drži 30 dana (standardni
 * atribucijski prozor), i NE prepisuje se praznim vrijednostima kad
 * korisnik dalje šeta po sajtu bez UTM-ova.
 */

const KEY = "mi_attr";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dana

interface Stored extends OrderAttribution {
  savedAt: number;
}

function read(): Stored | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    // private mode / blokiran storage — atribucija je "nice to have",
    // nikad ne smije srušiti stranicu ni checkout
    return null;
  }
}

function write(v: Stored) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* ignoriši */
  }
}

/** Pozvati jednom po učitavanju stranice (radi to UtmCapture). */
export function captureAttribution() {
  if (typeof window === "undefined") return;

  const p = new URLSearchParams(window.location.search);
  const fresh: OrderAttribution = {
    utmSource: p.get("utm_source") || undefined,
    utmMedium: p.get("utm_medium") || undefined,
    utmCampaign: p.get("utm_campaign") || undefined,
    utmContent: p.get("utm_content") || undefined,
    utmTerm: p.get("utm_term") || undefined,
    fbclid: p.get("fbclid") || undefined,
  };

  const hasNew = Object.values(fresh).some(Boolean);
  const existing = read();

  // Nema novih parametara i već imamo zapamćen izvor -> ne diraj ga.
  if (!hasNew && existing) return;

  if (hasNew) {
    // Novi klik sa oglasa pregazi stari izvor (zadnji klik je relevantan).
    write({
      ...fresh,
      landingPage: window.location.pathname + window.location.search,
      referrer: document.referrer || "",
      savedAt: Date.now(),
    });
    return;
  }

  // Prvi dolazak bez UTM-ova: zapamti barem referrer i landing stranicu,
  // da znamo je li došao sa Google pretrage, Instagrama, ili direktno.
  write({
    landingPage: window.location.pathname + window.location.search,
    referrer: document.referrer || "",
    savedAt: Date.now(),
  });
}

/** Poziva checkout pri slanju narudžbe. */
export function getAttribution(): OrderAttribution {
  const stored = read();
  if (!stored) {
    return typeof window === "undefined"
      ? {}
      : {
          landingPage: window.location.pathname,
          referrer: document.referrer || "",
        };
  }
  return {
    utmSource: stored.utmSource,
    utmMedium: stored.utmMedium,
    utmCampaign: stored.utmCampaign,
    utmContent: stored.utmContent,
    utmTerm: stored.utmTerm,
    fbclid: stored.fbclid,
    landingPage: stored.landingPage,
    referrer: stored.referrer,
  };
}

/**
 * Grupiše izvor u kanal za dashboard (facebook / instagram / google /
 * direct / other). Radi i kad UTM-a nema — onda gleda referrer.
 */
export function channelOf(a: {
  utmSource?: string;
  referrer?: string;
}): string {
  const src = (a.utmSource || "").toLowerCase();
  if (src) {
    if (/fb|facebook|meta/.test(src)) return "facebook";
    if (/ig|instagram/.test(src)) return "instagram";
    if (/google|adwords|gads/.test(src)) return "google";
    if (/tiktok/.test(src)) return "tiktok";
    return src;
  }
  const ref = (a.referrer || "").toLowerCase();
  if (!ref) return "direct";
  if (/facebook|fb\./.test(ref)) return "facebook";
  if (/instagram/.test(ref)) return "instagram";
  if (/google/.test(ref)) return "google";
  if (/tiktok/.test(ref)) return "tiktok";
  return "other";
}
