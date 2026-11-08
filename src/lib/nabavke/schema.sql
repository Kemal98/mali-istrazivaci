-- Zalihe i nabavke: prave PARTIJE nabavke (ne flat ledger kao stari
-- stock_purchases u ads/schema.sql), s dokumentacijom, statusom i FIFO
-- potrošnjom po narudžbi. Zamjenjuje stock_purchases kao model istine za
-- zalihe — stara tabela OSTAJE netaknuta (historijski podaci, nikad se ne
-- briše), novi kod je prosto više ne koristi (vidi migrate-nabavke-legacy.mjs
-- za jednokratno prebacivanje starih redova ovamo).
--
-- Pokreće se sa `npm run cms:migrate` (idempotentno, ista konvencija kao
-- ostali schema.sql fajlovi).

CREATE TABLE IF NOT EXISTS nabavke_partije (
  id                   text PRIMARY KEY,
  product_id           text NOT NULL REFERENCES products (id),
  dobavljac            text NOT NULL DEFAULT '',
  datum_nabavke        text NOT NULL,              -- YYYY-MM-DD

  nabavljeno_kolicina  integer NOT NULL,            -- originalna količina u partiji
  preostalo            integer NOT NULL,            -- koliko je još ostalo iz OVE partije (FIFO se oslanja na ovo)

  cijena_po_komadu     double precision NOT NULL DEFAULT 0,
  dodatni_troskovi     double precision NOT NULL DEFAULT 0,   -- carina/prevoz i sl., razvodnjeno po komadu u consume.ts

  -- dokumentacija
  tip_dokumenta        text NOT NULL DEFAULT 'nedostaje',      -- 'racun' | 'fiskalni' | 'otpremnica' | 'ostalo' | 'nedostaje'
  broj_dokumenta       text NOT NULL DEFAULT '',
  datum_dokumenta      text,
  dokument_url         text,                        -- Supabase Storage key, NULL = nema priloženog fajla (upload je opcionalan)

  napomena             text NOT NULL DEFAULT '',

  -- status: nedokumentovana roba NIKAD ne postaje "spremno" automatski —
  -- promjena statusa ide kroz posebnu, namjernu akciju u adminu (vidi
  -- nabavke_status_log), ne proizvoljnim klikom.
  status               text NOT NULL DEFAULT 'ceka_dokumentaciju',

  -- 'manual' = ručno unesena nabavka; 'legacy_import' = uvezeno iz starog
  -- stock_purchases sistema (vidi migrate-nabavke-legacy.mjs)
  origin               text NOT NULL DEFAULT 'manual',

  created_at           text NOT NULL,
  updated_at           text NOT NULL,

  CONSTRAINT nabavke_partije_status_chk CHECK (status IN
    ('ceka_dokumentaciju','dokumentacija_zaprimljena','ceka_provjeru','spremno','neaktivno')),
  CONSTRAINT nabavke_partije_tip_dok_chk CHECK (tip_dokumenta IN
    ('racun','fiskalni','otpremnica','ostalo','nedostaje')),
  CONSTRAINT nabavke_partije_preostalo_chk CHECK (preostalo >= 0 AND preostalo <= nabavljeno_kolicina)
);

CREATE INDEX IF NOT EXISTS idx_nabavke_partije_product ON nabavke_partije (product_id, datum_nabavke);
CREATE INDEX IF NOT EXISTS idx_nabavke_partije_status  ON nabavke_partije (status);

-- Revizijski trag promjena statusa — SAMO datum/vrijeme, bez "ko" polja
-- (jedna zajednička admin lozinka, nema pojedinačnih korisnika u sistemu).
CREATE TABLE IF NOT EXISTS nabavke_status_log (
  id          text PRIMARY KEY,
  batch_id    text NOT NULL REFERENCES nabavke_partije (id) ON DELETE CASCADE,
  created_at  text NOT NULL,
  old_status  text NOT NULL DEFAULT '',
  new_status  text NOT NULL,
  napomena    text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_nabavke_status_log_batch ON nabavke_status_log (batch_id, created_at DESC);

-- FIFO potrošnja: koja narudžba je povukla koliko iz koje partije.
-- batch_id NULL = "nepokriveno" (nema spremne partije u trenutku narudžbe),
-- cost pada na trenutnu products.nabavna_cijena (isti fallback kao danas u
-- profit.ts). Redovi se NIKAD ne brišu — otkazivanje/vraćanje narudžbe
-- samo markira reversed_at i vraća količinu u partiju (vidi consume.ts).
CREATE TABLE IF NOT EXISTS nabavke_potrosnja (
  id           text PRIMARY KEY,
  order_id     text NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  batch_id     text REFERENCES nabavke_partije (id),
  quantity     integer NOT NULL,
  unit_cost    double precision NOT NULL DEFAULT 0,
  created_at   text NOT NULL,
  reversed_at  text
);

CREATE INDEX IF NOT EXISTS idx_nabavke_potrosnja_order ON nabavke_potrosnja (order_id);
CREATE INDEX IF NOT EXISTS idx_nabavke_potrosnja_batch ON nabavke_potrosnja (batch_id);

-- Ručne korekcije: manjak/višak/oštećena/povrat/otpis. Vezane na konkretnu
-- partiju gdje ima smisla (manjak/oštećena/otpis smanjuju preostalo te
-- partije). VIŠAK nikad direktno ne uveća postojeću partiju — upisuje NOVU
-- nabavke_partije sa status='ceka_dokumentaciju' i tu novu partiju
-- referencira kao batch_id (popisni višak se ne pretvara proizvoljnim
-- klikom u "spremno za prodaju"). POVRAT se rješava kroz reverseConsumption
-- na narudžbi (consume.ts), ne ovdje — ova tabela je samo za slučaj da roba
-- NIJE za ponovnu prodaju (ostecena/otpis), odvojena namjerna radnja.
CREATE TABLE IF NOT EXISTS nabavke_korekcije (
  id          text PRIMARY KEY,
  product_id  text NOT NULL REFERENCES products (id),
  batch_id    text REFERENCES nabavke_partije (id),
  vrsta       text NOT NULL,     -- 'manjak' | 'visak' | 'ostecena' | 'povrat' | 'otpis'
  kolicina    integer NOT NULL,  -- uvijek pozitivan broj; predznak se izvodi iz 'vrsta'
  razlog      text NOT NULL,     -- obavezno polje — svaka korekcija mora imati razlog
  created_at  text NOT NULL,

  CONSTRAINT nabavke_korekcije_vrsta_chk CHECK (vrsta IN
    ('manjak','visak','ostecena','povrat','otpis')),
  CONSTRAINT nabavke_korekcije_kolicina_chk CHECK (kolicina > 0)
);

CREATE INDEX IF NOT EXISTS idx_nabavke_korekcije_product ON nabavke_korekcije (product_id);
CREATE INDEX IF NOT EXISTS idx_nabavke_korekcije_batch   ON nabavke_korekcije (batch_id);

-- Pristup ide isključivo serverski (direktna konekcija / service ključ).
-- RLS uključen bez policy-a = svaki pristup iz browsera je odbijen i da
-- neko dobije anon ključ (isti obrazac kao svuda u projektu).
ALTER TABLE nabavke_partije    ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabavke_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabavke_potrosnja  ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabavke_korekcije  ENABLE ROW LEVEL SECURITY;
