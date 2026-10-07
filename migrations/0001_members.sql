-- Mümin Pusulası üyelik tablosu (Cloudflare D1)
CREATE TABLE IF NOT EXISTS members (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  google_sub      TEXT    NOT NULL UNIQUE,
  email           TEXT    NOT NULL,
  name            TEXT,
  picture         TEXT,
  language        TEXT    NOT NULL DEFAULT 'tr',
  country         TEXT,
  app_version     TEXT,
  device          TEXT,
  created_at      INTEGER NOT NULL,           -- unix saniye
  last_login_at   INTEGER NOT NULL,
  login_count     INTEGER NOT NULL DEFAULT 1,
  welcome_status  TEXT    NOT NULL DEFAULT 'pending',  -- pending | sent | failed
  welcome_sent_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_members_created ON members (created_at);
CREATE INDEX IF NOT EXISTS idx_members_email   ON members (email);
