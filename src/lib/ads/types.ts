export interface AdSpend {
  id: string;
  date: string; // YYYY-MM-DD
  productName: string;
  amount: number;
  note: string;
  source: "manual" | "meta";
  createdAt: string;
}
