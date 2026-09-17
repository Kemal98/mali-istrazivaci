-- Ručni unos dnevnog troška reklama, po proizvodu.
--
-- Zašto poseban proizvod-po-red, ne jedan ukupan broj dnevno: vlasnik
-- vodi odvojene FB kampanje po proizvodu i želi profit PO PROIZVODU, ne
-- samo ukupno (vidi CONTEXT.md — "Nabavna cijena").
--
-- Zašto product_name (tekst), ne product_id: isti obrazac kao
-- orders.product_name / topProducts() grupisanje — dashboard već grupiše
-- prodaju po nazivu, pa trošak mora grupisati po istom ključu da bi se
-- mogli sabrati u jednu tabelu bez JOIN-a na products.
--
-- Kad kasnije stigne automatsko povlačenje iz Meta Ads API-ja (faza 5),
-- puni istu tabelu (source='meta') umjesto ručnog reda (source='manual')
-- — dashboard se ne mijenja, samo odakle redovi dolaze.
CREATE TABLE IF NOT EXISTS ad_spend (
  id            text PRIMARY KEY,
  date          text NOT NULL,              -- YYYY-MM-DD, kalendarski dan (Europe/Sarajevo)
  product_name  text NOT NULL DEFAULT '',
  amount        double precision NOT NULL DEFAULT 0,
  note          text NOT NULL DEFAULT '',
  source        text NOT NULL DEFAULT 'manual',   -- 'manual' | 'meta'
  created_at    text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ad_spend_date    ON ad_spend (date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_spend_product ON ad_spend (product_name);

ALTER TABLE ad_spend ENABLE ROW LEVEL SECURITY;
