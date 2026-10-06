import { normalizePhone } from "./phone";

/**
 * Čista logika pretvaranja podataka za A2B izvoz — odvojena od
 * generisanja .xlsx fajla (a2bExport.ts) da se može testirati bez
 * exceljs-a i bez baze. Vidi a2bFormat.test.ts za primjere.
 */

export interface SplitAddress {
  ulica: string;
  /** number = upisuje se kao broj u Excel; string = upisuje se kao tekst (3a, 29/1, bb). */
  broj: number | string;
}

/**
 * Razdvaja kućni broj sa kraja adrese u posebno polje.
 *
 * Prepoznaje: gole cifre (18), cifre+slovo (3a, 97b), cifre/cifre
 * (29/1), "bb" (bilo koja kombinacija velikih/malih slova). Ispred
 * broja smije stajati "br" ili "br." — to se briše. Ako adresa sadrži
 * riječ "kod" (npr. "kod broja 18") ili se ne završava prepoznatljivim
 * brojem, cijela adresa ostaje u "ulica", "broj" je prazan — bolje
 * ne razdvojiti nego pogrešno razdvojiti.
 */
export function splitAddress(raw: string): SplitAddress {
  const address = (raw ?? "").trim();
  if (!address) return { ulica: "", broj: "" };
  if (/\bkod\b/i.test(address)) return { ulica: address, broj: "" };

  const m = address.match(/^(.*?)[\s,]+(?:br\.?\s*)?(\d+[a-zA-Z]?(?:\/\d+)?|bb)$/i);
  if (!m) return { ulica: address, broj: "" };

  const ulica = m[1].trim();
  const brojRaw = m[2];
  if (!ulica) return { ulica: address, broj: "" };

  if (/^bb$/i.test(brojRaw)) return { ulica, broj: "bb" };
  if (/^\d+$/.test(brojRaw)) return { ulica, broj: Number(brojRaw) };
  return { ulica, broj: brojRaw };
}

/**
 * Telefon za A2B: samo cifre, uvijek sa jednom vodećom nulom
 * ("+38761400866" / "0038761400866" / "38761400866" / "061 400 866" ->
 * "061400866"). Piše se uvijek kao TEKST u exceljs (numFmt "@"), da
 * Excel ne pojede vodeću nulu.
 */
export function phoneForA2B(raw: string): string {
  const digits = normalizePhone(raw); // skida sve osim cifara + 387/00387 prefiks + vodeće nule
  return digits ? `0${digits}` : (raw ?? "").trim();
}

export interface CityAndPostal {
  city: string;
  postalCode: string;
}

/**
 * Poštanski broj SAMO iz stvarnih podataka — ništa iz tabele/nagađanja:
 *  1) ako je postalCode već upisan na narudžbi, koristi njega
 *  2) inače, ako grad sadrži petocifreni broj na početku ili kraju
 *     ("Doboj 74000", "75240 lopare"), izvuci ga i očisti ime grada
 *  3) inače prazno — admin ga ručno dopiše
 */
export function extractPostalCode(city: string, existingPostalCode: string): CityAndPostal {
  const existing = (existingPostalCode ?? "").trim();
  const rawCity = (city ?? "").trim();
  if (existing) return { city: rawCity, postalCode: existing };

  const trailing = rawCity.match(/^(.*\S)[\s,]+(\d{5})$/);
  if (trailing) {
    return { city: capitalize(trailing[1].trim()), postalCode: trailing[2] };
  }
  const leading = rawCity.match(/^(\d{5})[\s,]+(\S.*)$/);
  if (leading) {
    return { city: capitalize(leading[2].trim()), postalCode: leading[1] };
  }
  return { city: rawCity, postalCode: "" };
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** "1" -> "1,000", "0.5" -> "0,500". Nepoznata (undefined) težina -> "1,000". */
export function formatWeight(kg?: number | null): string {
  const v = kg === undefined || kg === null || Number.isNaN(kg) ? 1 : kg;
  return v.toFixed(3).replace(".", ",");
}

/** "29" -> "29,00", "79.99" -> "79,99". */
export function formatMoney(v: number): string {
  return v.toFixed(2).replace(".", ",");
}
