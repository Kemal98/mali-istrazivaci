-- Šema CMS-a za Supabase (Postgres).
-- Pokreće se JEDNOM: `npm run cms:migrate` (ili copy-paste u Supabase SQL Editor).
--
-- Namjerno:
--  * id-evi su text (prod_…, blk_…, med_…) — isti format kao dosad, čitljivi u logovima
--  * hero/seo/sections su TEXT sa JSON-om, ne jsonb — aplikacija radi JSON.stringify/parse
--    sama, pa nema dvostruke konverzije ni iznenađenja pri čitanju
--  * created_at/updated_at su TEXT sa ISO stringom — ISO se sortira ispravno
--    leksikografski, pa ORDER BY radi, a datum se svuda prikazuje istom funkcijom

CREATE TABLE IF NOT EXISTS products (
  id                  text PRIMARY KEY,
  naziv               text NOT NULL DEFAULT '',
  slug                text NOT NULL,
  sku                 text NOT NULL DEFAULT '',
  kategorija          text NOT NULL DEFAULT '',
  status              text NOT NULL DEFAULT 'draft',
  cijena              double precision,
  stara_cijena        double precision,
  badge               text NOT NULL DEFAULT '',
  hero                text NOT NULL DEFAULT '{}',
  seo                 text NOT NULL DEFAULT '{}',
  sections            text NOT NULL DEFAULT '[]',
  published_hero      text,
  published_sections  text,
  published_data      text,
  created_at          text NOT NULL,
  updated_at          text NOT NULL,
  published_at        text,
  deleted_at          text
);

-- Jedinstven slug, ali samo među NEobrisanim proizvodima.
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_live
  ON products (slug) WHERE deleted_at IS NULL;

-- Dodano naknadno (nakon prve verzije šeme) — CREATE TABLE IF NOT EXISTS
-- gore ne dira već postojeću tabelu, zato ALTER + IF NOT EXISTS, isto
-- idempotentno, sigurno se pokreće više puta.
--
-- Koliko je vlasnik platio dobavljaču za JEDAN komad — nikad se ne
-- prikazuje kupcu, samo u adminu, za pravi profit (prihod - nabavna
-- cijena - reklame). Svaka narudžba "fotografiše" ovu vrijednost u
-- trenutku prodaje (orders.cost_price), pa promjena ovdje ne mijenja
-- retroaktivno stare izvještaje.
ALTER TABLE products ADD COLUMN IF NOT EXISTS nabavna_cijena double precision;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shop_kategorija text NOT NULL DEFAULT '';

-- Paketne ponude ("1 set – 19 KM", "2 seta – 34 KM"…) — isti obrazac kao
-- hero/sections: NACRT (paketi) se uređuje slobodno u adminu, a javna
-- stranica čita SAMO published_paketi (snapshot iz trenutka "Objavi",
-- vidi publishProduct). paketi_aktivni je prekidač "uključeno/isključeno"
-- po proizvodu — kad je isključeno ili je lista prazna, proizvod se
-- prikazuje i prodaje potpuno kao bez ove funkcije (ništa se ne mijenja).
ALTER TABLE products ADD COLUMN IF NOT EXISTS paketi_aktivni boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS paketi text NOT NULL DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS published_paketi_aktivni boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS published_paketi text;

-- Redizajn početne (2026-11-08): admin prekidač da se proizvod isključi
-- sa početne stranice (rasprodaje se i dalje normalno na svojoj
-- stranici, samo se ne nudi na listama/rangiranju na početnoj).
ALTER TABLE products ADD COLUMN IF NOT EXISTS prikazi_na_pocetnoj boolean NOT NULL DEFAULT true;

-- Admin ručno bira koje STVARNE recenzije idu u traku na početnoj
-- (ne sve objavljene — početna treba par najjačih, ne cijelu listu).
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS featured_homepage boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_updated
  ON products (updated_at DESC);

CREATE TABLE IF NOT EXISTS media (
  id          text PRIMARY KEY,
  filename    text NOT NULL,
  url         text NOT NULL,
  alt         text NOT NULL DEFAULT '',
  mime        text NOT NULL DEFAULT '',
  size        integer NOT NULL DEFAULT 0,
  storage_key text NOT NULL DEFAULT '',
  created_at  text NOT NULL,
  deleted_at  text
);

CREATE TABLE IF NOT EXISTS reviews (
  id          text PRIMARY KEY,
  product_id  text REFERENCES products (id) ON DELETE SET NULL,
  ime         text NOT NULL DEFAULT '',
  inicijal    text NOT NULL DEFAULT '',
  rating      integer NOT NULL DEFAULT 5,
  tekst       text NOT NULL DEFAULT '',
  verified    boolean NOT NULL DEFAULT true,
  slika       text NOT NULL DEFAULT '',
  datum       text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'published',
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  text NOT NULL,
  deleted_at  text
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);

CREATE TABLE IF NOT EXISTS templates (
  id          text PRIMARY KEY,
  naziv       text NOT NULL,
  hero        text NOT NULL DEFAULT '{}',
  sections    text NOT NULL DEFAULT '[]',
  is_default  boolean NOT NULL DEFAULT false,
  created_at  text NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key    text PRIMARY KEY,
  value  text NOT NULL
);

-- VAŽNO (sigurnost): ovim tabelama se pristupa ISKLJUČIVO sa servera, preko
-- service_role ključa / direktne konekcije. Anon ključ se nikad ne koristi.
-- RLS je uključen sa nula policy-a, pa je svaki pristup iz browsera odbijen
-- i kad bi neko dobio anon ključ.
ALTER TABLE products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE media     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews   ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings  ENABLE ROW LEVEL SECURITY;
