import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import * as schema from './schema';
import { getEnv } from '../env';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let sqlite: Database.Database | null = null;

export function getDb() {
	if (dbInstance === null) {
		const env = getEnv();
		const dir = path.dirname(env.databasePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		sqlite = new Database(env.databasePath);
		sqlite.pragma('journal_mode = WAL');
		sqlite.pragma('foreign_keys = ON');
		dbInstance = drizzle(sqlite, { schema });
	}
	return dbInstance;
}

export function closeDb(): void {
	if (sqlite !== null) {
		sqlite.close();
		sqlite = null;
		dbInstance = null;
	}
}