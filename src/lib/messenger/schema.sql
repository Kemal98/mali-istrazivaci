-- Messenger + Instagram DM inbox (samo čitanje poruka u adminu, bez
-- slanja odgovora — vidi webhook u api/webhooks/messenger). Pokreće se
-- sa `npm run cms:migrate` (idempotentno).

CREATE TABLE IF NOT EXISTS messenger_messages (
  id            text PRIMARY KEY,
  -- Meta-in message id (mid) — UNIQUE da webhook retry ne napravi duplikat.
  mid           text UNIQUE,
  psid          text NOT NULL DEFAULT '',  -- Page/Instagram-Scoped ID pošiljaoca
  sender_name   text NOT NULL DEFAULT '',  -- iz Graph API lookup-a, best-effort
  text          text NOT NULL DEFAULT '',
  created_at    text NOT NULL,
  read_at       text,
  platform      text NOT NULL DEFAULT 'messenger'  -- 'messenger' | 'instagram'
);

ALTER TABLE messenger_messages ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT 'messenger';

CREATE INDEX IF NOT EXISTS idx_messenger_messages_created
  ON messenger_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messenger_messages_psid
  ON messenger_messages (psid, created_at DESC);

-- Pristup ide isključivo serverski (direktna konekcija / service ključ).
ALTER TABLE messenger_messages ENABLE ROW LEVEL SECURITY;
