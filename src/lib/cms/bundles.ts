/**
 * Prepoznaje eksplicitni broj seta/pakovanja na početku naziva paketa.
 * Ostatak teksta se ne tumači jer može sadržavati broj fizičkih komada,
 * npr. "2 seta (6 zvečki)".
 */
export function declaredPackQuantity(name: string): number | null {
  const match = name.match(
    /^\s*(\d+)\s*(?:x\b|set(?:a|ova|ovi)?\b|paket(?:a|i|u)?\b|pakovanj(?:e|a|ima)?\b)/i
  );
  return match ? Number(match[1]) : null;
}

/** Ispravlja samo jasan nesklad između početnog broja paketa i količine. */
export function withCorrectBundleQuantity<T extends { naziv: string; kolicina: number }>(
  bundle: T
): T {
  const declared = declaredPackQuantity(bundle.naziv);
  return declared !== null && declared !== bundle.kolicina
    ? { ...bundle, kolicina: declared }
    : bundle;
}