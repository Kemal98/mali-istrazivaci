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

-- Koja Meta kampanja "puni" koji proizvod. Namjerno posebna tabela, ne
-- nagađanje po imenu: kampanja se zove kako se zove u Ads Manageru
-- (vlasnikov izbor), a mi ne smijemo tiho pogrešno spojiti novac na
-- pogrešan proizvod (ista vrsta greške kao "Sparkling Diamond" bug
-- ranije — string-matching po imenu je krhko). product_name === '' znači
-- kampanja još nije mapirana; takva potrošnja se svejedno upiše (vidi
-- meta.ts) pod "Nemapirano: <ime kampanje>" da se novac ne izgubi, dok
-- admin ne mapira i ponovo povuče.
CREATE TABLE IF NOT EXISTS ad_campaign_map (
  campaign_id    text PRIMARY KEY,
  campaign_name  text NOT NULL DEFAULT '',
  product_name   text NOT NULL DEFAULT '',
  updated_at     text NOT NULL
);

ALTER TABLE ad_campaign_map ENABLE ROW LEVEL SECURITY;
