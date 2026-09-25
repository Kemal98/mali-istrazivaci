export interface AdSpend {
  id: string;
  date: string; // YYYY-MM-DD
  productName: string;
  amount: number;
  note: string;
  source: "manual" | "meta";
  createdAt: string;
}

/** Koja Meta kampanja puni koji proizvod (vidi ad_campaign_map u schema.sql). */
export interface CampaignMapping {
  campaignId: string;
  campaignName: string;
  /** '' = kampanja još nije mapirana ni na jedan proizvod. */
  productName: string;
  updatedAt: string;
}

export interface StockPurchase {
  id: string;
  date: string;
  productName: string;
  quantity: number;
  totalCost: number;
  note: string;
  createdAt: string;
}
