// Bosanska deklinacija uz broj: 1 ocjena, 2–4 ocjene, 5+ ocjena,
// 22 ocjene (gleda se zadnja cifra, osim 11–14).
// Zato što se broj ocjena/recenzija unosi u adminu, tekst ne može biti
// hardkodiran u jedninu ili množinu.
export function plural(
  n: number,
  one: string,
  few: string,
  many: string
): string {
  const abs = Math.abs(Math.trunc(n));
  const d = abs % 10;
  const dd = abs % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 4 && !(dd >= 12 && dd <= 14)) return few;
  return many;
}

export function ocjene(n: number): string {
  return plural(n, "ocjena", "ocjene", "ocjena");
}

export function recenzije(n: number): string {
  return plural(n, "recenzija", "recenzije", "recenzija");
}
