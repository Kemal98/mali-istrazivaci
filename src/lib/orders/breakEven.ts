// NAMJERNO bez uvoza iz profit.ts (taj fajl uvozi @/lib/cms/db, koji
// uvozi `postgres` paket — da se ovo koristi iz klijentske komponente
// (ProductProfitTable.tsx), Next bi pokušao ubaciti cijeli DB drajver u
// browser bundle i build bi pao). Ovo je čista funkcija bez zavisnosti,
// sigurna i za server i za klijent.

export interface BreakEvenInput {
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface BreakEven {
  kind: "covered" | "none" | "needed";
  /** Samo kod kind === "needed". */
  units?: number;
}

/**
 * Koliko JOŠ komada treba prodati da se pokrije dosadašnja potrošnja na
 * reklame za taj proizvod. Margina po komadu = prihod/kom − nabavna/kom
 * (BEZ reklame — reklama je ono što se pokriva).
 *   "covered" — profit je već ≥ 0, reklame su pokrivene.
 *   "none"    — margina po komadu nije pozitivna, prodaja količine to
 *               nikad neće pokriti (treba podići cijenu ili smanjiti trošak).
 *   "needed"  — treba prodati još `units` komada po trenutnoj marži.
 */
export function breakEven(p: BreakEvenInput): BreakEven {
  if (p.profit >= 0) return { kind: "covered" };
  const marginPerUnit = p.quantity > 0 ? (p.revenue - p.cost) / p.quantity : 0;
  if (marginPerUnit <= 0) return { kind: "none" };
  return { kind: "needed", units: Math.ceil(Math.abs(p.profit) / marginPerUnit) };
}
