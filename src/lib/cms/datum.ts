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
