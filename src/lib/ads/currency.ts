// Meta ad nalog je u USD (provjereno preko Graph API-ja), a sve ostalo u
// shopu je u KM. Meta redovi se u bazi čuvaju u USD kako ih Meta vrati, a
// u KM se pretvaraju pri čitanju — promjena kursa tako preračuna sve, i
// historiju. Kurs se može podesiti env varijablom META_USD_TO_KM.
export const META_USD_TO_KM = Number(process.env.META_USD_TO_KM) || 1.75;

export function adAmountKm(amount: number, source: string): number {
  return source === "meta" ? amount * META_USD_TO_KM : amount;
}
