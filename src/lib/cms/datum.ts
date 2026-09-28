// Datum za admin liste.
//
// NE koristi toLocaleString("bs-BA"): Node i browser imaju različite ICU
// verzije, pa je server renderovao "14. 09. 2026. u 01:29" a klijent
// "2026-09-14 01:29" -> hydration mismatch. Zato se dijelovi uzimaju
// pojedinačno (numerički, stabilni u svakom ICU-u) i sami sastavljaju,
// uz eksplicitnu zonu, da server i klijent daju identičan string.
const FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Sarajevo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function datum(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const parts = FMT.formatToParts(d);
  const g = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "";
  return `${g("day")}.${g("month")}.${g("year")}. u ${g("hour")}:${g("minute")}`;
}

const DATE_ONLY_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Sarajevo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * YYYY-MM-DD za dati trenutak, u Sarajevu — NE `d.toISOString().slice(0,10)`
 * (to je UTC dan, koji je do 2h iza Sarajeva). Server je na Vercelu u UTC-u,
 * pa je "danas" u ta dva računa različit dan par sati dnevno (npr. 00-02h
 * po Sarajevu je i dalje "juče" po UTC-u) — ista greška koja je popravljena
 * u CSV importu (importer.ts sarajevoToIso), ovdje u suprotnom smjeru.
 */
export function sarajevoDateOnly(d: Date = new Date()): string {
  const parts = DATE_ONLY_FMT.formatToParts(d);
  const g = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}`;
}

/**
 * Ponoć u Sarajevu (kao UTC trenutak) za dan koji sadrži `d` — NE
 * `d.setHours(0,0,0,0)`, jer to koristi vremensku zonu procesa (na
 * Vercelu UTC), ista greška kao gore. Koristi se za granice perioda
 * (dashboard "Danas", 7/30 dana) da se poklapa sa SQL upitima koji
 * eksplicitno konvertuju u Europe/Sarajevo (npr. dailySeries, profitByDay).
 */
export function sarajevoStartOfDay(d: Date = new Date()): Date {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Sarajevo",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const g = (t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === t)?.value ?? 0);
  // "Koliko je sati u Sarajevu" pretvoreno nazad u UTC millis daje offset.
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  const offsetMs = asUtc - d.getTime();
  const localMs = d.getTime() + offsetMs;
  const local = new Date(localMs);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - offsetMs);
}
