import raw from "@/data/products.json";

export type Product = {
  id: string;
  naziv: string;
  podnaslov: string;
  cijena: number;
  staraCijena: number | null;
  valuta: string;
  badge: string | null;
  uzrast: string[];
  kategorije: string[];
  slike: string[];
  ocjena: number;
  brojRecenzija: number;
  naStanju: boolean;
  link: string;
};

export const PRODUCTS = raw as Product[];

export function getProductsByAge(uzrast: string): Product[] {
  return PRODUCTS.filter((p) => p.uzrast.includes(uzrast));
}
