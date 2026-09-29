import "server-only";
import { sql } from "@/lib/cms/db";
import { META_USD_TO_KM } from "./currency";
import { profitAsIfSold, productAlerts } from "@/lib/orders/profit";

type Row = Record<string, unknown>;
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));
const r2 = (v: number) => Math.round(v * 100) / 100;
const norm = (v: string) => v.trim().toLowerCase();

export interface CampaignAnalysisRow {
  campaignName: string;
  productName: string;
  /** Prazno = kampanja nije mapirana ni na jedan proizvod (vidi ad_campaign_map). */
  unmapped: boolean;
  spend7d: number;
  spend30d: number;
  spendAll: number;
  /** Prihod/profit/ROAS su za CIJELI proizvod (sve kampanje na taj proizvod zajedno) —
   *  ne može se pouzdanije razdvojiti po kampanji jer narudžbe ne nose campaign_id. */
  productRevenue: number;
  productProfit: number;
  roas: number | null;
  noSaleDays: number | null;
  verdict: "stop" | "watch" | "loss" | "good";
  verdictLabel: string;
}

export interface CampaignAnalysis {
  rows: CampaignAnalysisRow[];
  totalSpend7d: number;
  totalSpend30d: number;
  totalSpendAll: number;
  manualSpendAll: number;
}

/**
 * Kampanja po kampanja: koliko je koja potrošila (7d/30d/sve vrijeme) i da
 * li se to proizvodu na koji je vezana isplati. `note` kolona u ad_spend
 * čuva "Meta Ads — <ime kampanje>" (upisano u upsertMetaAdSpend), pa se
 * odatle vadi ime bez potrebe za novom kolonom u bazi.
 *
 * Prihod/profit se gleda na nivou PROIZVODA, ne pojedinačne kampanje —
 * narudžbe ne nose campaign_id, pa kad dvije kampanje ciljaju isti
 * proizvod ne može se pouzdano reći koja je od njih dovela koju prodaju.
 */
export async function campaignAnalysis(): Promise<CampaignAnalysis> {
  const db = sql();

  const today = new Date().toISOString().slice(0, 10);
  const d7 = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
  const d30 = new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10);

  const rows = await db<Row[]>`
    SELECT note, product_name,
           COALESCE(SUM(amount) FILTER (WHERE date >= ${d7}), 0) AS s7,
           COALESCE(SUM(amount) FILTER (WHERE date >= ${d30}), 0) AS s30,
           COALESCE(SUM(amount), 0) AS sall
      FROM ad_spend
     WHERE source = 'meta'
     GROUP BY note, product_name`;

  const manualRow = await db<Row[]>`
    SELECT COALESCE(SUM(amount), 0) AS total FROM ad_spend WHERE source = 'manual'`;

  const profit = await profitAsIfSold({}, "2000-01-01", "2100-01-01");
  const byProduct = new Map(profit.rows.map((r) => [norm(r.productName), r]));

  const alerts = await productAlerts(2);
  const noSaleByProduct = new Map(
    alerts.filter((a) => a.kind === "no_sale").map((a) => [norm(a.productName), a.days ?? 2])
  );

  const out: CampaignAnalysisRow[] = [];
  let totalSpend7d = 0;
  let totalSpend30d = 0;
  let totalSpendAll = 0;

  for (const r of rows) {
    const note = String(r.note ?? "");
    const campaignName = note.startsWith("Meta Ads — ") ? note.slice("Meta Ads — ".length) : note || "(nepoznato)";
    const rawProductName = String(r.product_name ?? "");
    const unmapped = rawProductName.startsWith("Nemapirano:") || !rawProductName;
    const productName = unmapped
      ? rawProductName.replace(/^Nemapirano:\s*/, "") || campaignName
      : rawProductName;

    const spend7d = r2(n(r.s7) * META_USD_TO_KM);
    const spend30d = r2(n(r.s30) * META_USD_TO_KM);
    const spendAll = r2(n(r.sall) * META_USD_TO_KM);
    totalSpend7d += spend7d;
    totalSpend30d += spend30d;
    totalSpendAll += spendAll;

    const prod = unmapped ? undefined : byProduct.get(norm(productName));
    const productRevenue = prod?.revenue ?? 0;
    const productProfit = prod?.profit ?? 0;
    const roas = prod && prod.adSpend > 0 ? r2(prod.revenue / prod.adSpend) : null;
    const noSaleDays = noSaleByProduct.get(norm(productName)) ?? null;

    let verdict: CampaignAnalysisRow["verdict"];
    let verdictLabel: string;
    if (unmapped) {
      verdict = "watch";
      verdictLabel = "🔗 Nemapirano — poveži sa proizvodom u „Troškovi reklama“";
    } else if (noSaleDays) {
      verdict = "stop";
      verdictLabel = `❌ Gasi — troši ${noSaleDays === 1 ? "1 dan" : `${noSaleDays} dana`} bez ijedne prodaje`;
    } else if (productProfit < 0) {
      verdict = "loss";
      verdictLabel = "⚠️ Proizvod u minusu sve vrijeme — razmisli o gašenju";
    } else if (roas !== null && roas >= 3) {
      verdict = "good";
      verdictLabel = `✅ Nastavi — ROAS ${roas}×`;
    } else if (roas !== null && roas >= 1.5) {
      verdict = "watch";
      verdictLabel = `🔎 Prati — ROAS ${roas}×, solidno ali ne odlično`;
    } else {
      verdict = "watch";
      verdictLabel = roas !== null ? `⚠️ Nizak povrat — ROAS ${roas}×` : "🔎 Nema dovoljno podataka";
    }

    out.push({
      campaignName,
      productName,
      unmapped,
      spend7d,
      spend30d,
      spendAll,
      productRevenue: r2(productRevenue),
      productProfit: r2(productProfit),
      roas,
      noSaleDays,
      verdict,
      verdictLabel,
    });
  }

  const verdictOrder: Record<CampaignAnalysisRow["verdict"], number> = {
    stop: 0,
    loss: 1,
    watch: 2,
    good: 3,
  };
  out.sort((a, b) => verdictOrder[a.verdict] - verdictOrder[b.verdict] || b.spend30d - a.spend30d);

  return {
    rows: out,
    totalSpend7d: r2(totalSpend7d),
    totalSpend30d: r2(totalSpend30d),
    totalSpendAll: r2(totalSpendAll),
    manualSpendAll: r2(n(manualRow[0]?.total)),
  };
}
