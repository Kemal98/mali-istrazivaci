/**
 * Normalizacija BiH telefona za pretragu i deduplikaciju.
 *
 * Isti broj kupci upišu na desetak načina — svi ovi moraju biti
 * pretraživi kao jedan:
 *   061 123 456   -> 61123456
 *   061123456     -> 61123456
 *   +38761123456  -> 61123456
 *   0038761123456 -> 61123456
 *   38761123456   -> 61123456
 *   061/123-456   -> 61123456
 *
 * ORIGINAL se uvijek čuva neizmijenjen (kolona `phone`) — ovo ide samo u
 * `phone_normalized`, da admin pretraga i provjera duplikata rade.
 */
export function normalizePhone(raw: string): string {
  if (!raw) return "";

  // sve osim cifara van (razmaci, /, -, (), +)
  let d = String(raw).replace(/\D/g, "");

  // međunarodni prefiksi za BiH
  if (d.startsWith("00387")) d = d.slice(5);
  else if (d.startsWith("387")) d = d.slice(3);

  // vodeća nula lokalnog formata (061… -> 61…)
  if (d.startsWith("0")) d = d.replace(/^0+/, "");

  return d;
}

/** Osnovna provjera da broj izgleda kao BiH mobilni/fiksni. */
export function looksLikeBHPhone(raw: string): boolean {
  const d = normalizePhone(raw);
  // BiH brojevi bez prefiksa su 8 cifara (6xxxxxxx mobilni, 3x/5x fiksni).
  // Namjerno blago: cilj je odbiti smeće, ne odbiti pravog kupca.
  return d.length >= 7 && d.length <= 10;
}
