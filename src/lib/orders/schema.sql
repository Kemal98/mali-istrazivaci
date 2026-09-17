-- Narudžbe. Pokreće se sa `npm run cms:migrate` (idempotentno).
--
-- Konvencije preuzete iz postojeće cms/schema.sql, namjerno:
--   * id-evi su text (ord_…, evt_…) — čitljivi u logovima
--   * vremena su TEXT sa ISO stringom (ISO se ispravno sortira
--     leksikografski, pa ORDER BY radi, a prikaz ide kroz istu funkciju)
--   * novac je double precision (isto kao products.cijena)

-- Broj narudžbe (MI-000001). Sequence je jedini način da dvije paralelne
-- narudžbe ne dobiju isti broj — brojanje redova (COUNT+1) bi puklo pod
-- konkurentnim requestima.
CREATE SEQUENCE IF NOT EXISTS orders_number_seq START 1;

CREATE TABLE IF NOT EXISTS orders (
  id                 text PRIMARY KEY,
  order_number       text NOT NULL UNIQUE,
  created_at         text NOT NULL,
  updated_at         text NOT NULL,

  -- kupac
  customer_name      text NOT NULL DEFAULT '',
  phone              text NOT NULL DEFAULT '',
  -- samo cifre, bez 00387/+387 prefiksa — za pretragu i deduplikaciju
  phone_normalized   text NOT NULL DEFAULT '',
  email              text NOT NULL DEFAULT '',
  city               text NOT NULL DEFAULT '',
  address            text NOT NULL DEFAULT '',
  postal_code        text NOT NULL DEFAULT '',
  note               text NOT NULL DEFAULT '',

  -- proizvod (jedna narudžba = jedan proizvod, kako shop trenutno radi)
  product_id         text,
  product_name       text NOT NULL DEFAULT '',
  quantity           integer NOT NULL DEFAULT 1,
  unit_price         double precision NOT NULL DEFAULT 0,

  -- novac: dostava se vodi ODVOJENO od cijene proizvoda
  subtotal           double precision NOT NULL DEFAULT 0,
  shipping_price     double precision NOT NULL DEFAULT 0,
  discount           double precision NOT NULL DEFAULT 0,
  total_price        double precision NOT NULL DEFAULT 0,

  payment_method     text NOT NULL DEFAULT 'pouzecem',
  status             text NOT NULL DEFAULT 'NEW',

  -- dostava / kurir (struktura spremna za kasniju API integraciju)
  courier            text NOT NULL DEFAULT '',
  tracking_number    text NOT NULL DEFAULT '',
  shipping_status    text NOT NULL DEFAULT '',
  shipped_at         text,
  delivered_at       text,

  -- marketing
  utm_source         text NOT NULL DEFAULT '',
  utm_medium         text NOT NULL DEFAULT '',
  utm_campaign       text NOT NULL DEFAULT '',
  utm_content        text NOT NULL DEFAULT '',
  utm_term           text NOT NULL DEFAULT '',
  fbclid             text NOT NULL DEFAULT '',
  landing_page       text NOT NULL DEFAULT '',
  referrer           text NOT NULL DEFAULT '',

  -- Google Sheets sync (baza je primarna, Sheet je kopija)
  sheet_synced       boolean NOT NULL DEFAULT false,
  sheet_synced_at    text,
  sheet_error        text NOT NULL DEFAULT '',
  sheet_attempts     integer NOT NULL DEFAULT 0,

  -- porijeklo zapisa: 'web' (sa sajta) ili 'import' (iz starog Sheeta)
  source             text NOT NULL DEFAULT 'web',

  -- zaštita od duplih narudžbi: klijent pošalje isti ključ na retry/dupli
  -- klik, UNIQUE ga odbije i vrati postojeću narudžbu
  idempotency_key    text UNIQUE,
  -- zaštita od duplikata pri importu starih redova iz Sheeta
  import_hash        text UNIQUE,

  -- za rate limiting i dijagnostiku (ne prikazuje se kupcu)
  client_ip          text NOT NULL DEFAULT '',

  deleted_at         text,

  CONSTRAINT orders_status_chk CHECK (status IN
    ('NEW','CONFIRMED','PACKING','SHIPPED','DELIVERED','RETURNED','CANCELLED'))
);

-- Dodano naknadno, isto idempotentno kao gore.
--
-- Nabavna cijena u trenutku prodaje (fotografija products.nabavna_cijena,
-- ne referenca) — ako se cijena kod dobavljača poslije promijeni, stare
-- narudžbe zadrže tačan profit. cost_price je po komadu (kao unit_price),
-- cost_total = cost_price * quantity (kao subtotal). Nula znači "nepoznato"
-- (proizvod bez productId-a ili bez unesene nabavne cijene), ne "besplatno".
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_price double precision NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cost_total double precision NOT NULL DEFAULT 0;

-- Indeksi za filtere i pretragu iz admin tabele
CREATE INDEX IF NOT EXISTS idx_orders_created   ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_product   ON orders (product_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone     ON orders (phone_normalized);
CREATE INDEX IF NOT EXISTS idx_orders_utm       ON orders (utm_source);
CREATE INDEX IF NOT EXISTS idx_orders_city      ON orders (city);
CREATE INDEX IF NOT EXISTS idx_orders_unsynced  ON orders (sheet_synced)
  WHERE sheet_synced = false AND deleted_at IS NULL;

-- Audit log: svaka promjena statusa / tracking broja ostaje zapisana
CREATE TABLE IF NOT EXISTS order_events (
  id          text PRIMARY KEY,
  order_id    text NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  created_at  text NOT NULL,
  kind        text NOT NULL,           -- 'created' | 'status' | 'field' | 'sheet'
  field       text NOT NULL DEFAULT '',
  old_value   text NOT NULL DEFAULT '',
  new_value   text NOT NULL DEFAULT '',
  actor       text NOT NULL DEFAULT 'admin',
  note        text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_order_events_order
  ON order_events (order_id, created_at DESC);

-- Pristup ide isključivo serverski (direktna konekcija / service ključ).
-- RLS uključen bez policy-a = svaki pristup iz browsera je odbijen i da
-- neko dobije anon ključ.
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
