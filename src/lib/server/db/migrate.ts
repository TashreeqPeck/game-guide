import { getDb } from './client';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  oidc_issuer TEXT NOT NULL,
  oidc_sub TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS users_oidc_unique ON users (oidc_issuer, oidc_sub);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS games_owner_slug_unique ON games (owner_user_id, slug);

CREATE TABLE IF NOT EXISTS guides (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  source TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS guides_owner_game_slug_unique ON guides (owner_user_id, game_id, slug);

CREATE TABLE IF NOT EXISTS sections (
  id TEXT NOT NULL,
  guide_id TEXT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  parent_id TEXT,
  title TEXT,
  body_md TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  retired INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS sections_guide_id_unique ON sections (guide_id, id);

CREATE TABLE IF NOT EXISTS items (
  id TEXT NOT NULL,
  guide_id TEXT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  text TEXT NOT NULL,
  notes_md TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  "order" INTEGER NOT NULL DEFAULT 0,
  retired INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS items_guide_id_unique ON items (guide_id, id);
CREATE INDEX IF NOT EXISTS items_section_id_idx ON items (guide_id, section_id);

CREATE TABLE IF NOT EXISTS playthroughs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guide_id TEXT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_item_id TEXT
);

CREATE TABLE IF NOT EXISTS progress_events (
  id TEXT PRIMARY KEY NOT NULL,
  playthrough_id TEXT NOT NULL REFERENCES playthroughs(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  guide_id TEXT NOT NULL,
  action TEXT NOT NULL,
  at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS progress_events_playthrough_idx ON progress_events (playthrough_id, at);

CREATE TABLE IF NOT EXISTS item_state (
  playthrough_id TEXT NOT NULL REFERENCES playthroughs(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  guide_id TEXT NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS item_state_unique ON item_state (playthrough_id, item_id);
`;

function runStatement(sql: string): void {
	const db = getDb();
	const statements = sql
		.split(';')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
	for (const statement of statements) {
		try {
			db.$client.prepare(statement).run();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			if (message.includes('already exists')) {
				continue;
			}
			throw error;
		}
	}
}

export function migrate(): void {
	runStatement(SCHEMA_SQL);
}