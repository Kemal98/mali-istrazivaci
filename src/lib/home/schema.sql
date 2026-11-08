-- Sadržaj početne stranice. Isti obrazac kao products.hero/sections vs
-- published_hero/published_sections — DRAFT se uređuje slobodno u
-- adminu (/admin/pocetna), javna stranica čita SAMO published (snapshot
-- iz trenutka "Objavi"). Jedan JSON blob po stanju (ne kolona po polju)
-- jer ništa od sadržaja početne ne treba kolonarni upit/filter.
--
-- JEDAN red (id='home') — nema smisla više redova, cijela tabela postoji
-- samo da draft/published budu dvije jasno odvojene kolone.
CREATE TABLE IF NOT EXISTS home_content (
  id            text PRIMARY KEY DEFAULT 'home',
  draft         text NOT NULL DEFAULT '{}',
  published     text,
  updated_at    text NOT NULL,
  published_at  text
);

-- Pristup ide isključivo serverski (direktna konekcija / service ključ).
-- RLS uključen bez policy-a = svaki pristup iz browsera je odbijen i da
-- neko dobije anon ključ (isti obrazac kao svuda u projektu).
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
